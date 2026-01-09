const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { updateProgress, getProgress } = require('../controllers/progress.controller');

// @route   POST api/progress
// @access  Private
router.post('/', auth, updateProgress);

// @route   GET api/progress/:courseId
// @access  Private
router.get('/:courseId', auth, getProgress);

module.exports = router;
