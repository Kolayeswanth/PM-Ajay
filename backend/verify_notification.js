require('dotenv').config();
const axios = require('axios');

const WATI_API_URL = process.env.WATI_API_URL;
const WATI_API_KEY = process.env.WATI_API_KEY;
const TENANT_ID = process.env.TENANT_ID;
const TEMPLATE_NAME = process.env.WATI_TEMPLATE_NAME || 'sih';

async function testWati() {
    const phoneNumber = process.argv[2];

    if (!phoneNumber) {
        console.error('❌ Usage: node verify_notification.js <phone_number>');
        console.log('Example: node verify_notification.js 9876543210');
        process.exit(1);
    }

    console.log('🔍 Checking Configuration:');
    console.log(`- API URL: ${WATI_API_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`- API Key: ${WATI_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Tenant ID: ${TENANT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Template: ${TEMPLATE_NAME}`);

    if (!WATI_API_URL || !WATI_API_KEY || !TENANT_ID) {
        console.error('❌ Missing required environment variables into .env file.');
        process.exit(1);
    }

    // Format phone
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('91')) formattedPhone = formattedPhone.substring(2);
    formattedPhone = `91${formattedPhone}`;

    console.log(`📱 Sending test message to: ${formattedPhone}`);

    const endpoint = `${WATI_API_URL}/${TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

    const payload = {
        template_name: TEMPLATE_NAME,
        broadcast_name: 'Test_Diagnostic',
        parameters: [{ name: "message_body", value: "This is a test message from PM-AJAY Debugger." }]
    };

    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Success! WATI returned:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Failed to send message.');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testWati();
