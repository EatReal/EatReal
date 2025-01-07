require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const path = require('path');

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
        const filePath = path.join(__dirname, 'assets', 'products', 'FoodBible.pdf');
        
        // First verify the file exists
        if (!require('fs').existsSync(filePath)) {
            throw new Error('PDF file not found at: ' + filePath);
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Your Health Journey - The Food Bible',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #8B4513; text-align: center;">Thank You for Purchasing The Food Bible!</h1>
                    
                    <p>Dear Health Enthusiast,</p>
                    
                    <p>Thank you for taking the first step towards a healthier, more vibrant you! We're truly excited to be part of your wellness journey.</p>
                    
                    <p>Your copy of The Food Bible is attached to this email. This comprehensive guide is designed to transform your relationship with food and help you make informed, healthy choices every day.</p>
                    
                    <h2 style="color: #8B4513; margin-top: 20px;">Getting Started:</h2>
                    <ul>
                        <li>Save the attached PDF in a convenient location</li>
                        <li>Take some time to browse through the contents</li>
                        <li>Start with the sections that interest you most</li>
                        <li>Remember, small changes lead to big results!</li>
                    </ul>

                    <h2 style="color: #8B4513; margin-top: 20px;">Need Help?</h2>
                    <p>If you have any issues with the attachment or have any questions, please don't hesitate to contact us at <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a></p>

                    <div style="background-color: #FDEECE; padding: 15px; margin-top: 20px; border-radius: 5px;">
                        <p style="margin: 0;"><strong>Quick Tip:</strong> Start by reading our "Getting Started" chapter to make the most of your Food Bible journey!</p>
                    </div>

                    <p style="margin-top: 20px;">Remember, investing in your health is the best decision you can make. We're here to support you every step of the way!</p>

                    <p>Here's to your health,<br>
                    The Eat Real Team</p>
                    
                    <hr style="border: 1px solid #FDEECE; margin: 20px 0;">
                    
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        If you have any questions or need support, please contact us at:<br>
                        <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a>
                    </p>
                </div>
            `,
            attachments: [{
                filename: 'The-Food-Bible.pdf',
                path: filePath
            }]
        });
        
        console.log('Email sent successfully:', info);
        res.json({ success: true });
    } catch (error) {
        console.error('Detailed email error:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

// Add this endpoint to serve the PDF
app.post('/api/download-pdf', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'assets', 'products', 'FoodBible.pdf');
        res.download(filePath, 'FoodBible.pdf', (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Error downloading file');
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).send('Error downloading file');
    }
});

// Temporary debug endpoint - REMOVE AFTER TESTING
app.get('/debug-file', (req, res) => {
    const filePath = path.join(__dirname, 'assets', 'products', 'FoodBible.pdf');
    const exists = require('fs').existsSync(filePath);
    res.json({ 
        exists, 
        path: filePath,
        dirname: __dirname 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});