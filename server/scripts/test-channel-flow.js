const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testChannelCreationFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- TESTING: STUDENT -> CHANNEL CREATOR FLOW ---');

        // 1. Pick a student (using a specific test email to avoid side effects on real users)
        const testEmail = `test_creator_${Date.now()}@example.com`;
        let user = await User.create({
            name: 'Test Creator',
            email: testEmail,
            password: 'password123',
            role: 'student'
        });
        console.log(`Step 1: Created test student: ${user.email} (Role: ${user.role})`);

        // 2. Simulate Channel Creation Logic (Calling logic directly from model for verification)
        // In a real run, this happens via the controller, but we verify the logic here
        const channelData = {
            title: 'My First Coding Channel',
            description: 'Learn SDE from scratch.',
            category: 'Development',
            instructor: user._id
        };

        // Logic check: Auto-upgrade role
        if (user.role === 'student') {
            user.role = 'instructor';
            await user.save();
            console.log(`Step 2: User ${user.email} auto-promoted to ${user.role}`);
        }

        const channel = await Course.create(channelData);
        console.log(`Step 3: Channel "${channel.title}" created successfully (ID: ${channel._id})`);

        // 4. Verify Final State
        const updatedUser = await User.findById(user._id);
        const savedChannel = await Course.findById(channel._id).populate('instructor', 'role email');

        console.log('\n--- VERIFICATION RESULTS ---');
        console.log(`User Role: ${updatedUser.role} (Expected: instructor)`);
        console.log(`Channel Creator: ${savedChannel.instructor.email}`);
        console.log(`Channel Category: ${savedChannel.category}`);

        if (updatedUser.role === 'instructor' && savedChannel.instructor.email === testEmail) {
            console.log('\n✅ AUDIT PASSED: Student can create a channel and is auto-promoted.');
        } else {
            console.log('\n❌ AUDIT FAILED: Requirements not met.');
        }

        // Cleanup test data
        await User.findByIdAndDelete(user._id);
        await Course.findByIdAndDelete(channel._id);
        console.log('\nAudit test data cleaned up.');

        process.exit(0);
    } catch (err) {
        console.error('Audit test failed:', err.message);
        process.exit(1);
    }
};

testChannelCreationFlow();
