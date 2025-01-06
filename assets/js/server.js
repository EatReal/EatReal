require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Customer = require('../../models/Customer');
const app = express();

// Debug logging for environment variables
console.log('Environment Variables Check:');
console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not Loaded');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('EMAIL_PASSWORD first 4 chars:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.substring(0, 4) : 'none');

// Middleware
app.use(express.static(path.join(__dirname, '../..'))); // Serve files from root directory
app.use(express.json());

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY;
const REVOLUT_API_URL = 'https://merchant.revolut.com/api/1.0';

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Test the transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log('Transporter verification failed:', error);
    } else {
        console.log('Transporter is ready to send emails');
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/eatreal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Log database connection status
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.get('/product', (req, res) => {
    // Read the HTML file
    let html = fs.readFileSync(path.join(__dirname, '../..', 'product.html'), 'utf8');
    
    // Replace the placeholder with actual client ID
    html = html.replace('YOUR_PAYPAL_CLIENT_ID', process.env.PAYPAL_CLIENT_ID);
    
    // Send the modified HTML
    res.send(html);
});

app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, email } = req.body;
        
        const response = await axios.post(`${REVOLUT_API_URL}/orders`, {
            amount,
            currency,
            email,
            capture_mode: "AUTOMATIC",
            merchant_order_ext_ref: `ORDER-${Date.now()}`, // Unique order reference
            description: "The Food Bible - Digital Download"
        }, {
            headers: {
                'Authorization': `Bearer ${REVOLUT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ orderToken: response.data.public_id });
    } catch (err) {
        console.error('Revolut API Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Email template function
function getEmailTemplate(customerEmail, orderId) {
    return {
        from: '"Eat Real" <eatreal47@gmail.com>',
        to: customerEmail,
        bcc: 'eatreal47@gmail.com', // Send a copy to yourself
        subject: 'Your Food Bible Purchase',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8B4513;">Thank you for your purchase!</h1>
                <p>Hello,</p>
                <p>Thank you for purchasing The Food Bible. Your order ID is: ${orderId}</p>
                <p>We've attached your copy of The Food Bible to this email.</p>
                <p>If you have any questions or need support, please don't hesitate to reply to this email.</p>
                <p>Best regards,<br>The Eat Real Team</p>
            </div>
        `,
        attachments: [{
            filename: 'The-Food-Bible.pdf',
            path: './assets/products/FoodBible.pdf'
        }]
    };
}

app.post('/api/send-confirmation', async (req, res) => {
    const { email, orderId } = req.body;

    try {
        // Store customer data
        const customer = new Customer({
            email,
            orderId
        });
        await customer.save();

        // Send email
        await transporter.sendMail(getEmailTemplate(email, orderId));
        
        console.log(`Order confirmation sent to ${email} and stored in database`);
        res.json({ success: true });
    } catch (error) {
        console.error('Operation failed:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Operation failed',
            details: error.message 
        });
    }
});

app.post('/paypal-webhook', express.json(), async (req, res) => {
    const event = req.body;
    
    // Handle successful payments
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        // Process the successful payment
        // You might want to send the digital product, update database, etc.
        console.log('Payment successful:', event.resource);
    }
    
    res.sendStatus(200);
});

// Add this test endpoint with more detailed error logging
app.get('/test-email', async (req, res) => {
    console.log('Test email endpoint hit');
    console.log('Using email credentials:', {
        user: process.env.EMAIL_USER,
        passLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
    });

    try {
        await transporter.sendMail(getEmailTemplate('your-test-email@gmail.com', 'TEST-123'));
        console.log('Email sent successfully');
        res.send('Test email sent successfully!');
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).send('Failed to send test email: ' + error.message);
    }
});

// Add endpoint to view all customers (password protected)
app.get('/api/customers', async (req, res) => {
    const adminPassword = req.headers.authorization;
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const customers = await Customer.find().sort({ purchaseDate: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test email endpoint: http://localhost:${PORT}/test-email`);
}); 