const mongoose = require('mongoose');
const Course = require('../models/Course');

// Env vars are loaded via --env-file command line flag

const fixUrls = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is undefined. Make sure to run with --env-file=.env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const courses = await Course.find({ thumbnail: /localhost:5000/ });
        console.log(`Found ${courses.length} courses with old port.`);

        for (const course of courses) {
            course.thumbnail = course.thumbnail.replace('localhost:5000', 'localhost:3000');
            await course.save();
            console.log(`Updated course: ${course.title}`);
        }

        console.log('All courses updated.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixUrls();
