const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Payment = require('../models/Payment');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB. Checking payments...');
        const payment = await Payment.findOne({ stripeSessionId: 'cs_test_session_123_test' });
        if (payment) {
            console.log('✅ Payment found:', payment);
        } else {
            console.log('❌ Payment NOT found.');
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
