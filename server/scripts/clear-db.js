const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// 🛡️ SAFETY CHECK
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cleanup blocked in production!');
  process.exit(1);
}

const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Payment = require('../models/Payment');

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for cleanup');

    // 🔍 Pre-clean counts
    const users = await User.countDocuments();
    const courses = await Course.countDocuments();
    const lessons = await Lesson.countDocuments();
    

    console.log(`Before cleanup:
    - Users: ${users}
    - Courses: ${courses}
    - Lessons: ${lessons}
    `);

    // 🧹 DELETE DATA
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Payment.deleteMany({});

    // 🛑 KEEP ADMINS
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    
    console.log(`Deleted ${result.deletedCount} non-admin users`);

    console.log('✅ Cleanup successful');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
};

clearDB();
