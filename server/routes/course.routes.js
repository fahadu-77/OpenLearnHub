const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createChannel, getAllCourses, getCourseById, enrollChannel } = require('../controllers/course.controller');

// @route   GET api/courses
// @access  Public
router.get('/', getAllCourses);

// @route   GET api/courses/:id
// @access  Public
router.get('/:id', getCourseById);

const { requireInstructor } = require('../middleware/roles');

// @route   POST api/courses
// @access  Private (Registered users)
router.post('/', auth, upload.single('thumbnail'), createChannel);

// @route   POST api/courses/:id/enroll
// @access  Private
router.post('/:id/enroll', auth, enrollChannel);

const { deleteCourse } = require('../controllers/course.controller');

// @route   DELETE api/courses/:id
// @access  Private (Instructor only)
router.delete('/:id', auth, requireInstructor, deleteCourse);

module.exports = router;
