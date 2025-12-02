const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
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


