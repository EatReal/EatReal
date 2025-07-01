require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// More permissive CORS configuration
app.use(cors());  // Allow all origins temporarily for testing

/* Redundant CORS configuration
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: false,
    maxAge: 86400  // Cache preflight requests for 24 hours
}));
*/

app.use(express.json());
app.use(express.static('public'));

// Environment variables
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Product configurations
const PRODUCTS = {
    'food-bible': {
        filename: 'FoodBible.pdf',
        downloadName: 'The-Food-Bible.pdf',
        title: 'The Food Bible',
        subject: 'Welcome to Your Health Journey - The Food Bible'
    },
    'muscle-builder-pro': {
        filename: 'MuscleBuilderPro.pdf',
        downloadName: 'Muscle-Builder-Pro.pdf',
        title: 'Muscle Builder Pro',
        subject: 'Your Muscle Builder Pro Meal Plan - Eat Real'
    },
    'primal-power': {
        filename: 'PrimalPower.pdf',
        downloadName: 'Primal-Power.pdf',
        title: 'Primal Power',
        subject: 'Your Primal Power Meal Plan - Eat Real'
    },
    'plant-based-performance': {
        filename: 'PlantBasedPerformance.pdf',
        downloadName: 'Plant-Based-Performance.pdf',
        title: 'Plant-Based Performance',
        subject: 'Your Plant-Based Performance Meal Plan - Eat Real'
    }
};

// Helper function to get product path
const getProductPath = (productKey) => {
    const product = PRODUCTS[productKey];
    if (!product) return null;
    
    return process.env.NODE_ENV === 'production' 
        ? path.join(process.cwd(), 'assets', 'products', product.filename)
        : path.join(__dirname, 'assets', 'products', product.filename);
};

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

// Helper function to get email template
const getEmailTemplate = (productKey, productTitle) => {
    if (productKey === 'food-bible') {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logo" alt="Eat Real Logo" style="width: 120px; height: auto;">
                </div>
                <h1 style="color: #8B4513; text-align: center;">Thank You for Purchasing ${productTitle}!</h1>
                
                <p>Dear Health Enthusiast,</p>
                
                <p>Thank you for taking the first step towards a healthier, more vibrant you! We're truly excited to be part of your wellness journey.</p>
                
                <p>Your copy of ${productTitle} is attached to this email. This comprehensive guide is designed to transform your relationship with food and help you make informed, healthy choices every day.</p>
                
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
        `;
    } else if (productKey === 'muscle-builder-pro') {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logo" alt="Eat Real Logo" style="width: 120px; height: auto;">
                </div>
                <h1 style="color: #45B26B; text-align: center;">Welcome to ${productTitle}! 💪</h1>
                
                <p>Dear Future Muscle Builder,</p>
                
                <p>Congratulations on taking the next step in your muscle-building journey! You've just unlocked the nutrition secrets that will fuel your gains and transform your physique.</p>
                
                <p>Your ${productTitle} meal plan is attached and ready to power your workouts. This isn't just another meal plan - it's your blueprint for building lean muscle mass through strategic nutrition.</p>
                
                <h2 style="color: #45B26B; margin-top: 20px;">🔥 What Makes This Special:</h2>
                <ul>
                    <li><strong>High-Protein Powerhouse:</strong> Optimized protein timing for maximum muscle protein synthesis</li>
                    <li><strong>Strategic Carb Cycling:</strong> Fuel your workouts and recovery like a pro</li>
                    <li><strong>Anabolic Meal Timing:</strong> When to eat for maximum muscle growth</li>
                    <li><strong>Complete Shopping Lists:</strong> Never guess what to buy again</li>
                    <li><strong>Macro Breakdowns:</strong> Track your gains with precision</li>
                </ul>

                <h2 style="color: #45B26B; margin-top: 20px;">🚀 Your Action Plan:</h2>
                <ol>
                    <li><strong>Week 1:</strong> Follow the meal plan exactly as written</li>
                    <li><strong>Track Everything:</strong> Log your workouts and nutrition</li>
                    <li><strong>Stay Consistent:</strong> Results come from consistency, not perfection</li>
                    <li><strong>Adjust as Needed:</strong> Fine-tune portions based on your progress</li>
                </ol>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #45B26B; margin-top: 0;">💡 Pro Tips for Success:</h3>
                    <ul style="margin-bottom: 0;">
                        <li>Meal prep on Sundays for the entire week</li>
                        <li>Keep protein sources varied to prevent boredom</li>
                        <li>Time your largest meals around your workouts</li>
                        <li>Stay hydrated - aim for at least 3 liters per day</li>
                    </ul>
                </div>

                <p style="margin-top: 20px;">Remember: Every champion was once a beginner who refused to give up. Your muscle-building journey starts NOW!</p>

                <p>Questions about your plan? We're here to help at <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a></p>

                <p><strong>Let's build something amazing together!</strong><br>
                The Eat Real Team 💪</p>
                
                <hr style="border: 1px solid #FDEECE; margin: 20px 0;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                    Need support? Contact us at: <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a>
                </p>
            </div>
        `;
    } else if (productKey === 'primal-power') {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logo" alt="Eat Real Logo" style="width: 120px; height: auto;">
                </div>
                <h1 style="color: #45B26B; text-align: center;">Welcome to ${productTitle}! 🔥</h1>
                
                <p>Dear Primal Warrior,</p>
                
                <p>You've just unlocked the nutritional wisdom of our ancestors! Primal Power isn't just a meal plan - it's a return to the foods that built strong, resilient humans for thousands of years.</p>
                
                <p>Your ${productTitle} plan is attached and ready to unleash your primal potential. Get ready to experience the energy, strength, and vitality that comes from eating the way nature intended.</p>
                
                <h2 style="color: #45B26B; margin-top: 20px;">🦴 The Primal Advantage:</h2>
                <ul>
                    <li><strong>Nutrient-Dense Powerfoods:</strong> Organ meats, grass-fed proteins, and ancestral superfoods</li>
                    <li><strong>Anti-Inflammatory Focus:</strong> Reduce inflammation and optimize recovery</li>
                    <li><strong>Hormonal Optimization:</strong> Support natural testosterone and growth hormone production</li>
                    <li><strong>Metabolic Flexibility:</strong> Train your body to burn fat efficiently</li>
                    <li><strong>Seasonal Eating:</strong> Align your nutrition with natural cycles</li>
                </ul>

                <h2 style="color: #45B26B; margin-top: 20px;">🎯 Your Primal Protocol:</h2>
                <ol>
                    <li><strong>Start Gradually:</strong> Transition slowly if coming from a modern diet</li>
                    <li><strong>Source Quality:</strong> Prioritize grass-fed, wild-caught, and organic when possible</li>
                    <li><strong>Listen to Your Body:</strong> Pay attention to energy levels and recovery</li>
                    <li><strong>Embrace Fat:</strong> Don't fear healthy fats - they're your fuel source</li>
                </ol>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #45B26B; margin-top: 0;">🔥 Primal Power Principles:</h3>
                    <ul style="margin-bottom: 0;">
                        <li>Eat nose-to-tail for complete nutrition</li>
                        <li>Time your carbs around activity</li>
                        <li>Include fermented foods for gut health</li>
                        <li>Fast intermittently to enhance metabolic flexibility</li>
                        <li>Prioritize sleep and stress management</li>
                    </ul>
                </div>

                <p style="margin-top: 20px;">You're not just changing your diet - you're reclaiming your birthright to optimal health and performance. The primal path awaits!</p>

                <p>Questions about your primal journey? Reach out to us at <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a></p>

                <p><strong>Unleash your primal power!</strong><br>
                The Eat Real Team 🔥</p>
                
                <hr style="border: 1px solid #FDEECE; margin: 20px 0;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                    Need guidance? Contact us at: <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a>
                </p>
            </div>
        `;
    } else if (productKey === 'plant-based-performance') {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logo" alt="Eat Real Logo" style="width: 120px; height: auto;">
                </div>
                <h1 style="color: #45B26B; text-align: center;">Welcome to ${productTitle}! 🌱</h1>
                
                <p>Dear Plant-Powered Athlete,</p>
                
                <p>Congratulations on choosing the path of plant-based performance! You're about to discover how the most powerful athletes in the world fuel their bodies with nothing but plants.</p>
                
                <p>Your ${productTitle} plan is attached and ready to revolutionize your performance. This isn't just about eating plants - it's about unlocking explosive energy, faster recovery, and peak performance through strategic plant nutrition.</p>
                
                <h2 style="color: #45B26B; margin-top: 20px;">🌿 Plant Power Advantages:</h2>
                <ul>
                    <li><strong>Complete Protein Profiles:</strong> All essential amino acids from plant sources</li>
                    <li><strong>Anti-Inflammatory Nutrition:</strong> Reduce inflammation and speed recovery</li>
                    <li><strong>Sustained Energy:</strong> Complex carbs for lasting endurance</li>
                    <li><strong>Optimal Digestion:</strong> High fiber for gut health and nutrient absorption</li>
                    <li><strong>Antioxidant Power:</strong> Fight free radicals and oxidative stress</li>
                </ul>

                <h2 style="color: #45B26B; margin-top: 20px;">🏃‍♂️ Your Performance Protocol:</h2>
                <ol>
                    <li><strong>Protein Timing:</strong> Strategic amino acid delivery around workouts</li>
                    <li><strong>Carb Loading:</strong> Plant-based carb strategies for endurance</li>
                    <li><strong>Recovery Nutrition:</strong> Anti-inflammatory meals for faster healing</li>
                    <li><strong>Micronutrient Density:</strong> Ensure you're hitting all vitamin and mineral targets</li>
                </ol>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #45B26B; margin-top: 0;">💚 Plant Performance Secrets:</h3>
                    <ul style="margin-bottom: 0;">
                        <li>Combine complementary proteins for complete amino acid profiles</li>
                        <li>Time your nitrate-rich foods before workouts for enhanced blood flow</li>
                        <li>Include B12 and iron-rich foods or supplements</li>
                        <li>Use plant-based protein powders strategically</li>
                        <li>Focus on whole foods over processed alternatives</li>
                    </ul>
                </div>

                <p style="margin-top: 20px;">You're joining an elite group of plant-powered athletes who prove that you don't need animal products to achieve peak performance. Your body - and the planet - will thank you!</p>

                <p>Questions about your plant-based journey? We're here to support you at <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a></p>

                <p><strong>Power up with plants!</strong><br>
                The Eat Real Team 🌱</p>
                
                <hr style="border: 1px solid #FDEECE; margin: 20px 0;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                    Need support? Contact us at: <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a>
                </p>
            </div>
        `;
    }
    
    // Fallback template if no match found
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="cid:logo" alt="Eat Real Logo" style="width: 120px; height: auto;">
            </div>
            <h1 style="color: #45B26B; text-align: center;">Thank You for Your Purchase!</h1>
            <p>Dear Customer,</p>
            <p>Thank you for your purchase of ${productTitle}. Your product is attached to this email.</p>
            <p>If you have any questions, please contact us at <a href="mailto:eatreal47@gmail.com">eatreal47@gmail.com</a></p>
            <p>Best regards,<br>The Eat Real Team</p>
        </div>
    `;
};

// Updated endpoint to handle all products
app.post('/api/send-purchase-email', async (req, res) => {
    const { email, product } = req.body;
    
    console.log('Attempting to send email to:', email, 'for product:', product);
    
    try {
        const productConfig = PRODUCTS[product];
        console.log('Product key:', product);
        console.log('Product config:', productConfig);

        const pdfPath = getProductPath(product);
        console.log('PDF path:', pdfPath);
        
        if (!fs.existsSync(pdfPath)) {
            const dir = path.dirname(pdfPath);
            console.log('Directory contents:', fs.readdirSync(dir));
            throw new Error('PDF file not found at: ' + pdfPath);
        }

        const emailTemplate = getEmailTemplate(product, productConfig.title);

        console.log('About to send email with attachment:', {
            filename: productConfig.downloadName,
            path: pdfPath,
            exists: fs.existsSync(pdfPath)
        });

        const info = await transporter.sendMail({
            from: {
                name: 'Eat Real',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: productConfig.subject,
            html: emailTemplate,
            attachments: [
                {
                    filename: productConfig.downloadName,
                    path: pdfPath
                },
                {
                    filename: 'EatRealLogo.png',
                    path: path.join(__dirname, 'assets', 'images', 'EatRealLogo.png'),
                    cid: 'logo'
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
            product: req.body.product
        });
    }
});

// Updated endpoint to handle all product downloads
app.post('/api/download-pdf', (req, res) => {
    const { product } = req.body;
    
    try {
        const productConfig = PRODUCTS[product];
        if (!productConfig) {
            throw new Error('Invalid product specified');
        }
        
        const pdfPath = getProductPath(product);
        if (!fs.existsSync(pdfPath)) {
            throw new Error('PDF file not found');
        }
        
        res.download(pdfPath, productConfig.downloadName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).send('Error downloading file: ' + error.message);
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

// Add this new endpoint
app.post('/api/submit-questionnaire', async (req, res) => {
    try {
        const { answers, emailContent } = req.body;
        
        // Send email with nutrition plan
        await transporter.sendMail({
            from: {
                name: 'Eat Real',
                address: process.env.EMAIL_USER
            },
            to: answers.email,
            subject: 'Your Personalized Nutrition Plan - Eat Real',
            html: emailContent,
            attachments: [
                {
                    filename: 'EatRealLogo.png',
                    path: path.join(__dirname, 'assets', 'images', 'EatRealLogo.png'),
                    cid: 'logo'
                }
            ]
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Questionnaire submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});