const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Release funds to villages
const releaseVillageFunds = async (req, res) => {
    try {
        const {
            village_code,
            village_name,
            district_name,
            state_name,
            component,
            projects,
            amount_allocated,
            amount_released,
            release_date,
            sanction_order_no,
            remarks
        } = req.body;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .insert([{
                village_code,
                village_name,
                district_name,
                state_name,
                component,
                projects: projects || [],
                amount_allocated,
                amount_released,
                amount_utilized: 0,
                release_date,
                sanction_order_no,
                released_by: req.user?.id,
                remarks,
                status: 'Released'
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Village funds released successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error releasing village funds:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to release village funds',
            error: error.message
        });
    }
};

// Get village funds by state
const getVillageFundsByState = async (req, res) => {
    try {
        const { state } = req.params;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('state_name', state)
            .order('release_date', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching village funds by state:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village funds',
            error: error.message
        });
    }
};

// Get village funds by district
const getVillageFundsByDistrict = async (req, res) => {
    try {
        const { district } = req.params;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('district_name', district)
            .order('release_date', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching village funds by district:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village funds',
            error: error.message
        });
    }
};

// Get all villages by district
const getVillagesByDistrict = async (req, res) => {
    try {
        const { district } = req.params;
        console.log(`🔍 [API] Fetching villages for district: "${district}"`);

        const { data, error } = await supabase
            .from('villages')
            .select('*')
            .ilike('district_name', district.trim())
            .order('village_name');

        if (error) {
            console.error('❌ [API] DB Error:', error.message);
            throw error;
        }

        console.log(`✅ [API] Found ${data ? data.length : 0} villages for "${district}"`);

        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching villages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch villages',
            error: error.message
        });
    }
};

// Get specific village details
const getVillageDetails = async (req, res) => {
    try {
        const { villageCode } = req.params;

        const { data: village, error: villageError } = await supabase
            .from('villages')
            .select('*')
            .eq('village_code', villageCode)
            .single();

        if (villageError) throw villageError;

        const { data: funds, error: fundsError } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('village_code', villageCode)
            .order('release_date', { ascending: false });

        if (fundsError) throw fundsError;

        res.status(200).json({
            success: true,
            data: {
                village,
                fundReleases: funds || []
            }
        });
    } catch (error) {
        console.error('Error fetching village details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village details',
            error: error.message
        });
    }
};

// Update village fund utilization
const updateVillageFundUtilization = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount_utilized, remarks, status } = req.body;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .update({
                amount_utilized,
                remarks,
                status: status || 'Utilized',
                updated_at: new Date()
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Village fund utilization updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating village fund utilization:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update village fund utilization',
            error: error.message
        });
    }
};

// Get village fund statistics
const getVillageFundStats = async (req, res) => {
    try {
        const { state } = req.query;

        let query = supabase
            .from('village_fund_releases')
            .select('amount_allocated, amount_released, amount_utilized, status');

        if (state) {
            query = query.eq('state_name', state);
        }

        const { data, error } = await query;

        if (error) throw error;

        const stats = {
            totalAllocated: data.reduce((sum, item) => sum + parseFloat(item.amount_allocated || 0), 0),
            totalReleased: data.reduce((sum, item) => sum + parseFloat(item.amount_released || 0), 0),
            totalUtilized: data.reduce((sum, item) => sum + parseFloat(item.amount_utilized || 0), 0),
            totalVillages: data.length,
            byStatus: {
                Released: data.filter(item => item.status === 'Released').length,
                Utilized: data.filter(item => item.status === 'Utilized').length,
                Completed: data.filter(item => item.status === 'Completed').length,
                Pending: data.filter(item => item.status === 'Pending').length
            }
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching village fund stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village fund statistics',
            error: error.message
        });
    }
};

module.exports = {
    releaseVillageFunds,
    getVillageFundsByState,
    getVillageFundsByDistrict,
    getVillagesByDistrict,
    getVillageDetails,
    updateVillageFundUtilization,
    getVillageFundStats
};
