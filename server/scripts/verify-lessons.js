const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');

// Load env vars
// require('dotenv').config(); // Not using dotenv package here to keep it simple, will rely on default or passing env var

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/udemy-clone');

        const count = await Lesson.countDocuments({ videoUrl: { $exists: true } });
        console.log(`Lessons with videoUrl: ${count}`);

        const sample = await Lesson.findOne({ videoUrl: { $exists: true } });
        if (sample) {
            console.log('Sample Lesson:', sample.title, sample.videoUrl);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
 