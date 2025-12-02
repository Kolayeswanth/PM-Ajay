const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get national overview statistics
exports.getNationalOverview = async (req, res) => {
    try {
        const { component } = req.query;

        // Fetch total fund allocations
        let fundQuery = supabase
            .from('fund_allocations')
            .select('amount_allocated, amount_released');

        if (component && component !== 'All Components') {
            fundQuery = fundQuery.contains('component', [component]);
        }

        const { data: fundData, error: fundError } = await fundQuery;

        if (fundError) throw fundError;

        const totalAllocated = fundData.reduce((sum, item) => sum + (item.amount_allocated || 0), 0);
        const totalReleased = fundData.reduce((sum, item) => sum + (item.amount_released || 0), 0);
        const utilization = totalAllocated > 0 ? Math.round((totalReleased / totalAllocated) * 100) : 0;

        // Fetch proposals statistics
        let proposalQuery = supabase
            .from('district_proposals')
            .select('status, component');

        if (component && component !== 'All Components') {
            proposalQuery = proposalQuery.eq('component', component);
        }

        const { data: proposals, error: proposalError } = await proposalQuery;

        if (proposalError) throw proposalError;

        const totalProposals = proposals.length;
        const completedProposals = proposals.filter(p =>
            p.status === 'APPROVED_BY_MINISTRY' || p.status === 'COMPLETED'
        ).length;
        const completedPercentage = totalProposals > 0 ? Math.round((completedProposals / totalProposals) * 100) : 0;

        // Mock beneficiaries (you can add a real table for this later)
        const beneficiaries = component === 'Adarsh Gram' ? '450K'
            : component === 'GIA' ? '520K'
                : component === 'Hostel' ? '230K'
                    : '1.2M';

        res.json({
            success: true,
            data: {
                utilization,
                completed: completedPercentage,
                beneficiaries,
                totalAllocated: (totalAllocated / 10000000).toFixed(2), // Convert to Crores
                totalReleased: (totalReleased / 10000000).toFixed(2)
            }
        });

    } catch (error) {
        console.error('Error fetching national overview:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get state-specific progress data
exports.getStateProgress = async (req, res) => {
    try {
        const { stateName } = req.params;

        if (!stateName) {
            return res.status(400).json({ success: false, error: 'State name is required' });
        }

        // Get state ID
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        // Get fund allocations for this state
        const { data: fundData, error: fundError } = await supabase
            .from('fund_allocations')
            .select('amount_allocated, amount_released, component')
            .eq('state_name', stateName);

        if (fundError) throw fundError;

        const totalAllocated = fundData.reduce((sum, item) => sum + (item.amount_allocated || 0), 0);
        const totalReleased = fundData.reduce((sum, item) => sum + (item.amount_released || 0), 0);

        // Get districts in this state
        const { data: districts, error: districtError } = await supabase
            .from('districts')
            .select('id')
            .eq('state_id', stateData.id);

        if (districtError) throw districtError;

        const districtIds = districts.map(d => d.id);

        // Get proposals for these districts
        const { data: proposals, error: proposalError } = await supabase
            .from('district_proposals')
            .select('status, component, created_at')
            .in('district_id', districtIds);

        if (proposalError) throw proposalError;

        // Calculate component-wise progress
        const components = {
            'Adarsh Gram': { progress: 0, color: '#7C3AED' },
            'GIA': { progress: 0, color: '#EC4899' },
            'Hostel': { progress: 0, color: '#F59E0B' }
        };

        Object.keys(components).forEach(comp => {
            const compProposals = proposals.filter(p => p.component === comp);
            const completed = compProposals.filter(p =>
                p.status === 'APPROVED_BY_MINISTRY' || p.status === 'COMPLETED'
            ).length;
            components[comp].progress = compProposals.length > 0
                ? Math.round((completed / compProposals.length) * 100)
                : 0;
        });

        res.json({
            success: true,
            data: {
                name: stateName,
                fundUtilization: {
                    utilized: Math.round(totalReleased / 10000000), // Crores
                    total: Math.round(totalAllocated / 10000000)
                },
                components,
                totalProposals: proposals.length,
                completedProposals: proposals.filter(p =>
                    p.status === 'APPROVED_BY_MINISTRY' || p.status === 'COMPLETED'
                ).length
            }
        });

    } catch (error) {
        console.error('Error fetching state progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


