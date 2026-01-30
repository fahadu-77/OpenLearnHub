const User = require('../models/User');
const Course = require('../models/Course');
const AdminLog = require('../models/AdminLog');
const logAdminAction = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const Payment = require('../models/Payment');
const Lesson = require('../models/Lesson');

// --- Dashboard & Stats ---

exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student'}); 
        const totalCourses = await Course.countDocuments();
        const totalInstructors = await User.countDocuments({ role: 'instructor' });

        const revenueData = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
            const totalRevenue = revenueData[0]?.totalRevenue || 0;

        res.json({
            users: totalUsers,
            courses: totalCourses,
            instructors: totalInstructors,
            revenue: totalRevenue
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

exports.getModerationActivity = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      status: { $in: ["blocked", "pending_review", "rejected", "published","approved"] }
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("course", "title") 
      .select("title status updatedAt course moderationResult");

    res.json({ activities: lessons });
    
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: "Failed to fetch moderation activity" });
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

exports.getPaymentStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
console.log(startOfMonth, startOfLastMonth);
    const [totalAgg] = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const [thisMonthAgg] = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const [lastMonthAgg] = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: startOfLastMonth,
            $lt: startOfMonth
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalRevenue: totalAgg?.total || 0,
      monthlyRevenue: thisMonthAgg?.total || 0,
      lastMonthRevenue: lastMonthAgg?.total || 0
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentTransactions = async (req, res, next) => {
  try {
    const transactions = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name email')
      .populate('course', 'title');

    res.json({
      transactions: transactions.map(p => ({
        id: p.stripeSessionId,
        student: p.user?.name || 'Unknown',
        course: p.course?.title || 'Unknown',
        amount: p.amount,
        status: p.status,
        date: p.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};

