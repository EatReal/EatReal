require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Updated CORS configuration
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://eatreal.co.uk'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin'],
    credentials: false
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
    console.log('PayPal config requested from:', req.headers.origin);
    
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});