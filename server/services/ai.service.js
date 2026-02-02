const Groq = require("groq-sdk");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const Lesson = require("../models/Lesson");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * SERVICE: AI PROCESSING
 * Handles Transcription, Notes Generation, and Answer Evaluation
 */

/**
 * 1. Background Processor
 * Orchestrates STT -> Notes
 */
// exports.processLessonAI = async (lessonId) => {
//     let retryCount = 0;
//     const maxRetries = 2;

//     while (retryCount < maxRetries) {
//         try {
//             console.log(`[AI-SERVICE] Processing lesson ${lessonId} (Attempt ${retryCount + 1})...`);

//             const lesson = await Lesson.findById(lessonId);
//             if (!lesson || !lesson.videoUrl) return;

//             // Update status to pending (though it's default)
//             lesson.transcriptStatus = "pending";
//             await lesson.save();

//             // Step A: Extract/Download Audio
//             const audioPath = await downloadAudioFromVideo(lesson.videoUrl);

//             // Step B: Transcript Generation (Groq Whisper)
//             const transcript = await generateTranscript(audioPath);
//             if (audioPath && fs.existsSync(audioPath)) {
//                 fs.unlinkSync(audioPath); // Clean up
//             }

//             lesson.transcript = transcript;
//             lesson.transcriptStatus = "completed";

//             // Step B.5: Content Moderation Check
//             console.log(`[AI-SERVICE] Running moderation for ${lessonId}...`);
//             const moderation = await moderateTranscript(transcript);
//             lesson.moderationResult = moderation;

//             if (moderation.risk_level === "HIGH") {
//                 lesson.status = "pending_review";
//             }

//             await lesson.save();

//             // Step C: Notes Generation (Groq LLM)
//             console.log(`[AI-SERVICE] Generating notes for ${lessonId}...`);
//             const aiNotes = await generateAINotes(transcript);
//             lesson.aiNotes = aiNotes;
//             await lesson.save();

//             // Step D: AI Question Generation (if none manually provided)
//             if (!lesson.questions || lesson.questions.length === 0) {
//                 console.log(`[AI-SERVICE] Generating fallback questions for ${lessonId}...`);
//                 lesson.aiQuestionStatus = "pending";
//                 await lesson.save();

//                 const generatedQuestions = await generateAIQuestions(transcript);
//                 console.log(`[AI-SERVICE] Generated ${generatedQuestions?.length || 0} questions for ${lessonId}`);

//                 lesson.aiQuestions = generatedQuestions;
//                 lesson.aiQuestionStatus = "completed";
//                 await lesson.save();
//             }

//             console.log(`[AI-SERVICE] Finished processing lesson ${lessonId}`);
//             return; // Success

//         } catch (error) {
//             console.error(`[AI-SERVICE] CRITICAL ERROR for lesson ${lessonId}:`, error.message);
//             retryCount++;
//             if (retryCount >= maxRetries) {
//                 await Lesson.findByIdAndUpdate(lessonId, {
//                     transcriptStatus: "failed",
//                     aiQuestionStatus: "failed"
//                 });
//             }
//         }
//     }
// };

// ⭐ NEW: Synchronous version that returns moderation result immediately
exports.processLessonAISync = async (lessonId) => {
  try {
    console.log(
      `[AI-SERVICE] Processing lesson ${lessonId} with moderation check...`
    );

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.videoUrl) {
      throw new Error("Lesson or video URL not found");
    }

    // Update status to pending
    lesson.transcriptStatus = "pending";
    await lesson.save();

    // Step A: Extract/Download Audio
    console.log(`[AI-SERVICE] Extracting audio from video...`);
    const audioPath = await downloadAudioFromVideo(lesson.videoUrl);

    // Step B: Transcript Generation (Groq Whisper)
    console.log(`[AI-SERVICE] Generating transcript...`);
    const transcript = await generateTranscript(audioPath);
    // const transcript = "harassmment content here";
    // ⚠️ Use your real function here

    // Clean up audio file
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    lesson.transcript = transcript;
    lesson.transcriptStatus = "completed";

    // ⭐ Step B.5: Content Moderation Check (CRITICAL!)
    console.log(`[AI-SERVICE] Running moderation check...`);
    const moderation = await moderateTranscript(transcript);
    lesson.moderationResult = moderation;

    console.log(`[AI-SERVICE] Moderation result:`, moderation);

    if (moderation.risk_level === "HIGH") {
      console.log(
        `🚫 HIGH RISK detected for lesson ${lessonId} - stopping processing`
      );
      lesson.status = "blocked";

        lesson.instructorFeedback = {
          message: moderation.short_reason,
          categories: moderation.detected_categories,
          createdAt: new Date()
      };
    }

    

    // If MEDIUM or LOW risk, continue processing
    await lesson.save();

    // Step C: Notes Generation (async, don't wait)
    
      console.log(`[AI-SERVICE] Generating notes...`);
    generateAINotes(transcript)
      .then((aiNotes) => {
        lesson.aiNotes = aiNotes;
        return lesson.save();
      })
      .catch((err) => console.error("Notes generation failed:", err));

  
    // Step D: AI Question Generation (async, don't wait)
   
      console.log(`[AI-SERVICE] Generating questions...`);
      lesson.aiQuestionStatus = "pending";
      await lesson.save();

      generateAIQuestions(transcript)
        .then((generatedQuestions) => {
          lesson.aiQuestions = generatedQuestions;
          lesson.aiQuestionStatus = "completed";
          return lesson.save();
        })
        .catch((err) => {
          console.error("Question generation failed:", err);
          lesson.aiQuestionStatus = "failed";
          return lesson.save();
        });
    

    console.log(
      `✅ Lesson ${lessonId} passed moderation - processing continues in background`
    );
    if (moderation.risk_level === "HIGH" || lesson.status === "blocked") {
      return {
        success: true,
        status: "blocked",
        feedback: lesson.instructorFeedback,
        moderation: {
          risk_level: moderation.risk_level,
          detected_categories: moderation.detected_categories,
          short_reason: moderation.short_reason
        }
      };
    }
    return {
      success: true,
      moderation,
      transcript,
    };
  } catch (error) {
    console.error(
      `[AI-SERVICE] Error processing lesson ${lessonId}:`,
      error.message
    );

    // Update lesson status
    await Lesson.findByIdAndUpdate(lessonId, {
      transcriptStatus: "failed",
      status: "pending_review",
    });

    throw error; // Re-throw to be caught by controller
  }
};

/**
 * 2. Audio Extraction Helper
 * Uses Cloudinary URL transformation to get MP3 (efficient for Whisper)
 */
async function downloadAudioFromVideo(videoUrl) {
  try {
    console.log(`[AI-SERVICE] Attempting audio extraction from: ${videoUrl}`);
    // Attempt Cloudinary audio transformation (mp4/avi -> mp3)
    let audioUrl = videoUrl;
    if (videoUrl.includes("/upload/")) {
      // Replace file extension with .mp3
      audioUrl = videoUrl.replace(/\.[^/.]+$/, "") + ".mp3";
    }

    const tempPath = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`);
    const writer = fs.createWriteStream(tempPath);

    const response = await axios({
      url: audioUrl,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`[AI-SERVICE] Audio downloaded to ${tempPath}`);
        resolve(tempPath);
      });
      writer.on("error", (err) => {
        console.error(`[AI-SERVICE] Download error: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    console.warn(
      "[AI-SERVICE] Audio transformation failed, downloading original video..."
    );
    // Fallback: download original if transformation unavailable
    const tempPath = path.join(os.tmpdir(), `video_${Date.now()}.bin`);
    const writer = fs.createWriteStream(tempPath);
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(tempPath));
      writer.on("error", reject);
    });
  }
}

/**
 * 3. Groq STT
 */
async function generateTranscript(filePath) {
  console.log(`[AI-SERVICE] Sending to Groq Whisper...`);
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
    response_format: "verbose_json",
  });
  console.log(
    `[AI-SERVICE] Transcription received (${
      transcription.text?.length || 0
    } chars)`
  );
  return transcription.text;
}

/**
 * 3.5 Content Moderation
 */
async function moderateTranscript(transcript) {
  const prompt = `
You are a content moderator for an educational platform. Analyze this transcript for harmful content.

FLAG AS HIGH RISK if you find:
- Profanity or vulgar language
- Hate speech or discrimination
- Sexual or explicit content
- Violence or threats
- Harassment or bullying
- Scams or fraud

FLAG AS MEDIUM RISK if you find:
- Mild inappropriate language
- Controversial topics without context
- Borderline offensive content

FLAG AS LOW RISK if:
- Content is educational and appropriate
- No violations detected

Return ONLY this JSON format (no extra text):
{
  "risk_level": "LOW",
  "detected_categories": [],
  "short_reason": "explanation here"
}

TRANSCRIPT:
${transcript}
`;

  console.log("🔍 Analyzing transcript...");
  console.log("Transcript preview:", transcript.substring(0, 200));

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower = more consistent/strict
    });

    const result = JSON.parse(completion.choices[0].message.content);

    console.log("✅ Moderation result:", result);

    return result;
  } catch (e) {
    console.error("[AI-SERVICE] Moderation failed:", e.message);

    // On error, require manual check (don't auto-approve)
    return {
      risk_level: "MEDIUM",
      detected_categories: ["moderation_error"],
      short_reason: "Moderation check failed - requires review.",
    };
  }
}

/**
 * 4. Groq LLM (Notes)
 */
async function generateAINotes(transcript) {
  const prompt = `
    You are an expert academic assistant. Based on the following lesson transcript, generate structured learning notes.
    Guidelines:
    - Use clear headings (#)
    - Use bullet points for key concepts
    - Be concise but comprehensive
    - Use the same language as the transcript
    - Focus on educational value
    
    Transcript:
    ${transcript}
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });

  return completion.choices[0].message.content;
}

/**
 * 5. Groq LLM (Questions)
 */
async function generateAIQuestions(transcript) {
  const prompt = `
    You are an expert educator. Based on the following lesson transcript, generate 2-3 descriptive questions for students.
    Guidelines:
    - Questions must be open-ended and descriptive (no MCQs).
    - Focus on core concepts discussed in the transcript.
    - Return a JSON object with a "questions" key containing an array of question objects.
    - Structure: {"questions": [{"question": "...", "difficulty": "medium", "topic": "..."}]}
    - Language must match transcript.
    - Do NOT return anything else but the raw JSON object.

    Transcript:
    ${transcript}
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(completion.choices[0].message.content);
    return parsed.questions || [];
  } catch (e) {
    console.error(
      "[AI-SERVICE] Failed to parse generated questions:",
      e.message
    );
    return [];
  }
}

/**
 * 6. Answer Evaluation
 * Semantic/Keyword check (Lenient)
 */
exports.evaluateStudentAnswer = async (answer, lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.transcript) {
      throw new Error("Lesson transcript not available for evaluation.");
    }

    const evaluationPrompt = `
      You are an encouraging educational evaluator.
      
      Inputs:
      - Student's Answer: "${answer}"
      - Lesson Transcript: "${lesson.transcript}"
      - AI Notes: "${lesson.aiNotes}"
      
      Task:
      Check the student's answer for keyword presence and semantic similarity to the lesson content.
      Be LENIENT. If they grasp the core concept, acknowledge it.
      
      REQUIRED FORMAT (Markdown):
      ### Feedback
      - **What you did well**: [One or two sentences]
      - **Areas to improve/Missing concepts**: [Highlight 1-2 key points if any]
      
      ***
      **Disclaimer**: This feedback is learning assistance provided by AI, not official grading.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: evaluationPrompt }],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("[AI-SERVICE] Evaluation failed:", error.message);
    return "### Feedback\nAI evaluation is currently unavailable. Please review the lesson notes to verify your answer.\n\n***\n**Disclaimer**: Feedback is learning assistance, not official grading.";
  }
};
