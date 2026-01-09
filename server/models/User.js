const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student',
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    learningProgress: [{
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
        lastWatched: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }
    }],
    learningHours: {
        type: Number,
        default: 0,
    },
    learningPoints: {
        type: Number,
        default: 0,
    },
    checkpointsReached: [{
        type: Number,
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
