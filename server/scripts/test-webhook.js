const stripe = require('stripe');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/api/payment/webhook`;

if (!WEBHOOK_SECRET) {
    console.error('Error: STRIPE_WEBHOOK_SECRET is not defined in .env');
    process.exit(1);
}

const payload = {
    id: 'evt_test_webhook_LOG_TEST',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
        object: {
            id: 'cs_test_session_REAL_USER_TEST_3', // NEW SESSION ID
            object: 'checkout.session',
            payment_status: 'paid',
            amount_total: 4999,
            currency: 'usd',
            metadata: {
                userId: '6954f24f0a719382fdfb9477', // Admin User
                courseId: '69411511011d138c12a2cb56' // Valid Course
            },
            client_reference_id: '6954f24f0a719382fdfb9477'
        }
    }
};

const payloadString = JSON.stringify(payload, null, 2);

// Create signature using the real secret
const signature = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: WEBHOOK_SECRET,
});

console.log(`Sending webhook to ${URL}...`);

async function sendWebhook() {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'stripe-signature': signature,
                'Content-Type': 'application/json'
            },
            body: payloadString
        });

        const text = await response.text();
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Body: ${text}`);
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

sendWebhook();
