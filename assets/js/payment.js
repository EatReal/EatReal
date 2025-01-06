// Add console.log to verify script is loading
console.log('Payment.js loaded');

const RENDER_URL = 'https://eatreal-backend.onrender.com'; // Replace this with your actual Render URL

// Get PayPal client ID from backend
fetch(`${RENDER_URL}/api/get-paypal-config`)
    .then(response => response.json())
    .then(config => {
        const paypalScript = document.createElement('script');
        paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${config.clientId}`;
        document.head.appendChild(paypalScript);
    });

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

            return fetch(`https://eatreal-backend.onrender.com/api/create-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value
                })
            })
            .then(response => response.json())
            .then(orderData => orderData.id);
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                const customerEmail = document.getElementById('email').value;
                
                return fetch(`https://eatreal-backend.onrender.com/api/payment-success`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderID: data.orderID,
                        email: customerEmail
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showSuccess();
                        triggerDownload();
                    } else {
                        alert('There was a problem processing your order. Please contact support.');
                    }
                });
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
