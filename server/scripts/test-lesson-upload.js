const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { execSync } = require('child_process');

const API_URL = 'http://localhost:3000/api';

const run = async () => {
    try {
        console.log('--- TEST LESSON UPLOAD ---');

        // 1. Generate Token (using existing script logic for simplicity, or just hardcode if valid)
        // We will just run the gen-token script and parse output, or reimplement lightweight auth here.
        // Reimplementing lightweight auth:
        const jwt = require('jsonwebtoken');
        const mongoose = require('mongoose');
        const User = require('../models/User');
        require('dotenv').config({ path: path.join(__dirname, '../.env') });

        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne();
        if (!user) throw new Error('No user found');

        // Ensure user is instructor
        if (user.role !== 'instructor') {
            user.role = 'instructor';
            await user.save();
        }

        const token = jwt.sign({ user: { id: user.id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const course = await require('../models/Course').findOne();
        if (!course) throw new Error('No course found');

        console.log(`User: ${user.email} (${user.role})`);
        console.log(`Course: ${course.title} (${course._id})`);

        // 2. Download Dummy Video
        const videoPath = path.join(__dirname, 'test_video.mp4');
        console.log('Downloading sample video...');

        // Use curl to download for simplicity
        try {
            execSync(`curl -L -o "${videoPath}" "https://www.w3schools.com/html/mov_bbb.mp4"`);
        } catch (e) {
            console.error('Failed to download video:', e.message);
            process.exit(1);
        }

        // 3. Upload Lesson
        const formData = new FormData();
        formData.append('title', 'Test Video Lesson');
        formData.append('content', 'This is a test lesson with video upload.');
        formData.append('duration', '15');
        formData.append('courseId', course._id.toString());
        formData.append('lessonType', 'uploaded');
        formData.append('video', fs.createReadStream(videoPath), {
            filename: 'test_video.mp4',
            contentType: 'video/mp4',
        });

        console.log('Uploading lesson...');
        const res = await axios.post(`${API_URL}/lessons`, formData, {
            headers: {
                ...formData.getHeaders(),
                'x-auth-token': token
            }
        });

        console.log('✅ Lesson created successfully!');
        console.log('Lesson ID:', res.data._id);
        console.log('Video URL:', res.data.videoUrl);

        // Cleanup
        fs.unlinkSync(videoPath);
        process.exit(0);
    } catch (err) {
        console.error('❌ Upload Failed:', err.response?.data || err.message);
        if (fs.existsSync(path.join(__dirname, 'test_video.mp4'))) {
            fs.unlinkSync(path.join(__dirname, 'test_video.mp4'));
        }
        process.exit(1);
    }
};

run();
