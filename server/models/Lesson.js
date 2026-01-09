const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    // ─────────────────────────
    // BASIC INFO
    // ─────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Short instructor-written description (NOT transcript)
    content: {
      type: String,
      required: true,
    },

    lessonType: {
      type: String,
      enum: ["uploaded", "youtube"],
      default: "uploaded",
    },

    // ─────────────────────────
    // VIDEO (PRIMARY LEARNING)
    // ─────────────────────────
    videoUrl: {
      type: String, // Cloudinary secure URL
      required: true,
    },

    // ─────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─────────────────────────
    // DESCRIPTIVE QUESTIONS (MANUAL)
    // ─────────────────────────
    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        expectedKeywords: {
          type: [String], // used by manual evaluator
          default: [],
        },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
        },

        topic: {
          type: String, // instructor-provided topic
        },
      },
    ],

    // ─────────────────────────
    // LIFECYCLE
    // ─────────────────────────
    status: {
      type: String,
      enum: ["draft", "ready", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// 🔍 Performance index
lessonSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
