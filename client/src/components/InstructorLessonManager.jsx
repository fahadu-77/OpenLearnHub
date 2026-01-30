import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Save,
  Video,
  FileText,
  HelpCircle,
  Eye,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import api from "../utils/api";

const InstructorLessonManager = ({ lesson, courseId, isAdding, onCancel }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(isAdding);
  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    content: lesson?.content || "",
    duration: lesson?.duration || "",
    status: lesson?.status || "draft",
  });
  const [videoFile, setVideoFile] = useState(null);

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const data = new FormData();
      Object.keys(updatedData).forEach((key) =>
        data.append(key, updatedData[key])
      );
      if (videoFile) data.append("video", videoFile);

      const res = await api.patch(`/lessons/${lesson._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["course", courseId]);
      setIsEditing(false);
      setVideoFile(null);
      alert("Lesson updated successfully");
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData) => {
      const data = new FormData();

      data.append("course", courseId);

      Object.entries(newData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      if (!videoFile) {
        throw new Error("Video file missing");
      }

      data.append("video", videoFile);

      const res = await api.post("/lessons", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["course", courseId]);

      if (data.status === "blocked") {
        alert("Lesson uploaded but paused for review");
        return; // stay on page so feedback can show
      }

      alert("Lesson added successfully");
      onCancel();
    },
  });

  const handleSave = () => {
    if (isAdding) {
      if (!videoFile) return alert("Please upload a video");
      addMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const isLoading = updateMutation.isLoading || addMutation.isLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <Info className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isAdding ? "Adding New Lesson" : "Instructor Management Mode"}
          </span>
        </div>
        {!isAdding ? (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              isEditing
                ? "bg-gray-200 text-gray-700"
                : "bg-blue-600 text-white shadow-lg shadow-blue-100"
            }`}
          >
            {isEditing ? (
              "Cancel Edit"
            ) : (
              <>
                <Edit3 className="w-4 h-4" /> Edit Lesson
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-gray-200 text-gray-700 transition-all"
          >
            Cancel
          </button>
        )}
      </div>

      {/* EDIT/CREATE FORM OR VIEW */}
      {isEditing || isAdding ? (
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Lesson Title{" "}
                {lesson?.status === "blocked" && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    Blocked
                  </span>
                )}
              </label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter lesson title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Duration (min)
              </label>
              <input
                type="number"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g. 15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Lesson Content / Description
            </label>
            <textarea
              rows="4"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="What will students learn in this lesson?"
            />
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <Video className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-bold text-blue-700">
                {videoFile
                  ? videoFile.name
                  : isAdding
                  ? "Upload Lesson Video"
                  : "Replace Lesson Video (Optional)"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
            </label>
          </div>

          {lesson?.status === "blocked" && lesson?.instructorFeedback && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="font-semibold text-red-700 mb-1">
                Upload paused for review
              </h4>

              <p className="text-sm text-red-600 mb-2">
                {lesson?.instructorFeedback.message}
              </p>

              <ul className="text-xs text-red-500 list-disc ml-4">
                {lesson.instructorFeedback.categories.map((cat, idx) => (
                  <li key={idx}>{cat}</li>
                ))}
              </ul>

              <p className="text-xs text-gray-500 mt-3">
                An admin will review this content. You’ll be notified if changes
                are needed.
              </p>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />{" "}
                {isAdding ? "Create Lesson" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* METADATA GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="flex items-center gap-2 font-bold mb-4 text-gray-800">
                <FileText className="w-5 h-5 text-indigo-500" />
                AI Generated Notes
              </h4>
              <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                {lesson?.aiNotes ? (
                  <div className="whitespace-pre-wrap">{lesson.aiNotes}</div>
                ) : lesson?.transcriptStatus === "failed" || lesson.status === "blocked" ? (
                  <p className="italic text-red-400">
                    Notes generation failed.
                  </p>
                ) : (
                  <div className="flex flex-col items-center py-8 text-indigo-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="italic text-xs font-medium">
                      Notes are being generated by AI...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="flex items-center gap-2 font-bold mb-4 text-gray-800">
                <Eye className="w-5 h-5 text-green-500" />
                AI Transcript (Internal Only)
              </h4>
              <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl max-h-[300px] overflow-y-auto font-mono leading-relaxed">
                {lesson?.transcript ? (
                  <div className="whitespace-pre-wrap">{lesson.transcript}</div>
                ) : lesson?.transcriptStatus === "pending" ? (
                  <div className="flex flex-col items-center py-8 text-green-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="italic">Transcript is processing...</p>
                  </div>
                ) : lesson?.transcriptStatus === "failed" ? (
                  <span className="text-red-400">Transcription failed.</span>
                ) : (
                  <span className="italic">
                    Transcript will appear once video processing is complete.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* QUESTIONS PREVIEW */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="flex items-center gap-2 font-bold mb-4 text-gray-800">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              Assessment Questions
            </h4>
            <div className="space-y-3">
              {lesson?.questions?.length > 0 ||
              lesson?.aiQuestions?.length > 0 ? (
                [
                  ...(lesson.questions || []),
                  ...(lesson.aiQuestions || []),
                ].map((q, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100"
                  >
                    <span className="font-bold text-gray-400">{i + 1}.</span>
                    {q.question}
                  </div>
                ))
              ) : lesson?.aiQuestionStatus === "pending" && lesson.status !== "blocked" ? (
                <div className="flex items-center gap-2 text-orange-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm italic">AI is crafting questions...</p>
                </div>
              ) : lesson?.aiQuestionStatus === "failed" ? (
                <p className="text-sm text-red-400 italic">
                  AI Question generation failed.
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No questions added yet. Something went wrong!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorLessonManager;
