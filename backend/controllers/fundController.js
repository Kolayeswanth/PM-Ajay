const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all fund allocations
exports.getAllFunds = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('fund_allocations')
            .select('*')
            .order('allocation_date', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Group by state and aggregate
        const stateMap = {};
        data.forEach(allocation => {
            const stateName = allocation.state_name;
            if (!stateMap[stateName]) {
                stateMap[stateName] = {
                    name: stateName,
                    code: allocation.state_code || stateName.substring(0, 2).toUpperCase(),
                    component: allocation.scheme_components || [],
                    fundAllocated: 0,
                    amountReleased: 0,
                    lastAllocation: null
                };
            }
            stateMap[stateName].fundAllocated += parseInt(allocation.amount_allocated) || 0;
            stateMap[stateName].amountReleased += parseInt(allocation.amount_released) || 0;

            // Set last allocation (assuming data is ordered by date desc)
            if (!stateMap[stateName].lastAllocation) {
                stateMap[stateName].lastAllocation = {
                    amountInRupees: parseInt(allocation.amount_allocated),
                    amountCr: parseInt(allocation.amount_allocated) / 10000000,
                    date: allocation.allocation_date,
                    officerId: allocation.officer_id,
                    allocatorName: allocation.allocator_name,
                    allocatorRole: allocation.allocator_role,
                    allocatorPhone: allocation.allocator_phone
                };
            }
        });

        const result = Object.values(stateMap);
        res.json(result);

    } catch (error) {
        console.error('Error fetching funds:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Allocate Fund
exports.allocateFund = async (req, res) => {
    try {
        const {
            stateName,
            component,
            amount,
            date,
            officerId,
            allocatorName,
            allocatorRole,
            allocatorPhone
        } = req.body;

        if (!stateName || !amount) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const amountCr = parseFloat(amount);
        const amountInRupees = Math.round(amountCr * 10000000); // 1 Cr = 10,000,000

        // Insert new allocation
        const { data, error } = await supabase
            .from('fund_allocations')
            .insert([
                {
                    state_name: stateName,
                    state_code: stateName.substring(0, 2).toUpperCase(),
                    scheme_components: component || [],
                    amount_allocated: amountInRupees,
                    allocation_date: date || new Date().toISOString().split('T')[0],
                    officer_id: officerId,
                    allocator_name: allocatorName,
                    allocator_role: allocatorRole,
                    allocator_phone: allocatorPhone
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, message: 'Allocation saved to Supabase', data: data[0] });

    } catch (error) {
        console.error('Error allocating fund:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Release Fund (update existing allocation and log release)
exports.releaseFund = async (req, res) => {
    try {
        const {
            stateName,
            amount,
            component,
            date,
            officerId,
            remarks
        } = req.body;

        if (!stateName || !amount) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const amountCr = parseFloat(amount);
        const amountInRupees = Math.round(amountCr * 10000000);

        // 1. Get State ID from states table
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        const stateId = stateData.id;

        // 2. Get latest allocation for this state to check balance
        const { data: allocations, error: fetchError } = await supabase
            .from('fund_allocations')
            .select('*')
            .eq('state_name', stateName)
            .order('allocation_date', { ascending: false })
            .limit(1);

        if (fetchError || !allocations || allocations.length === 0) {
            return res.status(404).json({ success: false, error: 'State allocation not found' });
        }

        const allocation = allocations[0];
        const currentReleased = parseInt(allocation.amount_released) || 0;
        const totalAllocated = parseInt(allocation.amount_allocated) || 0;
        const newReleased = currentReleased + amountInRupees;

        // Check if release exceeds allocation
        if (newReleased > totalAllocated) {
            return res.status(400).json({
                success: false,
                error: `Cannot release funds. Exceeds allocation. Available: ₹${((totalAllocated - currentReleased) / 10000000).toFixed(2)} Cr`
            });
        }

        // 3. Update the allocation (increment released amount)
        const { error: updateError } = await supabase
            .from('fund_allocations')
            .update({ amount_released: newReleased })
            .eq('id', allocation.id);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return res.status(500).json({ success: false, error: updateError.message });
        }

        // 4. Insert into state_fund_releases (Log the release)
        const { data: releaseLog, error: insertError } = await supabase
            .from('state_fund_releases')
            .insert([
                {
                    state_id: stateId,
                    component: component || [],
                    amount_rupees: amountInRupees,
                    amount_cr: amountCr,
                    release_date: date || new Date().toISOString().split('T')[0],
                    sanction_order_no: officerId,
                    remarks: remarks
                }
            ])
            .select();

        if (insertError) {
            console.error('Supabase insert log error:', insertError);
            // Note: We updated allocation but failed to log. Ideally we should rollback, but for now just report error.
            return res.status(500).json({ success: false, error: 'Allocation updated but failed to log release: ' + insertError.message });
        }

        res.json({ success: true, message: 'Fund released successfully', data: releaseLog[0] });

    } catch (error) {
        console.error('Error releasing fund:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
