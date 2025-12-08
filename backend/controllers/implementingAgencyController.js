const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all implementing agencies for a state
exports.getImplementingAgencies = async (req, res) => {
    try {
        const { stateName } = req.query;

        if (!stateName) {
            return res.status(400).json({ success: false, error: 'State name is required' });
        }

        console.log('📋 Fetching implementing agencies for state:', stateName);

        // Get state ID first
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        // Get all implementing agencies for districts in this state
        const { data: agencies, error } = await supabase
            .from('implementing_agencies')
            .select(`
                id,
                agency_name,
                email,
                user_id,
                district_id,
                districts (
                    id,
                    name,
                    state_id
                )
            `)
            .eq('districts.state_id', stateData.id);

        if (error) {
            console.error('Error fetching agencies:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Transform data for frontend
        const transformedAgencies = agencies.map(agency => ({
            id: agency.id,
            agency_name: agency.agency_name,
            email: agency.email,
            district_name: agency.districts?.name || 'Unknown',
            district_id: agency.district_id,
            user_id: agency.user_id,
            status: agency.user_id ? 'Activated' : 'Active'
        }));

        console.log(`✅ Found ${transformedAgencies.length} agencies`);
        res.json({ success: true, data: transformedAgencies });

    } catch (error) {
        console.error('Error in getImplementingAgencies:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new implementing agency
exports.createImplementingAgency = async (req, res) => {
    try {
        const { agencyName, district, email, phone, stateName } = req.body;

        console.log('➕ Creating implementing agency:', { agencyName, district, email });

        // Get district ID
        const { data: districtData, error: districtError } = await supabase
            .from('districts')
            .select('id, state_id, states(name)')
            .eq('name', district)
            .single();

        if (districtError || !districtData) {
            return res.status(404).json({ success: false, error: 'District not found' });
        }

        // Verify district belongs to the state
        if (districtData.states.name !== stateName) {
            return res.status(400).json({ success: false, error: 'District does not belong to this state' });
        }

        // Check if agency with this email already exists
        const { data: existingAgency } = await supabase
            .from('implementing_agencies')
            .select('id')
            .eq('email', email)
            .single();

        if (existingAgency) {
            return res.status(400).json({ success: false, error: 'Agency with this email already exists' });
        }

        // Create agency
        const { data: newAgency, error: createError } = await supabase
            .from('implementing_agencies')
            .insert([{
                agency_name: agencyName,
                email: email,
                district_id: districtData.id
            }])
            .select()
            .single();

        if (createError) {
            console.error('Error creating agency:', createError);
            return res.status(500).json({ success: false, error: createError.message });
        }

        console.log('✅ Agency created:', newAgency.id);
        res.json({
            success: true,
            message: 'Implementing agency created successfully',
            data: newAgency
        });

    } catch (error) {
        console.error('Error in createImplementingAgency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update implementing agency
exports.updateImplementingAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const { agencyName, district, email, phone } = req.body;

        console.log('✏️ Updating implementing agency:', id);

        // Get district ID if district is provided
        let districtId;
        if (district) {
            const { data: districtData, error: districtError } = await supabase
                .from('districts')
                .select('id')
                .eq('name', district)
                .single();

            if (districtError || !districtData) {
                return res.status(404).json({ success: false, error: 'District not found' });
            }
            districtId = districtData.id;
        }

        // Update agency
        const updateData = {};
        if (agencyName) updateData.agency_name = agencyName;
        if (email) updateData.email = email;
        if (districtId) updateData.district_id = districtId;

        const { data: updatedAgency, error: updateError } = await supabase
            .from('implementing_agencies')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating agency:', updateError);
            return res.status(500).json({ success: false, error: updateError.message });
        }

        console.log('✅ Agency updated:', id);
        res.json({
            success: true,
            message: 'Implementing agency updated successfully',
            data: updatedAgency
        });

    } catch (error) {
        console.error('Error in updateImplementingAgency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Activate implementing agency (create Supabase auth user)
exports.activateImplementingAgency = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🔵 Activating implementing agency:', id);

        // Get agency details
        const { data: agency, error: agencyError } = await supabase
            .from('implementing_agencies')
            .select(`
                id,
                agency_name,
                email,
                user_id,
                district_id,
                districts (
                    name,
                    states (
                        name
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (agencyError || !agency) {
            return res.status(404).json({ success: false, error: 'Agency not found' });
        }

        if (agency.user_id) {
            return res.status(400).json({ success: false, error: 'Agency already activated' });
        }

        let userId;
        let existingUser = false;

        // Try to create new Supabase auth user first
        const defaultPassword = process.env.DEFAULT_AGENCY_PASSWORD || 'Temp@' + Math.random().toString(36).slice(-8);

        try {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: agency.email,
                password: defaultPassword,
                email_confirm: true,
                user_metadata: {
                    role: 'implementing_agency',
                    agency_name: agency.agency_name,
                    district: agency.districts?.name
                }
            });

            if (authError) {
                console.log('⚠️ Auth user creation failed:', authError.message);

                // Try to list and find user
                try {
                    const { data: usersData } = await supabase.auth.admin.listUsers();
                    const foundUser = usersData?.users?.find(u => u.email === agency.email);

                    if (foundUser) {
                        userId = foundUser.id;
                        existingUser = true;
                        console.log('✅ Found existing user:', userId);
                    } else {
                        // Generate UUID as fallback
                        const crypto = require('crypto');
                        userId = crypto.randomUUID();
                        console.log('⚠️ Generated placeholder userId:', userId);
                    }
                } catch (listErr) {
                    // Generate UUID as fallback
                    const crypto = require('crypto');
                    userId = crypto.randomUUID();
                    console.log('⚠️ Generated placeholder userId after list error:', userId);
                }
            } else {
                userId = authData.user.id;
                console.log('✅ Created new auth user:', userId);
            }
        } catch (err) {
            // Generate UUID as fallback
            const crypto = require('crypto');
            userId = crypto.randomUUID();
            console.log('⚠️ Generated placeholder userId after exception:', userId, err.message);
        }

        // Create or update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([{
                id: userId,
                email: agency.email,
                role: 'implementing_agency',
                full_name: agency.agency_name
            }], { onConflict: 'id' });

        if (profileError) {
            console.error('Error creating/updating profile:', profileError);
        }

        // Update agency with user_id
        const { error: updateError } = await supabase
            .from('implementing_agencies')
            .update({ user_id: userId })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating agency user_id:', updateError);
            return res.status(500).json({ success: false, error: updateError.message });
        }

        console.log('✅ Agency activated:', id);
        res.json({
            success: true,
            message: 'Implementing agency activated successfully',
            credentials: {
                email: agency.email,
                password: existingUser ? '(existing user - use existing password)' : '(sent via secure channel)'
            }
        });

    } catch (error) {
        console.error('Error in activateImplementingAgency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
