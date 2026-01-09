const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // multer + cloudinary
const lessonController = require('../controllers/lesson.controller');

const { requireAdmin } = require('../middleware/roles');

// No transcript routes needed anymore
/**
 * @route   POST /api/lessons
 * @desc    Create a new lesson (uploaded video only)
 * @access  Private (Instructor)
 */
router.post(
  '/',
  auth,
  upload.single('video'),
  lessonController.addLesson
);

/**
 * @route   GET /api/lessons/admin/all
 * @desc    Get all lessons for admin
 * @access  Private (Admin)
 */
router.get(
  '/admin/all',
  auth,
  requireAdmin,
  lessonController.getAllLessonsAdmin
);

/**
 * @route   GET /api/lessons/course/:courseId
 * @desc    Get all lessons for a course
 * @access  Public
 */
router.get(
  '/course/:courseId',
  lessonController.getLessonsByCourse
);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete a lesson
 * @access  Private (Instructor)
 */
router.delete(
  '/:id',
  auth,
  lessonController.deleteLesson
);

module.exports = router;
