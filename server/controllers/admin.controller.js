const User = require('../models/User');
const Course = require('../models/Course');
const AdminLog = require('../models/AdminLog');
const logAdminAction = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// --- Dashboard & Stats ---

exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalInstructors = await User.countDocuments({ role: 'instructor' });

        // Basic revenue calculation (placeholder, ideally sum real transactions)
        // const totalRevenue = await Payment.aggregate(...) 

        res.json({
            users: totalUsers,
            courses: totalCourses,
            instructors: totalInstructors
        });
    } catch (err) {
        next(err);
    }
};

exports.getActivityLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const logs = await AdminLog.find()
            .populate('admin', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AdminLog.countDocuments();

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        next(err);
    }
};

// --- User Management ---

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { userId, role } = req.body;
        const validRoles = ['student', 'instructor', 'admin'];

        if (!validRoles.includes(role)) {
            return next(new ApiError(400, 'Invalid role'));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log action
        await logAdminAction(req.user.id, 'UPDATE_ROLE', user._id, { oldRole, newRole: role }, req);

        res.json({ msg: 'User role updated', user });
    } catch (err) {
        next(err);
    }
};

// --- Course Management ---

exports.getAllCoursesAdmin = async (req, res, next) => {
    try {
        // Return ALL courses, populating instructor
        const courses = await Course.find()
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        next(err);
    }
};
