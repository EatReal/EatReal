const RENDER_URL = 'https://eatreal-backend.onrender.com';
const PRODUCT_KEY = 'muscle-builder-pro';

document.getElementById('paypal-button-container').innerHTML = `
    <div style="text-align: center; padding: 20px;">
        <p>Loading payment options...</p>
        <div class="loading-spinner"></div>
    </div>
`;

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

let currentPrice = 4.99;
const originalPrice = 4.99;

const loaderContainer = document.querySelector('.loader-container');
const paypalButtonContainer = document.getElementById('paypal-button-container');

// Find the existing Apply button and add click handler
document.querySelector('.apply').addEventListener('click', function() {
    const discountCode = document.querySelector('input[placeholder="Enter promo code here"]').value.toUpperCase();
    
    if (discountCode === 'EATREAL20') {
        // Apply 20% discount
        currentPrice = (originalPrice * 0.8).toFixed(2);
    } else if (discountCode === 'TEST10P') {
        // Test discount - sets price to 0.10
        currentPrice = 0.10;
    } else {
        alert('Invalid discount code');
        return;
    }
    
    // Update total price display
    document.querySelector('.total-amount').textContent = `£${currentPrice}`;
    
    // Disable the input and button
    document.querySelector('input[placeholder="Enter promo code here"]').disabled = true;
    document.querySelector('.apply').disabled = true;
    
    // Show success message
    alert('Discount applied!');
    
    // Reinitialize PayPal with new price
    document.getElementById('paypal-button-container').innerHTML = '';
    initializePayPalButtons();
});

function initializePayPalButtons() {
    console.log('Initializing PayPal buttons with price:', currentPrice);
    
    // Clear existing content
    document.getElementById('paypal-button-container').innerHTML = `
        <div id="paypal-primary-button"></div>
        <div id="paypal-card-button"></div>
    `;

    // Helper functions
    const showLoader = function() {
        if(loaderContainer) {
            loaderContainer.style.display = 'block';
            return true;
        }
        return false;
    };

    const hideLoader = function() {
        if(loaderContainer) loaderContainer.style.display = 'none';
    };

    // Common order handling function
    const handleOrderSuccess = function(data, actions) {
        console.log('Payment successful, starting order handling...');
        if(loaderContainer) loaderContainer.style.display = 'none';
        return actions.order.capture().then(function(details) {
            console.log('Order captured, details:', details);
            
            // Get email from input
            const email = document.querySelector('input[type="email"]').value;
            console.log('Customer email:', email);
            
            // Show loading state
            const successDiv = document.getElementById('success-message');
            successDiv.style.display = 'block';
            successDiv.textContent = 'Processing your purchase...';
            
            // Send email with product key
            console.log('Sending email request to:', `${RENDER_URL}/api/send-purchase-email`);
            fetch(`${RENDER_URL}/api/send-purchase-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email,
                    product: PRODUCT_KEY 
                })
            })
            .then(response => {
                console.log('Email API response:', response);
                return response.json();
            })
            .then(data => {
                console.log('Email API data:', data);
                if (data.success) {
                    showSuccess();
                    triggerDownload();
                } else {
                    throw new Error('Failed to send email');
                }
            })
            .catch(error => {
                console.error('Error in email process:', error);
                successDiv.textContent = 'Purchase successful but email delivery failed. Please contact support.';
            });
        });
    };

    // Render PayPal button
    paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,
        style: {
            layout: 'horizontal',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
        },
        onClick: function(data, actions) {
            if (!showLoader()) {
                return actions.reject();
            }
        },
        createOrder: function(data, actions) {
            console.log('Creating PayPal order...');
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: currentPrice
                    }
                }]
            });
        },
        onApprove: handleOrderSuccess,
        onCancel: function(data) {
            console.log('PayPal payment cancelled:', data);
            hideLoader();
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            hideLoader();
            const errorDiv = document.getElementById('error-message');
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Payment failed. Please try again.';
        }
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
        onClick: function(data, actions) {
            if (!showLoader()) {
                return actions.reject();
            }
        },
        createOrder: function(data, actions) {
            console.log('Creating card order...');
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: currentPrice
                    }
                }]
            });
        },
        onApprove: handleOrderSuccess,
        onCancel: function(data) {
            console.log('Card payment cancelled:', data);
            hideLoader();
        },
        onError: function(err) {
            console.error('Card payment error:', err);
            hideLoader();
            const errorDiv = document.getElementById('error-message');
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Payment failed. Please try again.';
        }
    }).render('#paypal-card-button');
}

function showSuccess() {
    console.log('Showing success message...');
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.style.display = 'block';
        successDiv.textContent = 'Thank you for your purchase! Your download will begin automatically.';
        
        // Redirect to thank you page after a short delay
        setTimeout(() => {
            console.log('Redirecting to thank you page...');
            window.location.href = 'thanks.html';
        }, 2000);
    }
}

function triggerDownload() {
    console.log('Triggering download...');
    fetch(`${RENDER_URL}/api/download-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: document.querySelector('input[type="email"]').value,
            product: PRODUCT_KEY
        })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Muscle-Builder-Pro.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Download initiated');
    })
    .catch(error => {
        console.error('Download error:', error);
    });
} 