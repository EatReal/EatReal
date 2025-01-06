require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');

// More permissive CORS configuration
app.use(cors());  // Allow all origins temporarily for testing

// Or if you want to be more specific:
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: false,
    maxAge: 86400  // Cache preflight requests for 24 hours
}));

app.use(express.json());
app.use(express.static('public'));

// Environment variables
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// PayPal endpoint
app.post('/api/create-payment', async (req, res) => {
    try {
        // Handle PayPal payment creation
        // This will replace the client-side PayPal logic
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        // Handle email sending
        // This will replace the client-side email logic
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Database operations endpoint
app.post('/api/store-customer', async (req, res) => {
    try {
        // Handle MongoDB operations
        // This will replace the client-side database logic
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/get-paypal-config', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
    
    try {
        if (!process.env.PAYPAL_CLIENT_ID) {
            throw new Error('PayPal client ID not configured');
        }
        res.json({ 
            clientId: process.env.PAYPAL_CLIENT_ID,
            environment: process.env.NODE_ENV || 'sandbox'
        });
    } catch (error) {
        console.error('PayPal config error:', error);
        res.status(500).json({ error: 'Failed to load PayPal configuration' });
    }
});

// Add this to your existing headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Add this endpoint to validate discount codes
app.post('/api/validate-discount', (req, res) => {
    const { code } = req.body;
    
    if (code === 'EATREAL20') {
        res.json({
            valid: true,
            discount: 20,
            message: '20% discount applied!'
        });
    } else {
        res.json({
            valid: false,
            message: 'Invalid discount code'
        });
    }
});

// Add this email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',  // or your preferred email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Add this new endpoint
app.post('/api/send-purchase-email', async (req, res) => {
    const { email } = req.body;
    
    console.log('Attempting to send email to:', email);
    
    try {
        console.log('Email configuration:', {
            from: process.env.EMAIL_USER,
            to: email
        });
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Food Bible Purchase',
            html: `
                <h1>Thank you for purchasing The Food Bible!</h1>
                <p>Your download should begin automatically. If it doesn't, please click the link below:</p>
                <a href="${process.env.DOWNLOAD_URL}">Download The Food Bible</a>
            `
        });
        
        console.log('Email sent successfully:', info);
        res.json({ success: true });
    } catch (error) {
        console.error('Detailed email error:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});