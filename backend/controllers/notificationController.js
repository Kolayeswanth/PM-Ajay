const axios = require('axios');

/**
 * Send WhatsApp notification for fund allocation using WATI API
 * Format based on working WATI integration pattern
 */
exports.sendAllocationNotification = async (req, res) => {
    try {
        const {
            allocatorPhone,
            allocatorName,
            allocatorRole,
            stateName,
            amount,
            component,
            date,
            officerId
        } = req.body;

        // Validate required fields
        if (!allocatorPhone || !allocatorName || !stateName || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: allocatorPhone, allocatorName, stateName, amount'
            });
        }

        // Format phone number to international format (remove +91 if present, then add it)
        let formattedPhone = allocatorPhone.replace(/\D/g, ''); // Remove non-digits
        if (formattedPhone.startsWith('91')) {
            formattedPhone = formattedPhone.substring(2);
        }
        formattedPhone = `91${formattedPhone}`; // WATI expects format: 91XXXXXXXXXX

        // Validate phone number length (should be 10 digits after country code)
        if (formattedPhone.length !== 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Expected 10 digits.'
            });
        }

        // Get WATI configuration from environment variables
        const watiApiBaseUrl = process.env.WATI_API_URL;
        const watiApiKey = process.env.WATI_API_KEY;
        const tenantId = process.env.TENANT_ID;
        const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

        if (!watiApiBaseUrl || !watiApiKey || !tenantId) {
            return res.status(500).json({
                success: false,
                error: 'WATI API credentials not configured. Please check .env file (WATI_API_URL, WATI_API_KEY, TENANT_ID).'
            });
        }

        // Prepare template parameters for 'sih' template
        // Template has only ONE parameter: 'message_body'
        // WATI doesn't accept \n newlines, so format as single text with spacing
        console.log('📱 Sending WhatsApp notification to:', formattedPhone);
        console.log('📋 Using template:', templateName);

        const messageContent =
            `FUND ALLOCATION NOTIFICATION - ` +
            `Dear ${allocatorName}, ` +
            `A new fund allocation has been made for your state. ` +
            `State: ${stateName}. ` +
            `Amount Allocated: Rs ${amount} Crore. ` +
            `Scheme Component: ${Array.isArray(component) ? component.join(', ') : component || 'N/A'}. ` +
            `Allocation Date: ${date || new Date().toISOString().slice(0, 10)}. ` +
            `Your Role: ${allocatorRole || 'State Official'}. ` +
            `Officer ID: ${officerId || 'N/A'}. ` +
            `Please acknowledge receipt of this notification. ` +
            `Thank you, Ministry of Social Justice & Empowerment`;

        const templateParams = [
            { name: "message_body", value: messageContent }
        ];

        console.log('📱 Sending WhatsApp notification to:', messageContent);
        console.log('📋 Using template:', templateName);
        // WATI API endpoint with tenant ID and whatsappNumber as query parameter
        const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

        // Prepare request payload
        const payload = {
            template_name: templateName,
            broadcast_name: 'Fund Allocation Notification',
            parameters: templateParams
        };

        console.log('🔗 WATI Endpoint:', endpoint);
        console.log('📝 Payload:', JSON.stringify(payload, null, 2));

        // Make API call to WATI
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${watiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ WATI API Response:', response);

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'WhatsApp notification sent successfully',
            data: {
                phone: formattedPhone,
                allocatorName,
                stateName,
                amount
            },
            watiResponse: response.data
        });

    } catch (error) {
        console.error('❌ Error sending WhatsApp notification:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to send WhatsApp notification',
            details: error.response?.data || error.message
        });
    }
};
