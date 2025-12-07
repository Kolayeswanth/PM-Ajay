const axios = require('axios');
const { Expo } = require('expo-server-sdk');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new Expo SDK client
let expo = new Expo();

/**
 * Helper function to send push notification
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
    try {
        // 1. Get push token from Supabase profiles
        // We assume userId is passed, or we might need to look it up by phone
        // For this implementation, let's try to look up by phone if userId is not provided
        let pushToken;
        
        if (userId) {
             const { data: userData, error } = await supabase
                .from('profiles')
                .select('push_token')
                .eq('id', userId)
                .single();
            
            if (userData) pushToken = userData.push_token;
        }

        // If no token found yet, and we have phone number in data, try to find by phone
        // Note: This assumes phone number in profiles matches the one used for WhatsApp
        // The phone format in profiles might differ, so this is a best-effort lookup
        if (!pushToken && data.phone) {
             // Try to match phone number (this might need adjustment based on DB format)
             // Ideally, we should pass the User ID to this function
        }

        if (!Expo.isExpoPushToken(pushToken)) {
            console.log(`Push token ${pushToken} is not a valid Expo push token`);
            return;
        }

        const messages = [];
        messages.push({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        });

        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log('Push notification sent:', ticketChunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending push notification chunk:', error);
            }
        }
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
};

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

        // --- TRIGGER PUSH NOTIFICATION ---
        const tenDigitPhone = formattedPhone.substring(2);
        const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, push_token')
            .ilike('phone', `%${tenDigitPhone}%`)
            .single();

        if (userProfile && userProfile.push_token) {
             await sendPushNotification(
                userProfile.id,
                'Fund Allocation Alert',
                `Rs ${amount} Crore allocated to ${stateName}`,
                { type: 'allocation', amount, stateName }
            );
        } else {
            console.log('⚠️ No push token found for user with phone:', tenDigitPhone);
        }
        // ---------------------------------

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

/**
 * Send WhatsApp notification for fund release
 */
exports.sendReleaseNotification = async (req, res) => {
    try {
        const {
            allocatorPhone,
            allocatorName,
            stateName,
            amount,
            component,
            date,
            officerId,
            remarks
        } = req.body;

        // Validate required fields
        if (!allocatorPhone || !stateName || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: allocatorPhone, stateName, amount'
            });
        }

        // Format phone number
        let formattedPhone = allocatorPhone.replace(/\D/g, '');
        if (formattedPhone.startsWith('91')) {
            formattedPhone = formattedPhone.substring(2);
        }
        formattedPhone = `91${formattedPhone}`;

        if (formattedPhone.length !== 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Expected 10 digits.'
            });
        }

        const watiApiBaseUrl = process.env.WATI_API_URL;
        const watiApiKey = process.env.WATI_API_KEY;
        const tenantId = process.env.TENANT_ID;
        const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

        if (!watiApiBaseUrl || !watiApiKey || !tenantId) {
            return res.status(500).json({
                success: false,
                error: 'WATI API credentials not configured.'
            });
        }

        const messageContent =
            `FUND RELEASE NOTIFICATION - ` +
            `Dear ${allocatorName || 'State Officer'}, ` +
            `Funds have been released for your state. ` +
            `State: ${stateName}. ` +
            `Amount Released: Rs ${amount} Crore. ` +
            `Scheme Component: ${Array.isArray(component) ? component.join(', ') : component || 'N/A'}. ` +
            `Release Date: ${date || new Date().toISOString().slice(0, 10)}. ` +
            `Released By Officer ID: ${officerId || 'Ministry Admin'}. ` +
            `Remarks: ${remarks || 'None'}. ` +
            `Please check your dashboard for details. ` +
            `Thank you, Ministry of Social Justice & Empowerment`;

        const templateParams = [
            { name: "message_body", value: messageContent }
        ];

        const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

        const payload = {
            template_name: templateName,
            broadcast_name: 'Fund Release Notification',
            parameters: templateParams
        };

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${watiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // --- TRIGGER PUSH NOTIFICATION ---
        const tenDigitPhone = formattedPhone.substring(2);
        const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, push_token')
            .ilike('phone', `%${tenDigitPhone}%`)
            .single();

        if (userProfile && userProfile.push_token) {
             await sendPushNotification(
                userProfile.id,
                'Fund Release Alert',
                `Rs ${amount} Crore released to ${stateName}`,
                { type: 'release', amount, stateName }
            );
        } else {
            console.log('⚠️ No push token found for user with phone:', tenDigitPhone);
        }
        // ---------------------------------

        return res.status(200).json({
            success: true,
            message: 'WhatsApp notification sent successfully',
            data: response.data
        });

    } catch (error) {
        console.error('❌ Error sending Release WhatsApp notification:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to send WhatsApp notification',
            details: error.response?.data || error.message
        });
    }
};

/**
 * Fetch recent notifications for a user (for polling)
 * This is a workaround for Expo Go not supporting remote push notifications
 */
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        let notifications = [];

        // Fetch recent allocations
        const { data: allocations, error: allocError } = await supabase
            .from('fund_allocations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (allocations) {
            allocations.forEach(alloc => {
                notifications.push({
                    id: `alloc-${alloc.id}`,
                    title: 'New Fund Allocation',
                    body: `Amount: Rs ${alloc.amount} Cr for ${alloc.state_name || 'State'}`,
                    timestamp: alloc.created_at,
                    type: 'allocation'
                });
            });
        }

        // Fetch recent releases
        try {
             // We wrap this in try-catch in case table names differ or don't exist
            const { data: releases, error: relError } = await supabase
                .from('fund_releases')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (releases) {
                releases.forEach(rel => {
                    notifications.push({
                        id: `rel-${rel.id}`,
                        title: 'Fund Released',
                        body: `Amount: Rs ${rel.amount_released || rel.amount} Cr released`,
                        timestamp: rel.created_at,
                        type: 'release'
                    });
                });
            }
        } catch (e) {
            console.log('Skipping releases table check');
        }

        // Sort combined list
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(200).json({
            success: true,
            data: []
        });
    }
};
