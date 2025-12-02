const axios = require('axios');
require('dotenv').config();

const WATI_API_URL = process.env.WATI_API_URL;
const WATI_API_KEY = process.env.WATI_API_KEY;
const TENANT_ID = process.env.TENANT_ID;
const TEMPLATE_NAME = process.env.WATI_TEMPLATE_NAME || 'sih';

async function testTemplate() {
    console.log('\n=== WATI Configuration ===');
    console.log('Template Name:', TEMPLATE_NAME);
    console.log('Tenant ID:', TENANT_ID);

    // Test with Delhi admin number
    const phone = '916300459995';
    const adminName = 'deepika';

    console.log('\n=== Test 1: With name + message_body ===');
    const endpoint1 = `${WATI_API_URL}/${TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`;
    const payload1 = {
        template_name: TEMPLATE_NAME,
        broadcast_name: 'Test Reminder',
        parameters: [
            { name: "name", value: adminName },
            { name: "message_body", value: "Test proposal from Shahdara is pending your approval." }
        ]
    };

    try {
        const response1 = await axios.post(endpoint1, payload1, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Status:', response1.status);
        console.log('📊 Result:', response1.data.result);
        console.log('📱 Valid Number:', response1.data.validWhatsAppNumber);
        console.log('👤 Contact Status:', response1.data.contact?.contactStatus);
        console.log('🔔 Opted In:', response1.data.contact?.optedIn);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n=== Test 2: Only message_body ===');
    const payload2 = {
        template_name: TEMPLATE_NAME,
        broadcast_name: 'Test Reminder 2',
        parameters: [
            { name: "message_body", value: "Dear deepika, Test proposal from Shahdara is pending your approval." }
        ]
    };

    try {
        const response2 = await axios.post(endpoint1, payload2, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Status:', response2.status);
        console.log('📊 Result:', response2.data.result);
        console.log('📱 Valid Number:', response2.data.validWhatsAppNumber);
        console.log('👤 Contact Status:', response2.data.contact?.contactStatus);
        console.log('🔔 Opted In:', response2.data.contact?.optedIn);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n=== IMPORTANT ===');
    console.log('If "optedIn: false" or "contactStatus: UNCONFIRMED":');
    console.log('→ The number needs to send a message to your WhatsApp Business number first');
    console.log('→ Or use a Session Message instead of Template Message');
    console.log('\nIf template variables mismatch:');
    console.log('→ Check your WATI dashboard for the exact template structure');
    console.log('→ Template URL: https://app.wati.io/message-templates');
}

testTemplate();
