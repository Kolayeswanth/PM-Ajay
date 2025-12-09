const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Register new agency (self-registration)
exports.registerAgency = async (req, res) => {
    try {
        const {
            agencyName,
            phoneNumber,
            email,
            password,
            gstNumber,
            state,
            districts
        } = req.body;

        // Validation
        if (!agencyName || !phoneNumber || !email || !password || !gstNumber || !state || !districts) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: agencyName, phoneNumber, email, password, gstNumber, state, districts'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                error: 'Phone number must be 10 digits'
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Validate districts array
        if (!Array.isArray(districts) || districts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please select at least one district'
            });
        }

        console.log('📝 Agency Registration Request:', {
            agencyName,
            email,
            state,
            districtsCount: districts.length
        });

        // Check if email already exists
        const { data: existingAgency, error: checkError } = await supabase
            .from('agency_registrations')
            .select('email')
            .eq('email', email)
            .single();

        if (existingAgency) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered. Please use a different email.'
            });
        }

        // Insert new agency registration
        const { data, error } = await supabase
            .from('agency_registrations')
            .insert([
                {
                    agency_name: agencyName,
                    phone_number: phoneNumber,
                    email: email,
                    password: password, // Note: In production, hash this password!
                    gst_number: gstNumber,
                    state: state,
                    districts: districts,
                    status: 'Pending',
                    submitted_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('❌ Supabase insert error:', error);
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists.'
                });
            }
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to register agency'
            });
        }

        console.log('✅ Agency registration successful:', data[0]);

        // Send WhatsApp notification to State Admin
        try {
            // You can configure state admin phone numbers in environment variables
            const stateAdminPhone = process.env.STATE_ADMIN_PHONE; // Add this to your .env file

            if (stateAdminPhone) {
                let formattedPhone = stateAdminPhone.replace(/\D/g, '');
                if (formattedPhone.startsWith('91')) formattedPhone = formattedPhone.substring(2);
                formattedPhone = `91${formattedPhone}`;

                const watiApiBaseUrl = process.env.WATI_API_URL;
                const watiApiKey = process.env.WATI_API_KEY;
                const tenantId = process.env.TENANT_ID;
                const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

                if (watiApiBaseUrl && watiApiKey && tenantId) {
                    const messageContent =
                        `⚠️ *New Agency Registration* - ` +
                        `AGENCY NAME: ${agencyName} - ` +
                        `EMAIL: ${email} - ` +
                        `PHONE: ${phoneNumber} - ` +
                        `STATE: ${state} - ` +
                        `DISTRICTS: ${districts.join(', ')} - ` +
                        `GST: ${gstNumber} - ` +
                        `STATUS: Pending Approval - ` +
                        `Please login to the State Admin dashboard to review and approve this agency registration. ` +
                        `Thank you, PM-AJAY Portal`;

                    const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

                    const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                    const payload = {
                        template_name: templateName,
                        broadcast_name: 'Agency Registration Notification',
                        parameters: [{ name: "message_body", value: sanitizedMessage }]
                    };

                    const response = await axios.post(endpoint, payload, {
                        headers: { 'Authorization': `Bearer ${watiApiKey}`, 'Content-Type': 'application/json' }
                    });
                    console.log('✅ WhatsApp notification sent to State Admin:', formattedPhone);
                } else {
                    console.log('⚠️ WhatsApp API credentials not configured');
                }
            } else {
                console.log('⚠️ State Admin phone number not configured');
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp notification:', whatsappError.message);
            // Don't fail the registration if WhatsApp fails
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Your application is pending approval from the State Admin.',
            data: {
                id: data[0].id,
                agencyName: data[0].agency_name,
                email: data[0].email,
                status: data[0].status
            }
        });

    } catch (error) {
        console.error('❌ Error registering agency:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

// Get all agency registrations (for State Admin approval)
exports.getPendingRegistrations = async (req, res) => {
    try {
        const { state, status } = req.query;

        let query = supabase
            .from('agency_registrations')
            .select('*')
            .order('submitted_at', { ascending: false });

        // If state filter is provided
        if (state) {
            query = query.eq('state', state);
        }

        // If status filter is provided, otherwise get all
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('❌ Error fetching agency registrations:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        console.log(`✅ Fetched ${data.length} agency registrations`);

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('❌ Error fetching agency registrations:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

// Approve agency registration
exports.approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('✅ Approving registration:', id);

        // Update status to Approved
        const { data, error } = await supabase
            .from('agency_registrations')
            .update({ status: 'Approved' })
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Error approving registration:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }

        console.log('✅ Registration approved:', data[0]);

        res.json({
            success: true,
            message: 'Agency registration approved successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('❌ Error approving registration:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

// Reject agency registration
exports.rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('❌ Rejecting registration:', id);

        // Update status to Rejected
        const { data, error } = await supabase
            .from('agency_registrations')
            .update({ status: 'Rejected' })
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Error rejecting registration:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }

        console.log('✅ Registration rejected:', data[0]);

        res.json({
            success: true,
            message: 'Agency registration rejected',
            data: data[0]
        });

    } catch (error) {
        console.error('❌ Error rejecting registration:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

// Get all implementing agencies
exports.getAllImplementingAgencies = async (req, res) => {
    try {
        const { districtName } = req.query;
        let query = supabase
            .from('implementing_agencies_assignment')
            .select('*')
            .order('created_at', { ascending: false });

        if (districtName) {
            query = query.eq('district_name', districtName);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            // If table doesn't exist, return empty array instead of error
            if (error.code === '42P01') { // undefined_table
                return res.json({ success: true, data: [] });
            }
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching implementing agencies:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add new implementing agency
exports.addImplementingAgency = async (req, res) => {
    try {
        const {
            name,
            agency,
            phone,
            email,
            accountNo,
            districtName
        } = req.body;

        // Validation
        if (!name || !agency || !phone || !email || !accountNo || !districtName) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: name, agency, phone, email, accountNo, districtName'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Phone number must be 10 digits'
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Insert new implementing agency
        const { data, error } = await supabase
            .from('implementing_agencies_assignment')
            .insert([
                {
                    admin_name: name,
                    agency_name: agency,
                    phone_no: phone,
                    email: email,
                    bank_account_number: accountNo,
                    district_name: districtName,
                    status: 'Active'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists.'
                });
            }
            return res.status(500).json({ success: false, error: error.message });
        }

        // Send WhatsApp notification
        try {
            let formattedPhone = phone.replace(/\D/g, '');
            if (formattedPhone.startsWith('91')) formattedPhone = formattedPhone.substring(2);
            formattedPhone = `91${formattedPhone}`;

            const watiApiBaseUrl = process.env.WATI_API_URL;
            const watiApiKey = process.env.WATI_API_KEY;
            const tenantId = process.env.TENANT_ID;
            const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

            if (watiApiBaseUrl && watiApiKey && tenantId) {
                const messageContent =
                    `⚠️ *Important Notification* - ` +
                    `IMPLEMENTING AGENCY REGISTRATION - ` +
                    `Dear ${name}, ` +
                    `You have been registered as an Implementing Agency (${agency}) for ${districtName} District. ` +
                    `Email: ${email}. ` +
                    `Status: Active. ` +
                    `You will receive further instructions for accessing the PM-AJAY Dashboard. ` +
                    `Thank you, Ministry of Social Justice & Empowerment`;

                const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

                const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                const payload = {
                    template_name: templateName,
                    broadcast_name: 'Implementing Agency Registration',
                    parameters: [{ name: "message_body", value: sanitizedMessage }]
                };

                const response = await axios.post(endpoint, payload, {
                    headers: { 'Authorization': `Bearer ${watiApiKey}`, 'Content-Type': 'application/json' }
                });
                console.log('✅ WATI API Response Status:', response.status);
                console.log('✅ WhatsApp notification sent to', formattedPhone);
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp:', whatsappError.message);
            // Don't fail the entire request if WhatsApp fails
        }

        res.json({
            success: true,
            message: 'Implementing agency added successfully and WhatsApp notification sent',
            data: data[0]
        });

    } catch (error) {
        console.error('Error adding implementing agency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update implementing agency
exports.updateImplementingAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            agency,
            phone,
            email,
            accountNo
        } = req.body;

        const { data, error } = await supabase
            .from('implementing_agencies_assignment')
            .update({
                admin_name: name,
                agency_name: agency,
                phone_no: phone,
                email: email,
                bank_account_number: accountNo
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'Implementing agency updated successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error updating implementing agency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete implementing agency
exports.deleteImplementingAgency = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('implementing_agencies_assignment')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'Implementing agency deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting implementing agency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Activate implementing agency
exports.activateImplementingAgency = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch agency details
        const { data: agencyData, error: fetchError } = await supabase
            .from('implementing_agencies_assignment')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !agencyData) {
            return res.status(404).json({ success: false, error: 'Implementing agency not found' });
        }
        if (agencyData.status === 'Activated') {
            return res.status(400).json({ success: false, error: 'Agency is already activated' });
        }

        // Update status
        const { data, error } = await supabase
            .from('implementing_agencies_assignment')
            .update({ status: 'Activated' })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        // Send WhatsApp notification
        try {
            let formattedPhone = agencyData.phone_no.replace(/\D/g, '');
            if (formattedPhone.startsWith('91')) formattedPhone = formattedPhone.substring(2);
            formattedPhone = `91${formattedPhone}`;

            const watiApiBaseUrl = process.env.WATI_API_URL;
            const watiApiKey = process.env.WATI_API_KEY;
            const tenantId = process.env.TENANT_ID;
            const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

            if (watiApiBaseUrl && watiApiKey && tenantId) {
                const messageContent =
                    `⚠️ *Important Notification* - ` +
                    `AGENCY ACTIVATION - ` +
                    `Dear ${agencyData.admin_name}, ` +
                    `Your Implementing Agency account (${agencyData.agency_name}) for ${agencyData.district_name} has been successfully ACTIVATED. ` +
                    `Status: Activated. ` +
                    `You can now proceed with your project implementation tasks. ` +
                    `Thank you, Ministry of Social Justice & Empowerment`;

                const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

                const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                const payload = {
                    template_name: templateName,
                    broadcast_name: 'Agency Activation',
                    parameters: [{ name: "message_body", value: sanitizedMessage }]
                };

                const response = await axios.post(endpoint, payload, {
                    headers: { 'Authorization': `Bearer ${watiApiKey}`, 'Content-Type': 'application/json' }
                });
                console.log('✅ WhatsApp activation notification sent to', formattedPhone);
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp:', whatsappError.message);
        }

        res.json({
            success: true,
            message: 'Implementing agency activated successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error activating implementing agency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get master list of implementing agencies
exports.getAgencyMasterList = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('implementing_agencies')
            .select('agency_name')
            .order('agency_name', { ascending: true });

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching agency master list:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
