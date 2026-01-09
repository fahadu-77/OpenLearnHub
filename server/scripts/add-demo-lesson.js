const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const dotenv = require('dotenv');

dotenv.config();

const addDemoLesson = async (courseId) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const course = await Course.findById(courseId);
        if (!course) {
            console.error('Course not found');
            process.exit(1);
        }

        const demoLesson = new Lesson({
            title: 'Introduction to Web Development (Demo)',
            content: 'This is a demo lesson added via script to verify functionality.',
            course: courseId,
            duration: '15',
            videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            lessonType: 'youtube',
            transcript: 'Welcome to this demo lesson. We are testing the application flow.',
            createdBy: course.instructor
        });

        await demoLesson.save();

        course.lessons.push(demoLesson._id);
        await course.save();

        console.log('Demo lesson added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error adding demo lesson:', err.message);
        process.exit(1);
    }
};

const courseId = process.argv[2];
if (!courseId) {
    console.error('Please provide a Course ID: node server/scripts/add-demo-lesson.js <COURSE_ID>');
    process.exit(1);
}

addDemoLesson(courseId);
