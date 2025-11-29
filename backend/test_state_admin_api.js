// Test file for State Admin API endpoints
// You can use this with tools like Postman, Insomnia, or curl

const API_BASE_URL = 'http://localhost:5001/api/state-admins';

// Test 1: Get all state admins
console.log('Test 1: GET all state admins');
console.log(`curl ${API_BASE_URL}`);
console.log('');

// Test 2: Add new state admin
console.log('Test 2: POST - Add new state admin');
console.log(`curl -X POST ${API_BASE_URL} \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Admin",
    "phone_no": "9876543210",
    "email": "test@example.com",
    "bank_account_number": "1234567890123456"
  }'`);
console.log('');

// Test 3: Update state admin (replace :id with actual ID)
console.log('Test 3: PUT - Update state admin');
console.log(`curl -X PUT ${API_BASE_URL}/1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Admin",
    "phone_no": "9876543211",
    "email": "updated@example.com",
    "bank_account_number": "9876543210123456"
  }'`);
console.log('');

// Test 4: Activate state admin
console.log('Test 4: PATCH - Activate state admin');
console.log(`curl -X PATCH ${API_BASE_URL}/1/activate`);
console.log('');

// Test 5: Deactivate state admin
console.log('Test 5: PATCH - Deactivate state admin');
console.log(`curl -X PATCH ${API_BASE_URL}/1/deactivate`);
console.log('');

// Test 6: Delete state admin (hard delete)
console.log('Test 6: DELETE - Delete state admin');
console.log(`curl -X DELETE ${API_BASE_URL}/1`);
console.log('');

console.log('='.repeat(60));
console.log('Run these commands in your terminal to test the API');
console.log('Or use the frontend UI to test the functionality');
console.log('='.repeat(60));
