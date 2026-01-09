const User = require('../models/User');
const Lesson = require('../models/Lesson');
const CompletionToken = require('../models/CompletionToken');
const crypto = require('crypto');

exports.updateProgress = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;

        if (!courseId || !lessonId) {
            return res.status(400).json({ msg: 'Course ID and Lesson ID are required' });
        }

        const user = await User.findById(userId);

        // Check if user is enrolled
        if (!user.enrolledCourses.includes(courseId)) {
            return res.status(403).json({ msg: 'Not enrolled in this course' });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ msg: 'Lesson not found' });
        }

        // Find progress entry for this course
        let progressEntry = user.learningProgress.find(p => p.course.toString() === courseId);

        if (!progressEntry) {
            // Initialize if not exists
            progressEntry = {
                course: courseId,
                completedLessons: [],
                lastWatched: lessonId
            };
            user.learningProgress.push(progressEntry);
            progressEntry = user.learningProgress[user.learningProgress.length - 1]; // Get reference
        }

        // Update last watched
        progressEntry.lastWatched = lessonId;

        // Add to completed if not already there
        if (!progressEntry.completedLessons.includes(lessonId)) {
            progressEntry.completedLessons.push(lessonId);
        }

        await user.save();

        res.json(progressEntry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const progressEntry = user.learningProgress.find(p => p.course.toString() === courseId);

        if (!progressEntry) {
            return res.json({ completedLessons: [], lastWatched: null });
        }

        res.json(progressEntry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
