const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get district statistics
exports.getDistrictStats = async (req, res) => {
    try {
        const { districtId } = req.params;

        if (!districtId) {
            return res.status(400).json({ success: false, error: 'District ID is required' });
        }

        // 1. Get total proposals (projects) for this district
        const { data: proposals, error: proposalsError } = await supabase
            .from('district_proposals')
            .select('*')
            .eq('district_id', districtId);

        if (proposalsError) {
            console.error('Error fetching proposals:', proposalsError);
        }

        const totalProjects = proposals ? proposals.length : 0;
        const completedProjects = proposals ? proposals.filter(p => p.status === 'APPROVED_BY_MINISTRY').length : 0;

        // 2. Get total funds allocated to this district
        const { data: fundReleases, error: fundsError } = await supabase
            .from('fund_releases')
            .select('amount_cr')
            .eq('district_id', districtId);

        if (fundsError) {
            console.error('Error fetching funds:', fundsError);
        }

        const totalFundsAllocated = fundReleases
            ? fundReleases.reduce((sum, item) => sum + (item.amount_cr || 0), 0)
            : 0;

        // 3. Get GP count - for now, we'll use a placeholder
        // You can add a gp_assignments table later if needed
        const gramPanchayats = 42; // Placeholder

        res.json({
            success: true,
            data: {
                gramPanchayats,
                totalProjects,
                fundAllocated: totalFundsAllocated,
                completedProjects
            }
        });

    } catch (error) {
        console.error('Error fetching district stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Placeholder for Ministry Dashboard Stats
exports.getMinistryDashboardStats = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                totalStates: 0,
                totalDistricts: 0,
                totalFundsAllocated: 0,
                totalProjects: 0
            }
        });
    } catch (error) {
        console.error('Error fetching ministry stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// State Dashboard Stats
exports.getStateDashboardStats = async (req, res) => {
    try {
        const { stateName } = req.query;

        if (!stateName) {
            return res.status(400).json({ success: false, error: 'State name is required' });
        }

        // 1. Get State ID
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        // 2. Get total fund received by state from ministry
        const { data: stateFundReleases, error: stateReleaseError } = await supabase
            .from('state_fund_releases')
            .select('amount_rupees, states!inner(name)')
            .eq('states.name', stateName);

        const totalFundReceived = stateFundReleases
            ? stateFundReleases.reduce((sum, item) => sum + (item.amount_rupees || 0), 0)
            : 0;

        // 3. Get districts in state
        const { data: districts, error: districtsError } = await supabase
            .from('districts')
            .select('id, name')
            .eq('state_id', stateData.id);

        const totalDistricts = districts ? districts.length : 0;
        const districtIds = districts ? districts.map(d => d.id) : [];

        // 4. Get total fund released to districts
        const { data: fundReleases, error: releaseError } = await supabase
            .from('fund_releases')
            .select('amount_cr, amount_rupees, district_id')
            .in('district_id', districtIds);

        const totalFundReleased = fundReleases
            ? fundReleases.reduce((sum, item) => sum + (item.amount_rupees || 0), 0)
            : 0;

        const fundUtilizedPercentage = totalFundReceived > 0
            ? ((totalFundReleased / totalFundReceived) * 100).toFixed(1)
            : 0;

        // 5. Count districts that have received funds
        const districtsReporting = fundReleases
            ? new Set(fundReleases.map(r => r.district_id)).size
            : 0;

        // 6. Get pending proposals (SUBMITTED status)
        const { data: proposals, error: proposalsError } = await supabase
            .from('district_proposals')
            .select('status, district_id')
            .in('district_id', districtIds)
            .eq('status', 'SUBMITTED');

        const pendingApprovals = proposals ? proposals.length : 0;

        // 7. Build district-wise fund status
        const districtFundStatus = [];
        if (districts && fundReleases) {
            const districtMap = {};
            fundReleases.forEach(release => {
                if (!districtMap[release.district_id]) {
                    districtMap[release.district_id] = 0;
                }
                districtMap[release.district_id] += (release.amount_rupees || 0);
            });

            districts.forEach(district => {
                const fundReleased = districtMap[district.id] || 0;
                districtFundStatus.push({
                    districtName: district.name,
                    fundReleased,
                    fundUtilized: 0, // Placeholder
                    utilizationPercent: 0,
                    projectStatus: 'On Track',
                    ucUploaded: false
                });
            });
        }

        res.json({
            success: true,
            data: {
                totalFundReceived,
                fundUtilizedPercentage: parseFloat(fundUtilizedPercentage),
                districtsReporting,
                totalDistricts,
                pendingApprovals,
                districtFundStatus
            }
        });
    } catch (error) {
        console.error('Error fetching state stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

