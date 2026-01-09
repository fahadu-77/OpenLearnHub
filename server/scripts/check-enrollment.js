const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB. Checking user enrollment...');
        // Correct User ID used in webhook
        const user = await User.findById('6954f24f0a719382fdfb9477');
        if (user) {
            // Correct Course ID used in webhook
            const isEnrolled = user.enrolledCourses && user.enrolledCourses.map(id => id.toString()).includes('69411511011d138c12a2cb56');
            console.log(`User found: ${user.name}`);
            console.log(`Enrolled in course? ${isEnrolled ? '✅ YES' : '❌ NO'}`);
            console.log('Enrolled Courses:', user.enrolledCourses);
        } else {
            console.log('❌ User NOT found.');
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
