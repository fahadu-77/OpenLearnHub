import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../slices/authSlice";
import { useLocation } from "react-router-dom";
import {
  Play,
  Lock,
  CheckCircle,
  ChevronRight,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import api from "../utils/api";
import StudentLearningFlow from "../components/StudentLearningFlow";
import InstructorLessonManager from "../components/InstructorLessonManager";

/* -------------------- API HELPERS -------------------- */

const fetchCourse = async (id) => {
  const res = await api.get(`/courses/${id}`);
  return res.data;
};

const fetchProgress = async (id) => {
  const res = await api.get(`/progress/${id}`);
  return res.data;
};

const createCheckoutSession = async (courseId) => {
  const res = await api.post(`/payment/create-checkout-session`, { courseId });
  return res.data;
};

/* -------------------- COMPONENT -------------------- */

const CourseDetailsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [isPreviewingStudent, setIsPreviewingStudent] = useState(false);
  const [isAddingNewLesson, setIsAddingNewLesson] = useState(false);

  /* -------------------- QUERIES -------------------- */

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id),
    refetchInterval: (data) => {
      if (!data?.lessons) return false;
      const hasProcessingLesson = data.lessons.some(
        (lesson) =>
          lesson.transcriptStatus === "pending" ||
          lesson.aiQuestionStatus === "pending",
      );
      return hasProcessingLesson ? 5000 : false;
    },
  });

  const lessons = course?.lessons || [];

  const { data: progress, isLoading: isProgressLoading } = useQuery({
    queryKey: ["progress", id],
    queryFn: () => fetchProgress(id),
    enabled: !!isAuthenticated && !!course,
  });

  /* -------------------- DERIVED STATE -------------------- */
  const isInstructor =
    isAuthenticated &&
    course?.instructor &&
    (user?._id || user?.id) ===
      (typeof course.instructor === "string"
        ? course.instructor
        : course.instructor._id);
  let selectedLesson = course?.lessons?.find((l) => l._id === selectedLessonId);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("success")) {
    const token = localStorage.getItem('token');
    console.log('Token after redirect:', token); // Check if token exists
    
    if (token) {
      api.get("/auth/me").then((res) => {
        dispatch(loginSuccess(res.data));
      }).catch((err) => {
        console.error('Auth error:', err);
      });
    } else {
      console.error('No token found after payment redirect');
    }
  }
}, []);

  useEffect(() => {
    if (!selectedLessonId && course?.lessons?.length > 0) {
      const visibleLessons = isInstructor
        ? course.lessons
        : course.lessons.filter(
            (l) => l.status !== "blocked" || l.status === "rejected",
          );

      if (visibleLessons.length === 0) return;

      const lastWatchedId = progress?.lastWatched;
      const initialLessonId =
        visibleLessons.find((l) => l._id === lastWatchedId)?._id ||
        visibleLessons[0]._id;

      setSelectedLessonId(initialLessonId);
    }
  }, [course, progress, selectedLessonId, isInstructor]);
  /* -------------------- PROGRESS HELPERS -------------------- */

  const lessonProgress = progress?.lessons?.find(
    (l) => l.lessonId === selectedLessonId,
  );
  const isVideoDone = lessonProgress?.videoCompleted || false;

  /* -------------------- MUTATIONS -------------------- */

  const checkoutMutation = useMutation({
    mutationFn: () => {
      // console.log("🔵 BEFORE CHECKOUT - Token:", localStorage.getItem("token"));
      return createCheckoutSession(id);
    },
    onSuccess: (data) => {
      // console.log(
      //   "🟢 CHECKOUT SUCCESS - Token:",
      //   localStorage.getItem("token"),
      // );
      if (data.url) {
        // console.log(
        //   "🟡 REDIRECTING TO STRIPE - Token:",
        //   localStorage.getItem("token"),
        // );
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error(
        "🔴 CHECKOUT ERROR - Token:",
        localStorage.getItem("token"),
        "Error:",
        error,
      );
      alert(
        error.response?.data?.msg ||
          "Failed to initiate checkout. Please try again.",
      );
    },
  });

  const markVideoMutation = useMutation({
    mutationFn: (lessonId) =>
      api.post("/progress/video-complete", { courseId: id, lessonId }),
    onSuccess: () => queryClient.invalidateQueries(["progress", id]),
  });

  const markNotesMutation = useMutation({
    mutationFn: (lessonId) =>
      api.post("/progress/notes-viewed", { courseId: id, lessonId }),
    onSuccess: () => queryClient.invalidateQueries(["progress", id]),
  });

  /* -------------------- HANDLERS -------------------- */

  const handleVideoEnd = () => {
    if (selectedLessonId && !isInstructor && !isVideoDone) {
      markVideoMutation.mutate(selectedLessonId);
    }
  };

  const handleViewNotes = () => {
    setShowNotes((pre) => !pre);
    if (
      !showNotes &&
      selectedLessonId &&
      !isInstructor &&
      !lessonProgress?.notesViewed
    ) {
      markNotesMutation.mutate(selectedLessonId);
    }
  };

  const handleNextLesson = async () => {
    try {
      const res = await api.get(`/lessons/${selectedLessonId}/next`);
      setSelectedLessonId(res.data._id);
      setShowNotes(false);
      // Update general lastWatched
      api.post("/progress", { courseId: id, lessonId: res.data._id });
      queryClient.invalidateQueries(["progress", id]);
    } catch (err) {
      alert("Next lesson is locked or unavailable.");
    }
  };

  /* -------------------- PERMISSIONS -------------------- */

  const hasLessons = lessons && lessons.length > 0;
  const isEnrollmentReady =
    !isAuthenticated || Array.isArray(user?.enrolledCourses);

  if (!isEnrollmentReady) {
    return <div className="p-8">Checking enrollment…</div>;
  }

  const enrolledCourses = user?.enrolledCourses;
  // console.log("User enrolledCourses:", enrolledCourses);
  const isEnrolled =
    Array.isArray(enrolledCourses) &&
    enrolledCourses.some((c) => (c._id || c).toString() === id.toString());
  // console.log("isEnrolled:", isEnrolled);
  /* -------------------- UI RENDER -------------------- */

  if (isLoading || isProgressLoading)
    return <div className="p-8">Loading...</div>;
  if (error)
    return <div className="p-8 text-red-500">Failed to load course</div>;
  // console.log(
  //   "Course ID:",
  //   id,
  //   "Enrolled:",
  //   user?.enrolledCourses?.map((c) =>
  //     typeof c === "object" ? c._id.toString() : c,
  //   ),
  // );
  // console.log("selectedLessonId", selectedLessonId);
  // console.log(
  //   "(isEnrolled || isInstructor) && selectedLesson )",
  //   isEnrolled,
  //   isInstructor,
  //   selectedLesson,
  // );
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PLAYER & CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* PLAYER AREA */}
            {!hasLessons && isInstructor ? (
              // ✅ Instructor, but no lessons yet
              <div className="aspect-video bg-gray-50 flex flex-col items-center justify-center p-12 text-center">
                <h3 className="text-xl font-bold text-gray-800">
                  No lessons yet
                </h3>
                <p className="text-gray-600 mt-2">
                  Add your first lesson to get started.
                </p>
              </div>
            ) : (isEnrolled || isInstructor) && selectedLesson ? (
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  key={selectedLesson._id}
                  controls
                  onEnded={handleVideoEnd}
                  className="w-full h-full"
                  src={selectedLesson.videoUrl}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-50 flex flex-col items-center justify-center text-gray-500 p-12 text-center">
                <Lock className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-gray-800">
                  Enroll to start learning
                </h3>
                <p>Unlock structured lessons, AI notes, and assessments.</p>
                <button
                  onClick={() => checkoutMutation.mutate()}
                  className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-200"
                >
                  {!user ? "Sign up to enroll" : "Get Instant Access"}
                </button>
              </div>
            )}

            {/* LESSON INFO (SUMMARY) */}
            {selectedLesson && (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedLesson.title}
                  </h2>
                  <div className="flex gap-2">
                    {isVideoDone && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3 h-3" /> Video Watched
                      </span>
                    )}
                    {isInstructor && (
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                          Instructor View
                        </span>
                        <button
                          onClick={() =>
                            setIsPreviewingStudent(!isPreviewingStudent)
                          }
                          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold transition-all ${
                            isPreviewingStudent
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Play className="w-3 h-3" />{" "}
                          {isPreviewingStudent
                            ? "Exit Preview"
                            : "Preview Student Flow"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {!isInstructor && (
                  <p className="text-gray-600">{selectedLesson.content}</p>
                )}
              </div>
            )}
          </div>

          {/* ROLE-BASED FLOW SWITCH */}
          {(isEnrolled || isInstructor) &&
            (selectedLesson || isAddingNewLesson) &&
            (isAddingNewLesson ? (
              <InstructorLessonManager
                isAdding={true}
                courseId={id}
                onCancel={() => setIsAddingNewLesson(false)}
              />
            ) : isInstructor && !isPreviewingStudent ? (
              <InstructorLessonManager lesson={selectedLesson} courseId={id} />
            ) : (
              <StudentLearningFlow
                selectedLesson={selectedLesson}
                lessonProgress={lessonProgress}
                isInstructor={isInstructor || isPreviewingStudent}
                handleVideoEnd={handleVideoEnd}
                handleViewNotes={handleViewNotes}
                handleNextLesson={handleNextLesson}
                showNotes={showNotes}
                queryClient={queryClient}
                courseId={id}
              />
            ))}
        </div>

        {/* RIGHT COLUMN: CURRICULUM */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
              <span>Course Curriculum</span>
              {isInstructor && (
                <button
                  onClick={() => {
                    setIsAddingNewLesson(true);
                    setSelectedLessonId(null);
                  }}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  + Add Lesson
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {course.lessons
                .filter((lesson) =>
                  isInstructor
                    ? true
                    : lesson.status !== "blocked" ||
                      lesson.status !== "rejected",
                )
                .map((lesson, index) => {
                  const isBlocked = lesson.status === "blocked" || lesson.status === "rejected";
                  const isSelected = selectedLesson?._id === lesson._id;
                  const isCompleted = progress?.lessons?.find(
                    (l) => l.lessonId === lesson._id,
                  )?.lessonCompleted;

                  // Check if previous is done for locking UI
                  const prevLessonId =
                    index > 0 ? course.lessons[index - 1]._id : null;
                  const prevDone =
                    index === 0 ||
                    progress?.lessons?.find((l) => l.lessonId === prevLessonId)
                      ?.lessonCompleted;
                  const isLocked =
                    (!isInstructor && !isEnrolled) ||
                    (!isInstructor && !prevDone);

                  return (
                    <button
                      key={lesson._id}
                      disabled={isLocked && !isInstructor}
                      onClick={() => {
                        setSelectedLessonId(lesson._id);
                        setIsAddingNewLesson(false);
                        setIsPreviewingStudent(false);
                      }}
                      className={`w-full p-4 flex gap-4 text-left transition-colors relative
                        ${
                          isSelected
                            ? "bg-blue-50/50 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-blue-600"
                            : "hover:bg-gray-50"
                        }
                      ${
                        isBlocked && isInstructor
                          ? "bg-red-200 border-l-4 border-red-500"
                          : ""
                      }
                        ${
                          isLocked && !isInstructor
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }
                    `}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : isLocked && !isInstructor ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold ${
                            isSelected ? "text-blue-700" : "text-gray-800"
                          }`}
                        >
                          {lesson.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lesson.duration} min
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2">Learning Tip</h4>
            <p className="text-sm text-indigo-700 leading-relaxed">
              {isInstructor
                ? "Keep your lessons concise and focused. Use AI generated transcripts to verify accuracy."
                : "Engagement is key! Complete the AI assessments to earn learning points and unlock bonus materials."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
