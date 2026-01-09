const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const {
    getDashboardStats,
    getActivityLogs,
    getAllUsers,
    updateUserRole,
    getAllCoursesAdmin
} = require('../controllers/admin.controller');

// Block all routes in this file for non-admins
router.use(auth, requireAdmin);

// Stats & Logs
router.get('/stats', getDashboardStats);
router.get('/logs', getActivityLogs);

// User Management
router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);

// Course Management
router.get('/courses', getAllCoursesAdmin);

module.exports = router;
