const axios = require('axios');
require('dotenv').config();

const WATI_API_URL = process.env.WATI_API_URL;
const WATI_API_KEY = process.env.WATI_API_KEY;
const TENANT_ID = process.env.TENANT_ID;

async function checkOptInStatus() {
    const phone = '916300459995'; // Delhi admin

    console.log(`\n🔍 Checking WhatsApp status for: ${phone}`);

    // We can check status by attempting to send a dummy message or using a specific endpoint if available.
    // WATI doesn't have a direct "check status" endpoint for public use usually, 
    // but we can infer it from the response of a message send attempt.
    // We'll use a harmless "Session Message" attempt which fails if session is not open.

    const endpoint = `${WATI_API_URL}/${TENANT_ID}/api/v1/getContactDetails/${phone}`;

    try {
        // Note: getContactDetails might not be available on all plans, 
        // falling back to the template send test which gives us the 'optedIn' flag in response.

        const sendEndpoint = `${WATI_API_URL}/${TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`;
        const payload = {
            template_name: 'sih',
            broadcast_name: 'Status Check',
            parameters: [{ name: "message_body", value: "Status Check" }]
        };

        const response = await axios.post(sendEndpoint, payload, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const isOptedIn = response.data.contact?.optedIn;
        const contactStatus = response.data.contact?.contactStatus;

        console.log('------------------------------------------------');
        console.log(`📡 API Connection:   ✅ Connected`);
        console.log(`📱 Phone Number:     ${response.data.validWhatsAppNumber ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`🔔 Opt-in Status:    ${isOptedIn ? '✅ OPTED IN (Ready to receive)' : '❌ NOT OPTED IN (Blocked)'}`);
        console.log('------------------------------------------------');

        if (!isOptedIn) {
            console.log('\n⚠️  ACTION REQUIRED:');
            console.log('1. Open WhatsApp on phone 6300459995');
            console.log('2. Send "Hi" to your WATI Business Number');
            console.log('3. Run this script again to verify');
        } else {
            console.log('\n🎉 SUCCESS! This number can now receive reminders.');
        }

    } catch (error) {
        console.error('Error checking status:', error.message);
    }
}

checkOptInStatus();
