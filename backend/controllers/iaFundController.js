const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all projects assigned to IAs with fund release details
exports.getProjectsForFundRelease = async (req, res) => {
    try {
        const { stateId } = req.query;

        if (!stateId) {
            return res.status(400).json({ success: false, error: 'State ID is required' });
        }

        console.log('📋 Fetching projects assigned to IAs for state:', stateId);

        // Get all districts in this state
        const { data: stateDistricts, error: districtError } = await supabase
            .from('districts')
            .select('id')
            .eq('state_id', stateId);

        if (districtError) throw districtError;

        const districtIds = stateDistricts.map(d => d.id);

        console.log('🔍 Searching for projects in districts:', districtIds);

        // Get all district proposals that are APPROVED and assigned to IAs
        const { data: projects, error: projectError} = await supabase
            .from('district_proposals')
            .select(`
                id,
                project_name,
                component,
                allocated_amount,
                released_amount,
                implementing_agency_id,
                district_id,
                status,
                approved_at,
                created_at
            `)
            .in('district_id', districtIds)
            .not('implementing_agency_id', 'is', null)
            .eq('status', 'APPROVED');

        if (projectError) throw projectError;

        console.log(`✅ Found ${projects?.length || 0} APPROVED projects with IAs assigned`);

        // Get IA details for each project
        const projectsWithIA = await Promise.all(
            projects.map(async (project) => {
                const { data: ia, error: iaError } = await supabase
                    .from('implementing_agencies')
                    .select(`
                        id,
                        agency_name,
                        email,
                        districts (
                            id,
                            name
                        )
                    `)
                    .eq('id', project.implementing_agency_id)
                    .single();

                if (iaError) {
                    console.error('Error fetching IA:', iaError);
                    return null;
                }

                // Get fund release history for this project
                let releases = [];
                let totalReleased = parseFloat(project.released_amount || 0);
                
                // Try to fetch release history (table might not exist yet)
                try {
                    const { data: releaseData, error: releaseError } = await supabase
                        .from('ia_fund_releases')
                        .select('*')
                        .eq('project_id', project.id)
                        .order('created_at', { ascending: false });

                    if (!releaseError && releaseData) {
                        releases = releaseData;
                        totalReleased = releases.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
                    }
                } catch (err) {
                    console.log('ia_fund_releases table not yet created, using released_amount from project');
                }

                const pendingAmount = parseFloat(project.allocated_amount || 0) - totalReleased;

                return {
                    id: project.id,
                    project_name: project.project_name,
                    component: project.component,
                    allocated_amount: parseFloat(project.allocated_amount || 0),
                    total_released: totalReleased,
                    pending_amount: pendingAmount,
                    district_name: ia?.districts?.name || 'Unknown',
                    ia_id: ia?.id,
                    ia_name: ia?.agency_name,
                    ia_email: ia?.email,
                    status: project.status,
                    approved_at: project.approved_at,
                    releases: releases || []
                };
            })
        );

        const validProjects = projectsWithIA.filter(p => p !== null);

        console.log(`✅ Found ${validProjects.length} projects assigned to IAs`);
        res.json({ success: true, data: validProjects });

    } catch (error) {
        console.error('Error in getProjectsForFundRelease:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Release fund to IA
exports.releaseFundToIA = async (req, res) => {
    try {
        const { 
            projectId, 
            iaId, 
            amount, 
            installmentNumber,
            sanctionOrderNo,
            remarks 
        } = req.body;

        console.log('💰 Releasing fund to IA:', { projectId, iaId, amount, installmentNumber });

        // Validate inputs
        if (!projectId || !iaId || !amount || !installmentNumber || !sanctionOrderNo) {
            return res.status(400).json({ 
                success: false, 
                error: 'Project ID, IA ID, amount, installment number, and sanction order are required' 
            });
        }

        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('district_proposals')
            .select('allocated_amount, implementing_agency_id')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Verify IA is assigned to this project
        if (project.implementing_agency_id !== iaId) {
            return res.status(400).json({ 
                success: false, 
                error: 'This IA is not assigned to this project' 
            });
        }

        // Check existing releases
        let totalReleased = 0;
        try {
            const { data: existingReleases, error: releaseError } = await supabase
                .from('ia_fund_releases')
                .select('amount')
                .eq('project_id', projectId);

            if (!releaseError && existingReleases) {
                totalReleased = existingReleases.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
            }
        } catch (err) {
            console.log('ia_fund_releases table not yet created, will create first release');
        }

        const newTotal = totalReleased + parseFloat(amount);

        // Validate amount doesn't exceed allocated
        if (newTotal > parseFloat(project.allocated_amount)) {
            return res.status(400).json({ 
                success: false, 
                error: `Total release amount (₹${newTotal.toLocaleString()}) cannot exceed allocated amount (₹${parseFloat(project.allocated_amount).toLocaleString()})` 
            });
        }

        // Create fund release record (if table exists)
        let release = null;
        try {
            const { data: releaseData, error: insertError } = await supabase
                .from('ia_fund_releases')
                .insert([{
                    project_id: projectId,
                    ia_id: iaId,
                    amount: parseFloat(amount),
                    installment_number: installmentNumber,
                    sanction_order_no: sanctionOrderNo,
                    remarks: remarks || null,
                    released_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating release record:', insertError);
                throw new Error('Please create the ia_fund_releases table first');
            }
            
            release = releaseData;
        } catch (err) {
            return res.status(500).json({ 
                success: false, 
                error: 'Please run the database migration to create ia_fund_releases table. Check the SQL file in backend/migrations/' 
            });
        }

        // Update district_proposals released_amount
        const { error: updateError } = await supabase
            .from('district_proposals')
            .update({ released_amount: newTotal })
            .eq('id', projectId);

        if (updateError) throw updateError;

        console.log('✅ Fund released successfully:', release.id);
        res.json({ 
            success: true, 
            message: 'Fund released successfully',
            data: release 
        });

    } catch (error) {
        console.error('Error in releaseFundToIA:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get fund release history
exports.getIAFundReleaseHistory = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ success: false, error: 'Project ID is required' });
        }

        let releases = [];
        try {
            const { data: releaseData, error } = await supabase
                .from('ia_fund_releases')
                .select(`
                    *,
                    implementing_agencies (
                        agency_name,
                        email
                    )
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (!error && releaseData) {
                releases = releaseData;
            }
        } catch (err) {
            console.log('ia_fund_releases table not yet created');
        }

        res.json({ success: true, data: releases });

    } catch (error) {
        console.error('Error in getIAFundReleaseHistory:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getProjectsForFundRelease: exports.getProjectsForFundRelease,
    releaseFundToIA: exports.releaseFundToIA,
    getIAFundReleaseHistory: exports.getIAFundReleaseHistory
};
