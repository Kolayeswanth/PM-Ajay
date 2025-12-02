const axios = require('axios');
require('dotenv').config();

const WATI_API_URL = process.env.WATI_API_URL;
const WATI_API_KEY = process.env.WATI_API_KEY;
const TENANT_ID = process.env.TENANT_ID;
const TEMPLATE_NAME = 'sih';

async function testShortMessage() {
    const phone = '916300459995'; // Delhi admin

    // Test 1: Very short message (like fund notifications)
    console.log('\n=== Test 1: Short Message ===');
    const shortMessage = `Dear deepika, Proposal from Shahdara is pending. Please approve. Thank you.`;

    const endpoint = `${WATI_API_URL}/${TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`;
    const payload = {
        template_name: TEMPLATE_NAME,
        broadcast_name: 'Test Short',
        parameters: [{ name: "message_body", value: shortMessage }]
    };

    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Status:', response.status);
        console.log('Result:', response.data.result);
        console.log('Valid Number:', response.data.validWhatsAppNumber);
        console.log('\n👉 Check phone 6300459995 for this short message!');
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testShortMessage();
