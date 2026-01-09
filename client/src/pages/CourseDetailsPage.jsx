import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Lock, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../utils/api";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

/* -------------------- API HELPERS -------------------- */

const fetchCourse = async (id) => {
  const res = await api.get(`/courses/${id}`);
  return res.data;
};

const createCheckoutSession = async (courseId) => {
  const res = await api.post(`/payment/create-checkout-session`, { courseId });
  return res.data;
};

/* -------------------- COMPONENT -------------------- */

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [questions, setQuestions] = useState([]);

  const [lessonForm, setLessonForm] = useState({
    title: "",
    videoFile: null,
    duration: "",
    content: "",
  });

  /* -------------------- QUERY -------------------- */

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id),
  });

  /* -------------------- AUTO SELECT FIRST LESSON -------------------- */

  useEffect(() => {
    if (
      !selectedLesson &&
      course?.lessons &&
      course.lessons.length > 0
    ) {
      setSelectedLesson(course.lessons[0]);
    }
  }, [course, selectedLesson]);

  /* -------------------- MUTATIONS -------------------- */

  const checkoutMutation = useMutation({
    mutationFn: () => createCheckoutSession(id),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const addLessonMutation = useMutation({
    mutationFn: (payload) => api.post("/lessons", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", id]);
      setIsAddingLesson(false);
      setLessonForm({
        title: "",
        videoFile: null,
        duration: "",
        content: "",
      });
      alert("Lesson added successfully");
    },
    onError: (err) => {
      alert(err.response?.data?.msg || "Error adding lesson");
    },
  });

  /* -------------------- HANDLERS -------------------- */

  const handleAddLesson = async (e) => {
    e.preventDefault();

    try {
      if (!lessonForm.videoFile) {
        throw new Error('Please select a video file');
      }

      const finalVideoUrl = await uploadToCloudinary(lessonForm.videoFile);

      const formattedQuestions = questions.map((q) => ({
        question: q.prompt,
        expectedKeywords: q.expectedKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      }));

      const payload = {
        title: lessonForm.title,
        content: lessonForm.content,
        duration: lessonForm.duration,
        videoUrl: finalVideoUrl,
        courseId: id,
        lessonType: lessonForm.videoFile ? 'uploaded' : 'youtube',
        questions: formattedQuestions,
      };

      addLessonMutation.mutate(payload);

    } catch (err) {
      console.error('Lesson creation failed:', err.message);
      alert(err.message);
    }
  };

  /* -------------------- PERMISSIONS -------------------- */

  const isEnrolled = user?.enrolledCourses?.some((c) =>
    typeof c === "object" ? c._id === id : c === id
  );

  const isInstructor =
    isAuthenticated &&
    course?.instructor &&
    (user?._id || user?.id) === course.instructor._id;

  /* -------------------- STATES -------------------- */

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error)
    return <div className="p-8 text-red-500">Failed to load course</div>;

  /* -------------------- UI -------------------- */

  return (
    <div className="container mx-auto px-4 py-8">
      {/* COURSE HEADER */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-xl font-bold text-blue-600">
            ${course.price}
          </span>
          <span className="text-sm text-gray-600">
            Instructor: {course.instructor?.name}
          </span>
        </div>

        {!isEnrolled && !isInstructor ? (
          <button
            onClick={() => checkoutMutation.mutate()}
            className="bg-gray-900 text-white px-6 py-2 rounded font-bold hover:bg-gray-800"
          >
            Enroll Now
          </button>
        ) : (
          <span className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded border">
            ✓ Enrolled
          </span>
        )}
      </div>

      {/* VIDEO PLAYER (UPLOADED ONLY) */}
      {(isEnrolled || isInstructor) && selectedLesson ? (
        <div className="mb-8">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              controls
              className="w-full h-full"
              src={selectedLesson.videoUrl}
            />
          </div>
        </div>
      ) : (
        <div className="mb-8 p-10 bg-gray-100 rounded-lg text-center text-gray-500">
          <AlertCircle className="mx-auto mb-2" />
          Enroll to access lesson videos
        </div>
      )}

      {/* INSTRUCTOR ADD LESSON */}
      {isInstructor && (
        <div className="mb-8 bg-indigo-50 p-6 rounded-lg border">
          <button
            onClick={() => setIsAddingLesson(!isAddingLesson)}
            className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
          >
            {isAddingLesson ? "Cancel" : "+ Add Lesson"}
          </button>

          {isAddingLesson && (
            <form onSubmit={handleAddLesson} className="space-y-4">
              <input
                type="text"
                placeholder="Lesson title"
                className="w-full p-2 border rounded"
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, title: e.target.value })
                }
                required
              />

              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    videoFile: e.target.files[0],
                  })
                }
                required
              />



              <textarea
                placeholder="Lesson description"
                className="w-full p-2 border rounded"
                value={lessonForm.content}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, content: e.target.value })
                }
                required
              />

              <div className="bg-white p-4 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">
                    Lesson Questions (Optional)
                  </h3>
                  <button
                    type="button"
                    className="text-sm text-blue-600"
                    onClick={() =>
                      setQuestions([
                        ...questions,
                        { prompt: "", expectedKeywords: "" },
                      ])
                    }
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, index) => (
                  <div
                    key={index}
                    className="mb-3 p-3 bg-gray-50 rounded border"
                  >
                    <input
                      type="text"
                      placeholder="Question prompt"
                      className="w-full p-2 border rounded mb-2"
                      value={q.prompt}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[index].prompt = e.target.value;
                        setQuestions(copy);
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Expected keywords (comma separated)"
                      className="w-full p-2 border rounded text-sm"
                      value={q.expectedKeywords}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[index].expectedKeywords = e.target.value;
                        setQuestions(copy);
                      }}
                    />

                    <button
                      type="button"
                      className="mt-2 text-xs text-red-500"
                      onClick={() => {
                        const copy = [...questions];
                        copy.splice(index, 1);
                        setQuestions(copy);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={addLessonMutation.isPending}
                className="w-full bg-green-600 text-white py-2 rounded font-bold"
              >
                {addLessonMutation.isPending ? "Adding..." : "Save Lesson"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* LESSON LIST */}
      <h2 className="text-2xl font-bold mb-4">Channel Content</h2>

      <div className="bg-white rounded-lg shadow divide-y">
        {course.lessons?.length > 0 ? (
          course.lessons.map((lesson, index) => {
            const canAccess = isEnrolled || isInstructor;
            const isSelected = selectedLesson?._id === lesson._id;

            return (
              <button
                key={lesson._id}
                onClick={() => setSelectedLesson(lesson)}
                disabled={!canAccess}
                className={`w-full text-left p-4 flex justify-between items-center
                  ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}
                  ${!canAccess
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-50"
                  }
                `}
              >
                <div>
                  <h4 className="font-medium">{lesson.title}</h4>
                  <p className="text-sm text-gray-500">{lesson.duration} min</p>
                </div>

                {canAccess ? (
                  <Play className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </button>
            );
          })
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            No lessons uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;
