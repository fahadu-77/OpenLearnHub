const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    updateProgress,
    getProgress,
    markVideoComplete,
    markNotesViewed,
    markQuestionsComplete
} = require('../controllers/progress.controller');

// @route   POST api/progress
// @access  Private
router.post('/', auth, updateProgress);

router.post('/video-complete', auth, markVideoComplete);
router.post('/notes-viewed', auth, markNotesViewed);
router.post('/questions-complete', auth, markQuestionsComplete);

// @route   GET api/progress/:courseId
// @access  Private
router.get('/:courseId', auth, getProgress);

module.exports = router;
