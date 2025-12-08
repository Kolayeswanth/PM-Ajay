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

// Get Fund Flow Data with filters
// Get unique scheme components from database
exports.getSchemeComponents = async (req, res) => {
    try {
        console.log('📋 Fetching unique scheme components from database...');

        // Fetch all fund allocations to get scheme components
        const { data: fundAllocations, error: allocError } = await supabase
            .from('fund_allocations')
            .select('scheme_components');

        if (allocError) {
            console.error('Error fetching fund allocations:', allocError);
            return res.status(500).json({ success: false, error: allocError.message });
        }

        // Extract unique components from the scheme_components arrays
        const componentsSet = new Set();
        fundAllocations.forEach(allocation => {
            if (allocation.scheme_components && Array.isArray(allocation.scheme_components)) {
                allocation.scheme_components.forEach(component => {
                    if (component && component.trim()) {
                        componentsSet.add(component.trim());
                    }
                });
            }
        });

        // Convert Set to sorted array
        const uniqueComponents = Array.from(componentsSet).sort();

        console.log(`✅ Found ${uniqueComponents.length} unique components:`, uniqueComponents);

        res.json({
            success: true,
            data: uniqueComponents
        });
    } catch (error) {
        console.error('❌ Error in getSchemeComponents:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get fund flow data with comprehensive filters
exports.getFundFlow = async (req, res) => {
    try {
        const { 
            state, 
            district, 
            component, 
            year, 
            startDate, 
            endDate, 
            minAmount, 
            maxAmount, 
            status 
        } = req.query;
        
        console.log('📊 Fetching fund flow data with filters:', { 
            state, district, component, year, startDate, endDate, minAmount, maxAmount, status 
        });

        // Get state and district IDs if filters are provided
        let stateId = null;
        let districtId = null;

        if (state) {
            const { data: stateData, error: stateError } = await supabase
                .from('states')
                .select('id, name')
                .eq('name', state)
                .single();
            if (!stateError && stateData) {
                stateId = stateData.id;
            }
        }

        if (district) {
            const { data: districtData, error: districtError } = await supabase
                .from('districts')
                .select('id, name, state_id')
                .eq('name', district)
                .single();
            if (!districtError && districtData) {
                districtId = districtData.id;
                if (!stateId) stateId = districtData.state_id;
            }
        }

        // 1. Get fund allocations from ministry to states
        const { data: fundAllocations, error: allocError } = await supabase
            .from('fund_allocations')
            .select('*');

        if (allocError) {
            console.error('Error fetching fund allocations:', allocError);
        }

        // 2. Get state fund releases (only joins with states, not districts)
        const { data: stateFundReleases, error: stateReleaseError } = await supabase
            .from('state_fund_releases')
            .select('*, states(name)');

        if (stateReleaseError) {
            console.error('Error fetching state fund releases:', stateReleaseError);
        }

        // 3. Get district fund releases
        const { data: districtFundReleases, error: distReleaseError } = await supabase
            .from('fund_releases')
            .select('*, districts(name, state_id)');

        if (distReleaseError) {
            console.error('Error fetching district fund releases:', distReleaseError);
        }

        // 4. Get village fund releases
        const { data: villageFunds, error: villageFundsError } = await supabase
            .from('village_fund_releases')
            .select('*');

        if (villageFundsError) {
            console.error('Error fetching village fund releases:', villageFundsError);
        }

        // Get all states and districts for mapping
        const { data: allStates } = await supabase.from('states').select('id, name');
        const { data: allDistricts } = await supabase.from('districts').select('id, name, state_id');
        
        const stateMap = allStates?.reduce((acc, s) => { acc[s.id] = s.name; return acc; }, {}) || {};
        const districtMap = allDistricts?.reduce((acc, d) => { acc[d.id] = { name: d.name, state_id: d.state_id }; return acc; }, {}) || {};

        // Apply filters to fund allocations
        let filteredAllocations = fundAllocations || [];
        
        if (state) {
            filteredAllocations = filteredAllocations.filter(alloc => alloc.state_name === state);
        }

        if (component) {
            filteredAllocations = filteredAllocations.filter(alloc => 
                alloc.scheme_components && alloc.scheme_components.includes(component)
            );
        }

        if (startDate) {
            filteredAllocations = filteredAllocations.filter(alloc => 
                alloc.allocation_date && alloc.allocation_date >= startDate
            );
        }

        if (endDate) {
            filteredAllocations = filteredAllocations.filter(alloc => 
                alloc.allocation_date && alloc.allocation_date <= endDate
            );
        }
        
        if (minAmount) {
            const minAmountRupees = parseFloat(minAmount) * 10000000;
            filteredAllocations = filteredAllocations.filter(alloc => 
                parseFloat(alloc.amount_allocated) >= minAmountRupees
            );
        }
        
        if (maxAmount) {
            const maxAmountRupees = parseFloat(maxAmount) * 10000000;
            filteredAllocations = filteredAllocations.filter(alloc => 
                parseFloat(alloc.amount_allocated) <= maxAmountRupees
            );
        }

        // Apply filters to state fund releases
        let filteredStateReleases = stateFundReleases || [];
        
        if (stateId) {
            filteredStateReleases = filteredStateReleases.filter(release => release.state_id === stateId);
        }

        if (component) {
            filteredStateReleases = filteredStateReleases.filter(release => 
                release.component && release.component.includes(component)
            );
        }

        if (startDate) {
            filteredStateReleases = filteredStateReleases.filter(release => 
                release.release_date && release.release_date >= startDate
            );
        }

        if (endDate) {
            filteredStateReleases = filteredStateReleases.filter(release => 
                release.release_date && release.release_date <= endDate
            );
        }
        
        if (minAmount) {
            filteredStateReleases = filteredStateReleases.filter(release => 
                parseFloat(release.amount_cr) >= parseFloat(minAmount)
            );
        }
        
        if (maxAmount) {
            filteredStateReleases = filteredStateReleases.filter(release => 
                parseFloat(release.amount_cr) <= parseFloat(maxAmount)
            );
        }

        // Apply filters to district fund releases
        let filteredDistrictReleases = districtFundReleases || [];
        
        if (districtId) {
            filteredDistrictReleases = filteredDistrictReleases.filter(release => release.district_id === districtId);
        }

        if (component) {
            filteredDistrictReleases = filteredDistrictReleases.filter(release => 
                release.component && release.component.includes(component)
            );
        }

        if (startDate) {
            filteredDistrictReleases = filteredDistrictReleases.filter(release => 
                release.release_date && release.release_date >= startDate
            );
        }

        if (endDate) {
            filteredDistrictReleases = filteredDistrictReleases.filter(release => 
                release.release_date && release.release_date <= endDate
            );
        }

        // Apply filters to village fund releases
        let filteredVillageFunds = villageFunds || [];
        
        if (state) {
            filteredVillageFunds = filteredVillageFunds.filter(fund => fund.state_name === state);
        }

        if (district) {
            filteredVillageFunds = filteredVillageFunds.filter(fund => fund.district_name === district);
        }

        if (component) {
            filteredVillageFunds = filteredVillageFunds.filter(fund => 
                fund.component && fund.component.includes(component)
            );
        }

        if (startDate) {
            filteredVillageFunds = filteredVillageFunds.filter(fund => 
                fund.release_date && fund.release_date >= startDate
            );
        }

        if (endDate) {
            filteredVillageFunds = filteredVillageFunds.filter(fund => 
                fund.release_date && fund.release_date <= endDate
            );
        }

        if (status) {
            filteredVillageFunds = filteredVillageFunds.filter(fund => fund.status === status);
        }

        // Aggregate data for visualization using filtered data
        const ministryToStateFlow = filteredAllocations?.reduce((acc, alloc) => {
            const stateName = alloc.state_name;
            if (!acc[stateName]) {
                acc[stateName] = {
                    state: stateName,
                    allocated: 0,
                    released: 0,
                    count: 0
                };
            }
            acc[stateName].allocated += parseFloat(alloc.amount_allocated) || 0;
            acc[stateName].released += parseFloat(alloc.amount_released) || 0;
            acc[stateName].count += 1;
            return acc;
        }, {}) || {};

        // Get all states and districts for state_fund_releases mapping
        const { data: allStates } = await supabase.from('states').select('id, name');
        const { data: allDistricts } = await supabase.from('districts').select('id, name, state_id');
        
        const stateMap = allStates?.reduce((acc, s) => { acc[s.id] = s.name; return acc; }, {}) || {};
        const districtMap = allDistricts?.reduce((acc, d) => { acc[d.id] = { name: d.name, state_id: d.state_id }; return acc; }, {}) || {};

        const stateToDistrictFlow = filteredStateReleases?.reduce((acc, release) => {
            const stateName = stateMap[release.state_id] || 'Unknown State';
            // state_fund_releases doesn't have district info, so we'll aggregate by state
            const key = `${stateName}_Total`;
            if (!acc[key]) {
                acc[key] = {
                    state: stateName,
                    district: 'All Districts',
                    released: 0,
                    count: 0
                };
            }
            acc[key].released += parseFloat(release.amount_cr || 0) * 10000000;
            acc[key].count += 1;
            return acc;
        }, {}) || {};

        const districtToProjectFlow = districtFundReleases?.reduce((acc, release) => {
            const districtInfo = districtMap[release.district_id];
            const districtName = districtInfo?.name || 'Unknown District';
            const key = `${release.district_id}_${districtName}`;
            if (!acc[key]) {
                acc[key] = {
                    district_id: release.district_id,
                    district_name: districtName,
                    released: 0,
                    count: 0
                };
            }
            acc[key].released += parseFloat(release.amount_cr || 0) * 10000000;
            acc[key].count += 1;
            return acc;
        }, {}) || {};

        // Aggregate village-level fund releases
        const villageToProjectFlow = villageFunds?.reduce((acc, release) => {
            const villageName = release.village_name || 'Unknown Village';
            if (!acc[villageName]) {
                acc[villageName] = {
                    village: villageName,
                    district: release.district_name,
                    state: release.state_name,
                    released: 0,
                    utilized: 0,
                    count: 0
                };
            }
            acc[villageName].released += parseFloat(release.amount_released) || 0;
            acc[villageName].utilized += parseFloat(release.amount_utilized) || 0;
            acc[villageName].count += 1;
            return acc;
        }, {}) || {};

        // 6. Calculate summary statistics
        const totalAllocatedByMinistry = Object.values(ministryToStateFlow)
            .reduce((sum, item) => sum + item.allocated, 0);

        const totalReleasedByStates = Object.values(stateToDistrictFlow)
            .reduce((sum, item) => sum + item.released, 0);

        const totalReleasedByDistricts = Object.values(districtToProjectFlow)
            .reduce((sum, item) => sum + item.released, 0);

        const totalReleasedToVillages = Object.values(villageToProjectFlow)
            .reduce((sum, item) => sum + item.released, 0);

        const totalUtilizedByVillages = Object.values(villageToProjectFlow)
            .reduce((sum, item) => sum + item.utilized, 0);

        console.log('✅ Fund flow data calculated successfully');

        res.json({
            success: true,
            data: {
                summary: {
                    totalAllocatedByMinistry: totalAllocatedByMinistry / 10000000, // Convert to crores
                    totalReleasedByStates: totalReleasedByStates / 10000000,
                    totalReleasedByDistricts: totalReleasedByDistricts / 10000000,
                    totalReleasedToAgencies: totalReleasedToVillages / 10000000,
                    totalUtilized: totalUtilizedByVillages / 10000000,
                    efficiency: totalAllocatedByMinistry > 0 
                        ? ((totalReleasedByStates / totalAllocatedByMinistry) * 100).toFixed(2)
                        : 0,
                    utilizationRate: totalReleasedToVillages > 0
                        ? ((totalUtilizedByVillages / totalReleasedToVillages) * 100).toFixed(2)
                        : 0
                },
                flows: {
                    ministryToState: Object.values(ministryToStateFlow),
                    stateToDistrict: Object.values(stateToDistrictFlow),
                    districtToProject: Object.values(districtToProjectFlow),
                    agencyAllocations: Object.values(villageToProjectFlow)
                },
                filters: {
                    state,
                    district
                }
            }
        });

    } catch (error) {
        console.error('Error fetching fund flow data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
