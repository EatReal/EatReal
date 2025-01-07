require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

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

// Update the PDF file path to use the correct directory structure
const PDF_PATH = process.env.NODE_ENV === 'production' 
    ? path.join(process.cwd(), 'assets', 'products', 'FoodBible.pdf')
    : path.join(__dirname, 'assets', 'products', 'FoodBible.pdf');

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
    console.log('PayPal config requested');
    try {
        // Make sure PAYPAL_CLIENT_ID is in your .env file
        if (!process.env.PAYPAL_CLIENT_ID) {
            throw new Error('PayPal client ID not configured');
        }
        
        res.json({
            clientId: process.env.PAYPAL_CLIENT_ID
        });
    } catch (error) {
        console.error('PayPal config error:', error);
        res.status(500).json({ error: error.message });
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

// Update the transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Add this new endpoint
app.post('/api/send-purchase-email', async (req, res) => {
    const { email } = req.body;
    
    console.log('Attempting to send email to:', email);
    console.log('PDF path:', PDF_PATH);
    
    try {
        if (!fs.existsSync(PDF_PATH)) {
            const dir = path.dirname(PDF_PATH);
            console.log('Directory contents:', fs.readdirSync(dir));
            throw new Error('PDF file not found at: ' + PDF_PATH);
        }

        const info = await transporter.sendMail({
            from: {
                name: 'Eat Real',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Welcome to Your Health Journey - The Food Bible',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:logo" alt="Eat Real Logo" style="width: 120px; height: auto;">
                    </div>
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
            attachments: [
                {
                    filename: 'The-Food-Bible.pdf',
                    path: PDF_PATH
                },
                {
                    filename: 'EatRealLogo.png',
                    path: path.join(__dirname, 'assets', 'images', 'EatRealLogo.png'),
                    cid: 'logo' // Same as in the image src above
                }
            ]
        });
        
        console.log('Email sent successfully:', info);
        res.json({ success: true });
    } catch (error) {
        console.error('Detailed email error:', error);
        res.status(500).json({ 
            error: 'Failed to send email', 
            details: error.message,
            path: PDF_PATH,
            cwd: process.cwd(),
            dirname: __dirname
        });
    }
});

// Add this endpoint to serve the PDF
app.post('/api/download-pdf', (req, res) => {
    try {
        if (!fs.existsSync(PDF_PATH)) {
            throw new Error('PDF file not found');
        }
        res.download(PDF_PATH, 'FoodBible.pdf');
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

// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});