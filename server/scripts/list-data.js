const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB...');

        const user = await User.findOne({ email: 'admin@olh.com' });
        const course = await Course.findOne();

        console.log('--- VALID DATA ---');
        console.log(`User ID: ${user ? user._id : 'NONE'}`);
        console.log(`Course ID: ${course ? course._id : 'NONE'}`);

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
