const express = require('express');
const router = express.Router();
const { register, login, getMe, becomeInstructor, getAllUsers, deleteUser } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const {requireAdmin} = require('../middleware/roles');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/become-instructor', auth, becomeInstructor);

// Admin routes
router.get('/users', auth, requireAdmin, getAllUsers);
router.delete('/users/:id', auth, requireAdmin, deleteUser);

module.exports = router;
