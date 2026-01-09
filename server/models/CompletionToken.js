const mongoose = require('mongoose');

const completionTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    completionType: {
        type: String,
        enum: ['uploaded', 'youtube'],
        default: 'youtube',
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

// Ensure unique completion per user per lesson
completionTokenSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('CompletionToken', completionTokenSchema);
