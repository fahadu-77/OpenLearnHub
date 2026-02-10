import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  BarChart3,
  MessageCircle,
  TrendingUp,
  ExternalLink,
  XCircle,
  XSquare,
  AlertTriangle,
} from "lucide-react";
import api from "../utils/api";
import { Link } from "react-router-dom";

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Fetch Instructor's Courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructorCourses", user?._id || user?.id],
    queryFn: async () => {
      const res = await api.get(`/courses?instructor=${user?._id || user?.id}`);
      return res.data;
    },
    enabled: !!(user?._id || user?.id),
  });



  const { data, isLoading } = useQuery({
    queryKey: ["instructor-lesson-processing"],
    queryFn: async () => {
      const res = await api.get("/lessons/instructor/lesson-processing");
      return res.data.lessons;
    },
  });

  // Derive Stats
  const totalCourses = courses?.length || 0;
  const totalEnrollments =
    courses?.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0) ||
    0;
  const totalRevenue =
    courses?.reduce(
      (acc, c) => acc + (c.enrolledStudents?.length || 0) * c.price,
      0,
    ) || 0;
  // Derived from lessons status
  const pendingReviews =
    data?.filter(lesson => lesson.status === 'pending_review' || lesson.status === 'blocked').length || 0;
  // Stat Cards Configuration
  const stats = [
    {
      label: "My Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Students",
      value: totalEnrollments,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Earnings",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Content Flags",
      value: pendingReviews,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const getStatusUI = (status) => {
    switch (status) {
      case "blocked":
        return (
          <span className="flex items-center gap-1.5 text-red-300 font-bold text-xs">
            <XSquare size={14} /> Blocked
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1.5 text-green-500 font-bold text-xs">
            <CheckCircle2 size={14} /> Live
          </span>
        );
      case "pending_review":
        return (
          <span className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
            <AlertTriangle size={14} /> Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs">
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-gray-400 font-bold text-xs">
            <Clock size={14} /> Processing
          </span>
        );
    }
  };
  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-600 font-medium">
              Welcome back, {user?.name}. Manage your teaching platform here.
            </p>
          </div>
          <Link
            to="/create-course"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Create New Course
          </Link>
        </div>

        {/* Section 1: Overview Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
                >
                  <stat.icon size={28} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Section 2: My Courses */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" />
              My Courses
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses?.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row h-full"
              >
                <div className="md:w-48 h-48 md:h-auto shrink-0 relative overflow-hidden group">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-400">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      to={`/course/${course._id}`}
                      className="p-3 bg-white rounded-full text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink size={24} />
                    </Link>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-tighter">
                        {course.category}
                      </span>
                      {course.lessons?.some(
                        (l) => l.status === "pending_review",
                      ) && (
                          <span className="animate-pulse text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                            Review Required
                          </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users size={16} />
                        <span>
                          {course.enrolledStudents?.length || 0} Students
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <DollarSign size={16} />
                        <span className="text-slate-900 font-bold">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <Link
                      to={`/course/${course._id}`}
                      className="flex-1 text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all border border-slate-200"
                    >
                      View
                    </Link>
                    {/* <button className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md">
                                            Manage Content
                                        </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Processing Status - Strategic Dark Component */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-indigo-600" />
              Processing Status
            </h2>
          </div>
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Lesson
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Course
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Insights
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Moderation Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-16 text-center text-slate-500"
                    >
                      Loading processing activity…
                    </td>
                  </tr>
                )}

                {!isLoading && data?.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Clock size={48} />
                        <p className="font-bold">
                          No processing activity found.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {data?.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-100">
                        {lesson.title || "Untitled"}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-sm text-slate-400">
                      {lesson.courseTitle}
                    </td>

                    <td className="px-8 py-6">{getStatusUI(lesson.status)}</td>

                    <td className="px-8 py-6">
                      <span className="text-indigo-400 font-bold text-xs uppercase">
                        {lesson.status === "pending_review" && "Look for admin notifications."}
                        {lesson.status === "blocked" && "Look for admin notifications."}
                        {lesson.status === "approved" &&
                          "Lesson content is safe"}
                        {lesson.status === "rejected" &&
                          "Lesson content is not safe"}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-xs text-slate-500 italic">
                        {lesson.status === "rejected" &&
                          lesson.moderationResult?.short_reason}
                        {lesson.status === "pending_review" &&
                          "Awaiting moderator review."}
                        {lesson.status === "approved" && "Admin approved."}
                        {lesson.status === "blocked" &&
                          "Blocked due to policy violation."}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 & 5: Bottom Grid (Feedback & Earnings) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Feedback */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="text-indigo-600" />
                Admin Notifications
              </h2>
            </div>
            <div className="space-y-4">
              {data
                ?.filter(lesson => lesson.status === "pending_review" || lesson.status === "blocked")
                .map((lesson, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4"
                  >
                    <XCircle className="text-red-600 mt-1 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-red-900">
                        Content Rejected: {lesson.title}
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        {lesson.moderationResult?.short_reason}
                      </p>
                    </div>
                  </div>
                ))}
              {pendingReviews > 0 && (
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                  <AlertTriangle
                    className="text-amber-600 mt-1 shrink-0"
                    size={24}
                  />
                  <div>
                    <h4 className="font-bold text-amber-900">
                      Verification Pending
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {pendingReviews} item(s) are currently being reviewed by
                      our moderation team.
                    </p>
                  </div>
                </div>
              )}
              {pendingReviews === 0 &&
                courses
                  ?.flatMap((c) => c.lessons || [])
                  .filter((l) => l.status === "pending_review").length === 0 && (
                  <div className="p-6 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-4">
                    <CheckCircle2
                      className="text-green-600 mt-1 shrink-0"
                      size={24}
                    />
                    <div>
                      <h4 className="font-bold text-green-900">
                        Account Compliant
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your content is perfectly compliant with our platform
                        guidelines. No flags detected.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Earnings Breakdown - Strategic Dark Component */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm space-y-6 text-slate-100">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="text-indigo-400" />
              Revenue Overview
            </h2>
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-2 h-48 px-4">
                {[35, 60, 45, 90, 65, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 space-y-2">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-500 hover:scale-110 cursor-pointer"
                      style={{ height: `${h}%` }}
                    ></div>
                    <p className="text-[10px] font-bold text-slate-500 text-center uppercase">
                      D{i + 1}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8 text-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Avg daily revenue
                  </p>
                  <p className="text-xl font-bold text-slate-100 mt-1">
                    ${(totalRevenue / 30).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Yearly Projection
                  </p>
                  <p className="text-xl font-bold text-indigo-400 mt-1">
                    ${(totalRevenue * 12).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
