const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const User = require("../models/User");
const aiService = require("../services/ai.service");

/**
 * CREATE LESSON
 */
exports.addLesson = async (req, res) => {
  try {
    const {
      title,
      content,
      duration,
      lessonType = "uploaded",
      questions = [],
      course: courseId,
    } = req.body;

    if (!title || !content || !courseId || !req.file) {
      return res
        .status(400)
        .json({ msg: "Title, content, course and video file are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: "Course not found" });

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to add lesson" });
    }

    const videoUrl = req.file.path;

    // ⭐ NEW: Create lesson but don't save yet
    const lesson = new Lesson({
      title,
      content,
      duration,
      videoUrl,
      course: courseId,
      lessonType,
      createdBy: req.user.id,
      questions: questions,
      status: "processing", // ⭐ NEW: Mark as processing
    });

    await lesson.save(); // Save temporarily

    // ⭐ NEW: Run AI processing and wait for moderation
    if (lesson.lessonType === "uploaded") {
      try {
        // Wait for AI processing to complete
        const aiResult = await aiService.processLessonAISync(lesson._id);

        // Check moderation result
        if (aiResult.status === "blocked") {
          // Add to course so instructor sees the feedback in their dashboard
          course.lessons.push(lesson._id);
          await course.save();

          return res.status(201).json({
            status: "blocked",
            instructorFeedback: aiResult.feedback,
            msg: "Content violates platform policies",
          });
        }

        // Update lesson status based on risk
        if (
          aiResult.moderation &&
          aiResult.moderation.risk_level === "MEDIUM"
        ) {
          lesson.status = "flagged"; // ⭐ Mark for review
        } else {
          lesson.status = "published"; // ⭐ Safe to publish
        }

        await lesson.save();

        // Now add to course
        course.lessons.push(lesson._id);
        await course.save();

        res.status(201).json({
          ...lesson.toObject(),
          warning:
            lesson.status === "flagged" ? "Content flagged for review" : null,
        });
      } catch (aiError) {
        console.error("❌ AI processing failed:", aiError.message);

        // On error, mark for manual review
        lesson.status = "pending_review";
        await lesson.save();

        course.lessons.push(lesson._id);
        await course.save();

        res.status(201).json({
          ...lesson.toObject(),
          warning: "AI moderation failed - content pending manual review",
        });
      }
    } else {
      // For non-uploaded lessons, publish directly
      lesson.status = "published";
      await lesson.save();

      course.lessons.push(lesson._id);
      await course.save();

      res.status(201).json(lesson);
    }
  } catch (err) {
    console.error("Add Lesson Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * UPDATE LESSON
 * Only instructor who created it can update
 */
exports.updateLesson = async (req, res) => {
  try {
    const { title, content, questions, duration, status } = req.body;
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    const course = await Course.findById(lesson.course);
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this lesson" });
    }

    // Update fields
    if (title) lesson.title = title;
    if (content) lesson.content = content;
    if (duration) lesson.duration = duration;
    if (status) lesson.status = status;
    if (questions) {
      lesson.questions = Array.isArray(questions)
        ? questions
        : JSON.parse(questions);
    }

    // Handle video update if file exists
    if (req.file) {
      lesson.videoUrl = req.file.path; // Multer-Cloudinary gives path as the URL
      // Re-trigger AI process if video changed
      aiService.processLessonAISync(lesson._id);
    }

    await lesson.save();
    res.json(lesson);
  } catch (err) {
    console.error("Update Lesson Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * EVALUATE STUDENT ANSWER (AI Assisted)
 * Tracks progression flags: aiFeedbackGenerated, questionsAnswered, lessonCompleted
 */
exports.evaluateAnswer = async (req, res) => {
  try {
    const { lessonId, answer } = req.body;
    const userId = req.user.id;

    if (!lessonId || !answer) {
      return res.status(400).json({ msg: "Lesson ID and answer are required" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    const evaluation = await aiService.evaluateStudentAnswer(answer, lessonId);

    // Update Progress Flags
    const user = await User.findById(userId);
    const progressEntry = user.learningProgress.find(
      (p) => p.course.toString() === lesson.course.toString(),
    );

    if (progressEntry) {
      let lessonProg = progressEntry.lessons.find(
        (l) => l.lessonId.toString() === lessonId,
      );
      if (!lessonProg) {
        lessonProg = {
          lessonId,
          questionsAnswered: true,
          aiFeedbackGenerated: true,
        };
        progressEntry.lessons.push(lessonProg);
      } else {
        lessonProg.questionsAnswered = true;
        lessonProg.aiFeedbackGenerated = true;
      }

      // Check if all steps done to mark lessonCompleted
      const allStepsVideoNotes =
        lessonProg.videoCompleted && lessonProg.notesViewed;
      const hasQuestions =
        lesson.questions?.length > 0 || lesson.aiQuestions?.length > 0;

      if (
        allStepsVideoNotes &&
        (!hasQuestions || lessonProg.questionsAnswered)
      ) {
        lessonProg.lessonCompleted = true;
      }

      await user.save();
    }

    res.json({ feedback: evaluation });
  } catch (err) {
    console.error("Evaluation Error:", err.message);
    res
      .status(500)
      .json({ msg: "Failed to evaluate answer. Please try again later." });
  }
};

/**
 * GET SINGLE LESSON (with GATING)
 */
exports.getLessonById = async (req, res) => {
  try {
    const lessonId = req.params.id;

    const lesson = await Lesson.findById(lessonId).populate("course");

    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    const userId = req.user.id;
    const user = await User.findById(userId);

    const isInstructor =
      lesson.course.instructor.toString() === userId ||
      req.user.role === "admin";
    const isEnrolled = user.enrolledCourses.includes(lesson.course._id);

    if (!isInstructor && !isEnrolled) {
      return res
        .status(403)
        .json({ msg: "Not authorized. Enrollment required." });
    }

    // GATING LOGIC
    if (!isInstructor) {
      const course = lesson.course;
      const lessonIndex = course.lessons.indexOf(lesson._id);

      if (lessonIndex > 0) {
        const prevLessonId = course.lessons[lessonIndex - 1];
        const progressEntry = user.learningProgress.find(
          (p) => p.course.toString() === course._id.toString(),
        );
        const prevLessonProgress = progressEntry?.lessons.find(
          (l) => l.lessonId.toString() === prevLessonId.toString(),
        );

        if (!prevLessonProgress || !prevLessonProgress.lessonCompleted) {
          return res.status(403).json({
            msg: "Complete the previous lesson to unlock this one.",
            locked: true,
            prevLessonId,
          });
        }
      }
    }
    const responseData = lesson.toObject();
    if (!isInstructor && req.user.role !== "admin") {
      delete responseData.transcript;
    }

    res.json(responseData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * GET NEXT LESSON
 */
exports.getNextLesson = async (req, res) => {
  try {
    const currentLessonId = req.params.id;
    const lesson = await Lesson.findById(currentLessonId).populate("course");
    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    const userId = req.user.id;
    const user = await User.findById(userId);

    // Check if current lesson is completed
    const progressEntry = user.learningProgress.find(
      (p) => p.course.toString() === lesson.course._id.toString(),
    );
    const currentProg = progressEntry?.lessons.find(
      (l) => l.lessonId.toString() === currentLessonId,
    );

    if (
      req.user.role !== "admin" &&
      lesson.course.instructor.toString() !== userId
    ) {
      if (!currentProg || !currentProg.lessonCompleted) {
        return res
          .status(403)
          .json({ msg: "Complete this lesson to unlock the next one." });
      }
    }

    const lessonIndex = lesson.course.lessons.indexOf(lesson._id);
    const nextLessonId = lesson.course.lessons[lessonIndex + 1];
    if (!nextLessonId) {
      return res.status(404).json({ msg: "No more lessons in this course." });
    }
    const nextLesson = await Lesson.findById(nextLessonId);
    if (!nextLesson) {
      return res.status(404).json({ msg: "Next lesson not found." });
    }
    if (nextLesson.status === "blocked") {
      return res.status(403).json({ msg: "Next lesson is blocked." });
    }

    res.json(nextLesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * GET LESSONS BY COURSE
 */
exports.getLessonsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const role = req.user?.role;

    const filter = { course: courseId };

    if (role === "student") {
      filter.status = "published"; // ONLY published lessons
    }

    const query = Lesson.find(filter).sort({ createdAt: 1 });

    if (role === "student") {
      query.select("-transcript");
    }

    const lessons = await query;
    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
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

/**
 * ADMIN REVIEW (Approve/Reject)
 */
exports.reviewLesson = async (req, res) => {
  try {
    const { action } = req.body;
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    if (action === "approve") {
      lesson.status = "approved";
      lesson.moderationResult.risk_level = "RESOLVED";
    } else if (action === "reject") {
      lesson.status = "rejected";
    } else {
      return res
        .status(400)
        .json({ msg: "Invalid action. Use approve or reject." });
    }

    await lesson.save();
    res.json({ msg: `Lesson ${action}d successfully`, lesson });
  } catch (err) {
    console.error("Review Lesson Error:", err.message);
    res.status(500).send("Server Error");
  }
};

exports.getInstructorLessonProcessing = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({
      createdBy: req.user.id,
      status: { $in: ["pending_review", "rejected", "approved", "blocked"] },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("course", "title")
      .select("title status moderationResult updatedAt course");

    res.json({
      lessons: lessons.map((l) => ({
        id: l._id,
        title: l.title,
        courseTitle: l.course?.title || "Unknown",
        status: l.status,
        moderationResult: l.moderationResult,
        updatedAt: l.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};
