const User = require('../models/User');
const Lesson = require('../models/Lesson');

/**
 * Update general progress (Last watched)
 */
exports.updateProgress = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;

        if (!courseId || !lessonId) {
            return res.status(400).json({ msg: 'Course ID and Lesson ID are required' });
        }

        const user = await User.findById(userId);
        if (!user.enrolledCourses.includes(courseId)) {
            return res.status(403).json({ msg: 'Not enrolled in this course' });
        }

        let progressEntry = user.learningProgress.find(p => p.course.toString() === courseId);
        if (!progressEntry) {
            progressEntry = { course: courseId, lessons: [], lastWatched: lessonId };
            user.learningProgress.push(progressEntry);
            progressEntry = user.learningProgress[user.learningProgress.length - 1];
        }

        progressEntry.lastWatched = lessonId;

        // Ensure lesson entry exists in progress
        let lessonProgress = progressEntry.lessons.find(l => l.lessonId.toString() === lessonId);
        if (!lessonProgress) {
            progressEntry.lessons.push({ lessonId });
        }

        await user.save();
        res.json(progressEntry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Handle Video Completion
 */
exports.markVideoComplete = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        let progressEntry = user.learningProgress.find(p => p.course.toString() === courseId);

        if (!progressEntry) return res.status(404).json({ msg: "Progress not found" });

        let lessonProgress = progressEntry.lessons.find(l => l.lessonId.toString() === lessonId);
        if (!lessonProgress) {
            progressEntry.lessons.push({ lessonId, videoCompleted: true });
        } else {
            lessonProgress.videoCompleted = true;
        }

        await user.save();
        res.json({ msg: "Video marked as complete", progress: progressEntry });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Handle Notes Viewed
 */
exports.markNotesViewed = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        let progressEntry = user.learningProgress.find(p => p.course.toString() === courseId);

        if (!progressEntry) return res.status(404).json({ msg: "Progress not found" });

        let lessonProgress = progressEntry.lessons.find(l => l.lessonId.toString() === lessonId);
        if (lessonProgress) {
            lessonProgress.notesViewed = true;
            await user.save();
        }

        res.json({ msg: "Notes marked as viewed", progress: progressEntry });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Get Progress
 */
exports.getProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const progressEntry = user.learningProgress.find(p => p.course.toString() === courseId);

        if (!progressEntry) {
            return res.json({ lessons: [], lastWatched: null });
        }

        res.json(progressEntry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Handle Quiz/Questions Completion
 */
exports.markQuestionsComplete = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        let progressEntry = user.learningProgress.find(p => p.course.toString() === courseId);

        if (!progressEntry) return res.status(404).json({ msg: "Progress not found" });

        let lessonProgress = progressEntry.lessons.find(l => l.lessonId.toString() === lessonId);

        if (!lessonProgress) {
            progressEntry.lessons.push({
                lessonId,
                questionsAnswered: true,
                lessonCompleted: true
            });
        } else {
            lessonProgress.questionsAnswered = true;
            lessonProgress.lessonCompleted = true;
        }

        await user.save();
        res.json({ msg: "Quiz completed, lesson unlocked", progress: progressEntry });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
