const { checkAndRemindPendingProposals } = require('./services/cronService');

console.log('🧪 Testing Reminder Service Manually...\n');

checkAndRemindPendingProposals()
    .then(() => {
        console.log('\n✅ Test completed. Check the output above.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Test failed:', err);
        process.exit(1);
    });
