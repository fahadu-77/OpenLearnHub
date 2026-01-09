const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  validateDescriptiveAnswer,
} = require('../controllers/answerValidationController');

router.post('/validate', auth, validateDescriptiveAnswer);

module.exports = router;
