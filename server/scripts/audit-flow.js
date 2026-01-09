const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');

dotenv.config({ path: path.join(__dirname, '../.env') });

const auditFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- SYSTEM AUDIT: CHANNEL FLOW ---');

        // 1. Check if any students exist
        const students = await User.find({ role: 'student' }).limit(5);
        console.log(`\nFound ${students.length} students for testing.`);
        students.forEach(s => console.log(`- Student: ${s.email} (ID: ${s._id})`));

        // 2. Check if any instructors exist
        const instructors = await User.find({ role: 'instructor' });
        console.log(`\nFound ${instructors.length} instructors.`);
        instructors.forEach(i => console.log(`- Instructor: ${i.email} (ID: ${i._id})`));

        // 3. Check for Channels (Courses)
        const channels = await Course.find().populate('instructor', 'email');
        console.log(`\nFound ${channels.length} Channels.`);
        channels.forEach(c => {
            console.log(`- Channel: "${c.title}" | Creator: ${c.instructor ? c.instructor.email : 'UNKNOWN'} | Lessons: ${c.lessons.length}`);
        });

        console.log('\n--- AUDIT COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Audit failed:', err.message);
        process.exit(1);
    }
};

auditFlow();
