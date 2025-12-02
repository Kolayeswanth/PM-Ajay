const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
