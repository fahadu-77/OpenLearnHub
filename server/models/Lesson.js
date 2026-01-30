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
    // AI ENHANCEMENTS (GROQ)
    // ─────────────────────────
    transcript: {
      type: String,
      default: "",
    },
    transcriptStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    aiNotes: {
      type: String, // MarkDown/JSON structured notes
      default: "",
    },

    aiQuestions: [
      {
        question: String,
        expectedKeywords: [String],
      },
    ],
    aiQuestionStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    // ─────────────────────────
    // LIFECYCLE
    // ─────────────────────────
    status: {
      type: String,
      enum: ["draft", "ready", "published", "pending_review", "rejected", "processing", "flagged", "blocked","approved"],
      default: "draft",
    },

    instructorFeedback: {
    message: String,
    categories: [String],
    createdAt: Date
},


    // ─────────────────────────
    // CONTENT MODERATION
    // ─────────────────────────
    moderationResult: {
      risk_level: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH","RESOLVED"],
        default: "LOW",
      },
      detected_categories: [String],
      short_reason: String,
    },
  },
  { timestamps: true }
);

// 🔍 Performance index
lessonSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
