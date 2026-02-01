import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Lock,
  AlertCircle,
} from "lucide-react";
import StudentQuestions from "./StudentQuestions";
import api from "../utils/api";

const StudentLearningFlow = ({
  selectedLesson,
  lessonProgress,
  isInstructor,
  handleVideoEnd,
  handleViewNotes,
  handleNextLesson,
  showNotes,
  queryClient,
  courseId,
}) => {
  const isVideoDone = lessonProgress?.videoCompleted || false;
  const isNotesDone = lessonProgress?.notesViewed || false;
  const isAssessmentDone = lessonProgress?.lessonCompleted || false;
// console.log("cousreId", courseId,selectedLesson._id);
  return (
    <div className="space-y-6">
      {/* VIDEO SECTION TRACKING (Ghost layer if needed, but video is outside in main player) */}

      {/* STEP 1: AI NOTES */}
      <div
        className={`p-6 rounded-2xl border transition-all ${isVideoDone || isInstructor ? "bg-white border-blue-100 shadow-sm" : "bg-gray-50 border-gray-200 opacity-50"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
            <BookOpen className="w-5 h-5 text-blue-500" />
            AI Learning Notes{" "}
            {isNotesDone && <CheckCircle className="w-4 h-4 text-green-500" />}
          </h3>
          {isVideoDone || isInstructor ? (
            <button
              onClick={handleViewNotes}
              className="text-blue-600 font-bold hover:underline"
            >
              {showNotes ? "Hide Notes" : "View Notes"}
            </button>
          ) : (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Finish video to unlock
            </span>
          )}
        </div>

        {showNotes && (
          <div className="prose prose-blue max-w-none bg-blue-50/30 p-6 rounded-xl border border-blue-50 animate-in fade-in slide-in-from-top-2 duration-300">
            {selectedLesson.aiNotes ? (
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedLesson.aiNotes}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 animate-pulse">
                AI is preparing your notes... check back in a moment.
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 2: ASSESSMENT */}
      <div className="transition-all">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-800">Knowledge Check</h3>
        </div>

        {isVideoDone || isInstructor ? (
          selectedLesson.questions?.length > 0 ||
          selectedLesson.aiQuestions?.length > 0 ? (
            <StudentQuestions
              lessonId={selectedLesson._id}
              questions={
                selectedLesson.questions?.length > 0
                  ? selectedLesson.questions
                  : selectedLesson.aiQuestions
              }
              onComplete={async () => {
                // Mark questions as answered and lesson as completed
                await api.post("/progress/questions-complete", {
                  courseId,
                  lessonId: selectedLesson._id,
                });
                // Refresh progress data
                queryClient.invalidateQueries(["progress", selectedLesson._id]);
              }}
            />
          ) : selectedLesson.aiQuestionStatus === "failed" ? (
            <div className="bg-red-50 p-8 rounded-xl text-center text-red-600 border border-red-100">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              AI failed to generate questions for this lesson.
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-xl text-center text-gray-500 italic">
              {selectedLesson.lessonType === "uploaded"
                ? "AI is generating questions..."
                : "No questions available for this lesson."}
            </div>
          )
        ) : (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-gray-500 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Finish the video to unlock the quiz.
          </div>
        )}
      </div>

      {/* STEP 3: NEXT LESSON BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNextLesson}
          disabled={!isAssessmentDone && !isInstructor}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-xl
                        ${
                          isAssessmentDone || isInstructor
                            ? "bg-gray-900 text-white hover:bg-black shadow-gray-200"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }
                    `}
        >
          {isAssessmentDone || isInstructor
            ? "Continue to Next Lesson"
            : "Locked: Complete Assessment to Unlock"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StudentLearningFlow;
