// Add console.log to verify script is loading
console.log('Payment.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing buttons first
    document.getElementById('paypal-button-container').innerHTML = '';
    document.getElementById('paypal-card-button').innerHTML = '';

    // PayPal Button
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
        },
        fundingSource: paypal.FUNDING.PAYPAL,
        createOrder: function(data, actions) {
            const emailInput = document.getElementById('email');
            if (!emailInput.value || !emailInput.checkValidity()) {
                alert('Please enter a valid email address');
                return;
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
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                const customerEmail = document.getElementById('email').value;
                
                // Show success message
                showSuccess();
                
                // Trigger immediate download
                triggerDownload();
                
                // Send confirmation email with PDF
                sendConfirmationEmail(customerEmail);
            });
        }
    }).render('#paypal-button-container');

    // Card Payment Button
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'black',
            shape: 'rect',
            label: 'pay'
        },
        fundingSource: paypal.FUNDING.CARD,
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '14.99',
                        currency_code: 'GBP'
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                showSuccess();
            });
        }
    }).render('#paypal-card-button');
});

function showSuccess() {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.style.display = 'block';
        successDiv.textContent = 'Thank you for your purchase! Your download will begin automatically, and we\'ve sent a copy to your email.';
    }
}

function triggerDownload() {
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = 'assets/products/FoodBible.pdf'; // Path to your PDF
    link.download = 'The-Food-Bible.pdf'; // Name for downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function handlePayment(email) {
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        if (data.success) {
            await sendConfirmationEmail(email);
        }
    } catch (error) {
        console.error('Payment failed:', error);
    }
}

async function sendConfirmationEmail(email) {
    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}
