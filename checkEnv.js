require('dotenv').config();

console.log('Environment Variables Check:');
console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not Loaded');
console.log('EMAIL_USER:', process.env.EMAIL_USER); 