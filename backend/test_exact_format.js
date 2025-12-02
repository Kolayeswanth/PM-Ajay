const axios = require('axios');
require('dotenv').config();

const WATI_API_URL = process.env.WATI_API_URL;
const WATI_API_KEY = process.env.WATI_API_KEY;
const TENANT_ID = process.env.TENANT_ID;
const TEMPLATE_NAME = 'sih';

async function testExactFormat() {
    const phone = '916300459995'; // Delhi admin

    // Use EXACT format from fund notifications that work
    const messageContent =
        `PROPOSAL REMINDER - ` +
        `Dear deepika, ` +
        `The proposal "24hema" from Shahdara ` +
        `(Component: Adarsh Gram, Cost: ₹1.99 Lakhs) ` +
        `is still PENDING your approval. ` +
        `Please login to the PM-AJAY portal to review and take action immediately. ` +
        `Thank you, PM-AJAY Administration`;

    const endpoint = `${WATI_API_URL}/${TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`;
    const payload = {
        template_name: TEMPLATE_NAME,
        broadcast_name: 'Proposal Pending Reminder',
        parameters: [{ name: "message_body", value: messageContent }]
    };

    console.log('Sending to:', phone);
    console.log('Template:', TEMPLATE_NAME);
    console.log('Message length:', messageContent.length, 'characters');
    console.log('\nPayload:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ API Response:');
        console.log('Status:', response.status);
        console.log('Result:', response.data.result);
        console.log('Valid Number:', response.data.validWhatsAppNumber);
        console.log('Contact Status:', response.data.contact?.contactStatus);
        console.log('Opted In:', response.data.contact?.optedIn);

        console.log('\n📱 CHECK PHONE 6300459995 NOW!');
        console.log('If this message arrives, the system is perfect!');
        console.log('If not, WhatsApp 24-hour window has expired.');

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

testExactFormat();
