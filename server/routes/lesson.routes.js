const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // for thumbnails if needed
const uploadVideo = require('../middleware/videoUpload'); // for lessons
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
  uploadVideo.single('video'),
  lessonController.addLesson
);
/**
 * @route   POST /api/lessons/evaluate
 * @desc    Evaluate student answer using AI
 * @access  Private
 */
router.post(
  '/evaluate',
  auth,
  lessonController.evaluateAnswer
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
 * @route   GET /api/lessons/:id
 * @desc    Get single lesson with gating
 * @access  Private
 */
router.get(
  '/:id',
  (req, res, next) => {
    console.log("🟢 ROUTE MATCHED - ID:", req.params.id);
    next();
  },
  auth,
  (req, res, next) => {
    console.log("🟣 AUTH PASSED");
    next();
  },
  lessonController.getLessonById
);

/**
 * @route   GET /api/lessons/:id/next
 * @desc    Get next lesson in course if current is completed
 * @access  Private
 */
router.get(
  '/:id/next',
  auth,
  lessonController.getNextLesson
);

/**
 * @route   PATCH /api/lessons/:id
 * @desc    Update a lesson
 * @access  Private (Instructor/Admin)
 */
router.patch(
  '/:id',
  auth,
  uploadVideo.single('video'),
  lessonController.updateLesson
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

/**
 * @route   POST /api/lessons/:id/review
 * @desc    Approve or Reject a lesson
 * @access  Private (Admin)
 */
router.post(
  '/:id/review',
  auth,
  requireAdmin,
  lessonController.reviewLesson
);

// GET /instructor/lesson-processing
router.get(
  '/instructor/lesson-processing',
  auth,
  lessonController.getInstructorLessonProcessing
);

module.exports = router;
