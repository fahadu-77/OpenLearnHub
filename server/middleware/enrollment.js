const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const checkEnrolled = async (req, res, next) => {
    try {
        const courseId = req.params.courseId || req.body.courseId;

        if (!courseId) {
            return res.status(400).json({ msg: 'Course ID required' });
        }

        const user = await User.findById(req.user.id);

        // 1. Admin access
        if (user.role === 'admin') {
            return next();
        }

        // 2. Instructor owner access
        if (user.role === 'instructor') {
            const course = await Course.findById(courseId);
            if (course && course.instructor.toString() === user.id) {
                return next();
            }
        }

        // 3. Enrolled student access
        if (user.enrolledCourses.includes(courseId)) {
            return next();
        }

        return res.status(403).json({ msg: 'Access denied. You are not enrolled in this course.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const checkLessonAccess = async (req, res, next) => {
    try {
        const lessonId = req.params.id;
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ msg: 'Lesson not found' });
        }

        // Strict channel-level access check (as per system requirements)

        const user = await User.findById(req.user.id);
        const courseId = lesson.course.toString();

        // 1. Admin access
        if (user.role === 'admin') {
            return next();
        }

        // 2. Instructor owner access
        if (user.role === 'instructor') {
            const course = await Course.findById(courseId);
            if (course && course.instructor.toString() === user.id) {
                return next();
            }
        }

        // 3. Enrolled student access
        if (user.enrolledCourses.includes(courseId)) {
            return next();
        }

        return res.status(403).json({ msg: 'Access denied. You must enroll to view this lesson.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { checkEnrolled, checkLessonAccess };
