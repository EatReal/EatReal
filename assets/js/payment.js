console.log('Payment.js loaded');

const RENDER_URL = 'https://eatreal-backend.onrender.com';

// Initialize PayPal
async function initializePayPal() {
    try {
        // First try to get the PayPal config from the server
        const response = await fetch(`${RENDER_URL}/api/get-paypal-config`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const config = await response.json();
        console.log('PayPal config received');

        // Load the PayPal SDK
        const paypalScript = document.createElement('script');
        paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${config.clientId}&currency=GBP`;
        paypalScript.async = true;
        
        // Wait for the script to load
        await new Promise((resolve, reject) => {
            paypalScript.onload = resolve;
            paypalScript.onerror = reject;
            document.head.appendChild(paypalScript);
        });

        console.log('PayPal SDK loaded successfully');
        initializePayPalButtons();

    } catch (error) {
        console.error('Error initializing PayPal:', error);
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = `
                <div style="color: red; padding: 10px; text-align: center;">
                    Payment system temporarily unavailable. Please try again later.
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePayPal);

function initializePayPalButtons() {
    console.log('Initializing PayPal buttons');
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded');
        return;
    }

    // Clear existing buttons
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = '';
    }

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
        },
        createOrder: function(data, actions) {
            const emailInput = document.getElementById('email');
            if (!emailInput.value || !emailInput.checkValidity()) {
                alert('Please enter a valid email address');
                return Promise.reject('Invalid email');
            }

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '14.99',
                        currency_code: 'GBP'
                    }
                }]
            });
        },
        onApprove: async function(data, actions) {
            const order = await actions.order.capture();
            const customerEmail = document.getElementById('email').value;
            
            try {
                const response = await fetch(`${RENDER_URL}/api/send-confirmation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: customerEmail,
                        orderId: order.id
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    showSuccess();
                } else {
                    alert('There was a problem processing your order. Please contact support.');
                }
            } catch (error) {
                console.error('Error processing order:', error);
                alert('There was a problem processing your order. Please contact support.');
            }
        }
    }).render('#paypal-button-container');
}

function showSuccess() {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.style.display = 'block';
        successDiv.textContent = 'Thank you for your purchase! Your download will begin automatically, and we\'ve sent a copy to your email.';
    }
}

function triggerDownload() {
    fetch(`https://eatreal-backend.onrender.com/api/download-pdf`, {
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
