const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

/**
 * CREATE LESSON
 * Only uploaded videos are lessons
 */
exports.addLesson = async (req, res) => {
  try {
    const {
      title,
      content,
      duration,
      videoUrl,
      courseId,
      lessonType = "uploaded",
      questions = [],
    } = req.body;

    // ✅ Basic validation
    if (!title || !content || !courseId || !videoUrl) {
      return res.status(400).json({
        msg: "Title, content, course and video URL are required",
      });
    }

    // 🔐 Auth & ownership check
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to add lesson" });
    }

    // ✅ Create lesson
    const lesson = new Lesson({
      title,
      content,
      duration,
      videoUrl,
      course: courseId,
      lessonType,
      createdBy: req.user.id,
      questions: Array.isArray(req.body.questions) ? req.body.questions : [],
    });

    await lesson.save();

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json(lesson);
  } catch (err) {
    console.error("Add Lesson Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET LESSONS BY COURSE
 * Returns published lessons for students, all for instructors
*/
exports.getLessonsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // 🧠 ROLE CHECK
    const isInstructor =
      req.user &&
      req.user.role === 'instructor';

    const filter = {
      course: courseId
    };

    // 🔒 STUDENTS SEE ONLY PUBLISHED
    if (!isInstructor) {
      filter.status = 'published';
    }

    const lessons = await Lesson.find(filter).sort({ createdAt: 1 });

    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * DELETE LESSON
*/
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Course.findByIdAndUpdate(lesson.course, {
      $pull: { lessons: lesson._id },
    });

    await lesson.deleteOne();

    res.json({ msg: "Lesson deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * GET ALL LESSONS (ADMIN ONLY)
 */
exports.getAllLessonsAdmin = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate("course", "title")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (err) {
    console.error("Get All Lessons Admin Error:", err.message);
    res.status(500).send("Server Error");
  }
};