/**
 * ⚠️ WARNING
 * This script will MODIFY your database.
 * NEVER run in production.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MODELS (adjust paths)
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Payment = require('../models/Payment');

const clearDb = require('./clear-db');

const TOTAL_INSTRUCTORS = 20;
const TOTAL_STUDENTS = 100;
const COURSES_PER_INSTRUCTOR = 2;
const LESSONS_PER_COURSE = 5;

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ DB connected');
}

// async function createAdmin() {
//   const admin = await User.create({
//     name: 'Admin',
//     email: 'admin@test.com',
//     role: 'admin',
//     password: await bcrypt.hash('admin123', 10),
//     isVerified: true,
//   });

//   return admin;
// }

async function createInstructors() {
  const instructors = [];

  for (let i = 1; i <= TOTAL_INSTRUCTORS; i++) {
    instructors.push({
      name: `Instructor ${i}`,
      email: `instructor${i}@test.com`,
      role: 'instructor',
      password: await bcrypt.hash('password123', 10),
      isVerified: true,
    });
  }

  return User.insertMany(instructors);
}

async function createStudents() {
  const students = [];

  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    students.push({
      name: `Student ${i}`,
      email: `student${i}@test.com`,
      role: 'student',
      password: await bcrypt.hash('password123', 10),
      isVerified: true,
    });
  }

  return User.insertMany(students);
}

async function createCourses(instructors) {
  const courses = [];

  for (const instructor of instructors) {
    for (let i = 1; i <= COURSES_PER_INSTRUCTOR; i++) {
      courses.push({
        title: `Course ${i} by ${instructor.name}`,
        description: 'Seeded course for testing',
        instructor: instructor._id,
        price: 499,
        status: 'published',
      });
    }
  }

  return Course.insertMany(courses);
}

async function createLessons(courses) {
  const lessons = [];

  for (const course of courses) {
    for (let i = 1; i <= LESSONS_PER_COURSE; i++) {
      lessons.push({
        title: `Lesson ${i}`,
        course: course._id,
        lessonType: 'uploaded',
        content: 'Seeded lesson content',
        duration: 300,
      });
    }
  }

  return Lesson.insertMany(lessons);
}

async function createEnrollments(students, courses) {
  const enrollments = [];

  for (const student of students) {
    // each student enrolls in 3 random courses
    const shuffled = courses.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const course of shuffled) {
      enrollments.push({
        student: student._id,
        course: course._id,
      });
    }
  }

  return Enrollment.insertMany(enrollments);
}

async function createPayments(enrollments) {
  const payments = [];

  for (const enrollment of enrollments) {
    payments.push({
      user: enrollment.student,
      course: enrollment.course,
      amount: 499,
      status: Math.random() < 0.9 ? 'success' : 'failed',
      provider: 'stripe-test',
    });
  }

  return Payment.insertMany(payments);
}

async function createFlags(lessons) {
  const flags = [];

  lessons.forEach((lesson, index) => {
    if (index % 10 === 0) {
      flags.push({
        lesson: lesson._id,
        level: index % 30 === 0 ? 'high' : 'medium',
        reason: 'Seeded content flag',
        status: 'pending',
      });
    }
  });

  return Flag.insertMany(flags);
}

async function seedAll() {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ Seeding is disabled in production');
    }

    await connectDB();

    // const admin = await createAdmin();
    const instructors = await createInstructors();
    const students = await createStudents();
    const courses = await createCourses(instructors);
    const lessons = await createLessons(courses);
    const enrollments = await createEnrollments(students, courses);
    await createPayments(enrollments);
    await createFlags(lessons);

    console.log('🎉 SEEDING COMPLETE');
    console.log({
      admin: 1,
      instructors: instructors.length,
      students: students.length,
      courses: courses.length,
      lessons: lessons.length,
      enrollments: enrollments.length,
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedAll();
