// Add console.log to verify script is loading
console.log('Payment.js loaded');

const RENDER_URL = 'https://eatreal-backend.onrender.com';

// Get PayPal client ID from backend
fetch(`${RENDER_URL}/api/get-paypal-config`)
    .then(response => {
        console.log('PayPal config response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(config => {
        console.log('PayPal config received, loading SDK...');
        return new Promise((resolve, reject) => {
            const paypalScript = document.createElement('script');
            paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${config.clientId}&currency=GBP`;
            paypalScript.onload = () => {
                console.log('PayPal SDK loaded successfully');
                resolve();
            };
            paypalScript.onerror = () => {
                reject(new Error('Failed to load PayPal SDK'));
            };
            document.head.appendChild(paypalScript);
        });
    })
    .then(() => {
        console.log('Initializing PayPal buttons...');
        initializePayPalButtons();
    })
    .catch(error => {
        console.error('Error in PayPal setup:', error);
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = `
                <div style="color: red; padding: 10px; text-align: center;">
                    Payment system temporarily unavailable. Please try again later.<br>
                    Error: ${error.message}
                </div>
            `;
        }
    });

let currentPrice = 14.99;
const originalPrice = 14.99;

// Find the existing Apply button and add click handler
document.querySelector('.apply').addEventListener('click', function() {
    const discountCode = document.querySelector('input[placeholder="Enter promo code"]').value.toUpperCase();
    
    if (discountCode === 'EATREAL20') {
        // Apply 20% discount
        currentPrice = (originalPrice * 0.8).toFixed(2);
        
        // Update total price display
        document.querySelector('.total-amount').textContent = `£${currentPrice}`;
        
        // Disable the input and button
        document.querySelector('input[placeholder="Enter promo code"]').disabled = true;
        document.querySelector('.apply').disabled = true;
        
        // Show success message
        alert('20% discount applied!');
        
        // Reinitialize PayPal with new price
        document.getElementById('paypal-button-container').innerHTML = '';
        initializePayPalButtons();
    } else {
        alert('Invalid discount code');
    }
});

// PayPal button initialization
function initializePayPalButtons() {
    // Clear existing content
    const mainContainer = document.getElementById('paypal-button-container');
    mainContainer.innerHTML = '';
    
    // Create container for PayPal button
    const paypalContainer = document.createElement('div');
    paypalContainer.id = 'paypal-primary-button';
    
    // Create single or separator
    const orSeparator = document.createElement('div');
    orSeparator.className = 'payment-separator';
    orSeparator.innerHTML = '<span>or</span>';
    
    // Create container for card button
    const cardContainer = document.createElement('div');
    cardContainer.id = 'paypal-card-button';
    
    // Add elements in order
    mainContainer.appendChild(paypalContainer);
    mainContainer.appendChild(orSeparator);  // Only one "or" separator
    mainContainer.appendChild(cardContainer);

    // Render PayPal button
    paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,
        style: {
            layout: 'horizontal',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: currentPrice
                    }
                }]
            });
        },
        // ... rest of your PayPal button code
    }).render('#paypal-primary-button');

    // Render card button
    paypal.Buttons({
        fundingSource: paypal.FUNDING.CARD,
        style: {
            layout: 'horizontal',
            color: 'black',
            shape: 'rect',
            label: 'pay'
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: currentPrice
                    }
                }]
            });
        },
        // ... rest of your PayPal button code
    }).render('#paypal-card-button');
}

// Initialize the buttons when the script loads
initializePayPalButtons();

function showSuccess() {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.style.display = 'block';
        successDiv.textContent = 'Thank you for your purchase! Your download will begin automatically, and we\'ve sent a copy to your email.';
    }
}

function triggerDownload() {
    fetch(`${RENDER_URL}/api/download-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: document.getElementById('email').value
        })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'The-Food-Bible.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
}
