const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Initializing Supabase in dashboardController...');
console.log('SUPABASE_URL exists:', !!supabaseUrl);
console.log('SUPABASE_KEY exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: Supabase credentials missing in dashboardController');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get Ministry Dashboard Statistics
exports.getMinistryStats = async (req, res) => {
    try {
        // Get total states
        const { data: states, error: statesError } = await supabase
            .from('states')
            .select('id');

        if (statesError) throw statesError;

        // Get total districts
        const { data: districts, error: districtsError } = await supabase
            .from('districts')
            .select('id');

        if (districtsError) throw districtsError;

        // Get all proposals
        const { data: proposals, error: proposalsError } = await supabase
            .from('district_proposals')
            .select('status');

        if (proposalsError) throw proposalsError;

        // Get total fund allocations
        const { data: fundAllocations, error: fundError } = await supabase
            .from('fund_allocations')
            .select('amount_allocated');

        if (fundError) throw fundError;

        // Calculate statistics
        const totalFundAllocated = fundAllocations.reduce((sum, item) => sum + (item.amount_allocated || 0), 0);

        // Count projects by status
        const projectsCompleted = proposals.filter(p =>
            p.status === 'APPROVED_BY_MINISTRY' || p.status === 'COMPLETED'
        ).length;

        const projectsOngoing = proposals.filter(p =>
            p.status === 'APPROVED_BY_STATE' || p.status === 'IN_PROGRESS'
        ).length;

        const projectsApproved = proposals.filter(p =>
            p.status === 'APPROVED_BY_STATE' || p.status === 'APPROVED_BY_MINISTRY'
        ).length;

        const projectsProposed = proposals.filter(p =>
            p.status === 'SUBMITTED' || p.status === 'PENDING'
        ).length;

        res.json({
            success: true,
            data: {
                totalStates: states.length,
                totalDistricts: districts.length,
                totalProjects: proposals.length,
                totalFundAllocated: totalFundAllocated,
                projectsCompleted,
                projectsOngoing,
                projectsApproved,
                projectsProposed
            }
        });

    } catch (error) {
        console.error('Error fetching ministry stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get State Dashboard Statistics
exports.getStateStats = async (req, res) => {
    try {
        const { stateName } = req.query;

        if (!stateName) {
            return res.status(400).json({ success: false, error: 'State name is required' });
        }

        console.log('📊 Fetching state stats for:', stateName);

        // 1. Get State ID
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            console.error('State not found:', stateName);
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        const stateId = stateData.id;

        // 2. Get all districts for this state
        const { data: districts, error: districtsError } = await supabase
            .from('districts')
            .select('*')
            .eq('state_id', stateId);

        if (districtsError) {
            console.error('Error fetching districts:', districtsError);
            return res.status(500).json({ success: false, error: districtsError.message });
        }

        const totalDistricts = districts.length;
        const districtIds = districts.map(d => d.id);

        // 3. Get total funds released to this state from Ministry
        const { data: stateFundReleases, error: stateFundError } = await supabase
            .from('state_fund_releases')
            .select('amount_rupees')
            .eq('state_id', stateId);

        // Calculate total funds received (from Ministry to State)
        const totalFundReceived = stateFundReleases
            ? stateFundReleases.reduce((sum, item) => sum + (parseInt(item.amount_rupees) || 0), 0)
            : 0;

        // 4. Get fund releases to districts (State to Districts)
        const { data: districtFundReleases, error: districtFundError } = await supabase
            .from('fund_releases')
            .select('*, districts(name)')
            .in('district_id', districtIds);

        // Calculate total funds released to districts by this state
        const totalFundReleased = districtFundReleases
            ? districtFundReleases.reduce((sum, item) => sum + (parseInt(item.amount_rupees) || 0), 0)
            : 0;

        // Calculate fund utilized percentage
        const fundUtilizedPercentage = totalFundReceived > 0
            ? Math.round((totalFundReleased / totalFundReceived) * 100)
            : 0;

        // 5. Count districts that have received funds (districts reporting)
        const districtsReporting = districtFundReleases
            ? new Set(districtFundReleases.map(d => d.district_id)).size
            : 0;

        // 6. Get proposals from districts in this state
        const { data: proposals, error: proposalsError } = await supabase
            .from('district_proposals')
            .select('*')
            .in('district_id', districtIds);

        // Count pending approvals (submitted by district, pending state approval)
        const pendingApprovals = proposals
            ? proposals.filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING_REVIEW').length
            : 0;

        // 7. Build district fund status table
        const districtFundStatus = [];

        for (const district of districts) {
            // Get fund releases for this district
            const districtReleases = districtFundReleases
                ? districtFundReleases.filter(r => r.district_id === district.id)
                : [];

            const fundReleased = districtReleases.reduce((sum, r) => sum + (parseInt(r.amount_rupees) || 0), 0);

            // Get proposals for this district
            const districtProposals = proposals ? proposals.filter(p => p.district_id === district.id) : [];
            const approvedProposals = districtProposals.filter(p =>
                p.status === 'APPROVED_BY_MINISTRY' || p.status === 'APPROVED_BY_STATE'
            );

            // Calculate fund utilized (sum of approved proposal costs)
            const fundUtilized = approvedProposals.reduce((sum, p) => {
                const cost = parseFloat(p.estimated_cost) || 0;
                return sum + (cost * 100000); // Convert Lakhs to Rupees
            }, 0);

            const utilizationPercent = fundReleased > 0
                ? Math.round((fundUtilized / fundReleased) * 100)
                : 0;

            // Check if UC uploaded (placeholder - you may have a uc_uploads table)
            const ucUploaded = false; // TODO: Check UC uploads table

            districtFundStatus.push({
                districtName: district.name,
                fundReleased: fundReleased,
                fundUtilized: fundUtilized,
                utilizationPercent: utilizationPercent,
                projectStatus: utilizationPercent > 50 ? 'On Track' : 'Needs Attention',
                ucUploaded: ucUploaded
            });
        }

        console.log('✅ State stats calculated:', {
            totalFundReceived,
            fundUtilizedPercentage,
            districtsReporting,
            pendingApprovals
        });

        res.json({
            success: true,
            data: {
                totalFundReceived: totalFundReceived,
                fundUtilizedPercentage: fundUtilizedPercentage,
                districtsReporting: districtsReporting,
                totalDistricts: totalDistricts,
                pendingApprovals: pendingApprovals,
                districtFundStatus: districtFundStatus
            }
        });

    } catch (error) {
        console.error('Error fetching state stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get District Dashboard Statistics
exports.getDistrictStats = async (req, res) => {
    try {
        const { districtId } = req.params;

        if (!districtId) {
            return res.status(400).json({ success: false, error: 'District ID is required' });
        }

        console.log('📊 Fetching district stats for district ID:', districtId);

        // 1. Get district info
        const { data: districtInfo, error: districtError } = await supabase
            .from('districts')
            .select('id, name, state_id')
            .eq('id', districtId)
            .single();

        if (districtError || !districtInfo) {
            console.error('Error fetching district info:', districtError);
            return res.status(404).json({ success: false, error: 'District not found' });
        }

        // 2. Get total funds allocated to this district
        const { data: fundReleases, error: fundsError } = await supabase
            .from('fund_releases')
            .select('amount_cr, amount_rupees')
            .eq('district_id', districtId);

        if (fundsError) {
            console.error('Error fetching fund releases:', fundsError);
        }

        const totalFundsAllocated = fundReleases?.reduce((sum, item) => sum + (parseFloat(item.amount_cr) || 0), 0) || 0;

        // 3. Get work orders for this district
        const { data: workOrders, error: workOrdersError } = await supabase
            .from('work_orders')
            .select('id')
            .eq('district_id', districtId);

        if (workOrdersError) {
            console.error('Error fetching work orders:', workOrdersError);
        }

        const workOrderIds = workOrders ? workOrders.map(wo => wo.id) : [];

        // 4. Get latest fund utilization from work_progress
        let totalFundsUtilized = 0;
        if (workOrderIds.length > 0) {
            const { data: progressData, error: progressError } = await supabase
                .from('work_progress')
                .select('work_order_id, funds_used')
                .in('work_order_id', workOrderIds)
                .order('created_at', { ascending: false });

            if (progressError) {
                console.error('Error fetching progress:', progressError);
            } else if (progressData) {
                // Get the latest progress for each work order
                const latestProgressMap = {};
                progressData.forEach(progress => {
                    if (!latestProgressMap[progress.work_order_id]) {
                        latestProgressMap[progress.work_order_id] = progress.funds_used || 0;
                    }
                });

                totalFundsUtilized = Object.values(latestProgressMap).reduce((sum, val) => sum + val, 0);
            }
        }

        // Convert totalFundsUtilized from rupees to crores for consistency
        const totalFundsUtilizedCr = totalFundsUtilized / 10000000;

        // 5. Calculate utilization percentage
        const utilizationPercentage = totalFundsAllocated > 0
            ? Math.round((totalFundsUtilizedCr / totalFundsAllocated) * 100)
            : 0;

        console.log('📊 District Stats:', {
            districtName: districtInfo.name,
            fundAllocated: totalFundsAllocated,
            fundUtilized: totalFundsUtilizedCr,
            utilizationPercentage
        });

        res.json({
            success: true,
            data: {
                districtName: districtInfo.name,
                gramPanchayats: 0, // Placeholder
                totalProjects: workOrderIds.length,
                fundAllocated: totalFundsAllocated,
                fundUtilized: totalFundsUtilizedCr,
                fundRemaining: totalFundsAllocated - totalFundsUtilizedCr,
                utilizationPercentage,
                completedProjects: 0 // Placeholder - would need project status tracking
            }
        });

    } catch (error) {
        console.error('Error fetching district stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get All Projects (Unified)
exports.getAllProjects = async (req, res) => {
    try {
        console.log('📊 Fetching all projects (unified)...');

        // 1. Fetch work orders with related data
        const { data: works, error: workError } = await supabase
            .from('work_orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (workError) throw workError;

        // 2. Fetch approved projects
        const { data: approvedProjects, error: approvedError } = await supabase
            .from('approved_projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (approvedError) {
            console.error('Error fetching approved projects:', approvedError);
            // Non-blocking error
        }

        // 3. Fetch village fund releases
        const { data: villageFunds, error: villageError } = await supabase
            .from('village_fund_releases')
            .select('*')
            .order('created_at', { ascending: false });

        if (villageError) {
            console.error('Error fetching village funds:', villageError);
            // Non-blocking error
        }

        let allProjects = [];

        // Process work orders
        if (works && works.length > 0) {
            // Get unique implementing agency IDs
            const agencyIds = [...new Set(works.map(w => w.implementing_agency_id).filter(Boolean))];

            // Fetch implementing agencies
            let agencyMap = {};
            if (agencyIds.length > 0) {
                const { data: agencies, error: agencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name, district_name, state_name')
                    .in('id', agencyIds);

                if (!agencyError && agencies) {
                    agencies.forEach(agency => {
                        agencyMap[agency.id] = agency;
                    });
                }
            }

            // Fetch executing agencies
            const eaIds = [...new Set(works.map(w => w.executing_agency_id).filter(Boolean))];

            let eaMap = {};
            if (eaIds.length > 0) {
                const { data: eas, error: eaError } = await supabase
                    .from('executing_agencies')
                    .select('id, agency_name')
                    .in('id', eaIds);

                if (!eaError && eas) {
                    eas.forEach(ea => {
                        eaMap[ea.id] = ea;
                    });
                }
            }

            // Fetch district proposals manually for project names
            const proposalIds = [...new Set(works.map(w => w.proposal_id).filter(Boolean))];
            let proposalMap = {};

            if (proposalIds.length > 0) {
                const { data: proposals, error: proposalError } = await supabase
                    .from('district_proposals')
                    .select('id, project_name, component, district_id')
                    .in('id', proposalIds);

                if (!proposalError && proposals) {
                    proposals.forEach(p => {
                        proposalMap[p.id] = p;
                    });
                }
            }

            // Merge work order data
            const enrichedWorks = works.map(work => {
                const proposal = proposalMap[work.proposal_id] || {};
                const agency = agencyMap[work.implementing_agency_id] || {};

                return {
                    id: work.id,
                    project_type: 'work_order',
                    title: proposal.project_name || work.title,
                    location: work.location,
                    component: [proposal.component || 'Infrastructure'],
                    agency_name: agency.agency_name || 'Unassigned',
                    executing_agency_name: eaMap[work.executing_agency_id]?.agency_name,
                    amount: work.amount,
                    funds_released: work.funds_released,
                    status: work.status,
                    deadline: work.deadline, // Explicitly expose deadline
                    // Location data for filtering
                    state_name: agency.state_name,
                    district_name: agency.district_name || (proposal.district_id ? `District ${proposal.district_id}` : undefined),
                    original_data: work
                };
            });

            allProjects = [...allProjects, ...enrichedWorks];
        }

        // Process approved projects
        if (approvedProjects && approvedProjects.length > 0) {
            const enrichedApproved = approvedProjects.map(project => ({
                id: project.id,
                project_type: 'approved_project',
                title: project.project_name,
                location: project.district_name || project.state_name,
                component: [project.component],
                agency_name: project.approved_by || 'Ministry',
                amount: project.total_amount,
                funds_released: project.amount_released || project.released_amount,
                status: project.status,
                deadline: project.approved_at, // Use approved_at as deadline fallback
                state_name: project.state_name,
                district_name: project.district_name,
                original_data: project
            }));

            allProjects = [...allProjects, ...enrichedApproved];
        }

        // Process village fund releases
        if (villageFunds && villageFunds.length > 0) {
            const enrichedVillageFunds = villageFunds.map(fund => ({
                id: fund.id,
                project_type: 'village_fund',
                title: fund.village_name + ' Fund Allocation',
                location: fund.village_name,
                component: fund.component || [],
                agency_name: 'District Admin',
                amount: fund.amount_allocated,
                funds_released: fund.amount_released,
                status: fund.status,
                deadline: fund.release_date, // Use release_date as deadline fallback
                state_name: fund.state_name,
                district_name: fund.district_name,
                village_name: fund.village_name, // Specific for village filter
                original_data: fund
            }));

            allProjects = [...allProjects, ...enrichedVillageFunds];
        }

        res.json({
            success: true,
            count: allProjects.length,
            data: allProjects
        });

    } catch (error) {
        console.error('Error fetching all projects:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
