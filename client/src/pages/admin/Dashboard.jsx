import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Activity,
} from "lucide-react";
import api from "../../utils/api";
import AdminStatCard from "../../components/admin/AdminStatCard";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });
  console.log("stats", stats);

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: async () => {
      const res = await api.get("/admin/logs?limit=5");
      return res.data;
    },
  });
  console.log("logs", logs);

  const { data, isLoading } = useQuery({
    queryKey: ["adminModerationActivity"],
    queryFn: async () => {
      const res = await api.get("/admin/moderation-activity");
      return res.data;
    },
  });
  const activities = data?.activities || [];

  if (statsLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Students",
      value: stats?.users || 0,
      icon: Users,
      color: "blue",
    }, //, trend: { value: 12, isUp: true }
    {
      label: "Total Courses",
      value: stats?.courses || 0,
      icon: BookOpen,
      color: "green",
    },
    {
      label: "Total Instructors",
      value: stats?.instructors || 0,
      icon: GraduationCap,
      color: "purple",
    },
    {
      label: "Total Revenue",
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "orange",
    }, //, trend: { value: 8, isUp: true }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, idx) => (
          <AdminStatCard key={idx} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Moderation Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Moderation Activity
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.map((lesson) => (
              <div
                key={lesson._id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {lesson.status === "blocked"}
                      {lesson.status === "pending_review"}
                      {lesson.status === "rejected"}
                      {lesson.status === "approved"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {lesson.title} · {lesson.course?.title}
                    </p>

                    {lesson.moderationResult && (
                      <p className="text-xs text-red-500 italic">
                        {lesson.moderationResult?.risk_level} · {lesson.status }
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {new Date(lesson.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(lesson.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                No moderation activity yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights or Placeholder */}
        {/* <div className="bg-slate-900 rounded-2xl p-8 text-slate-100 shadow-xl space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Platform Status
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">API Gateway</span>
                            <span className="flex items-center gap-2 font-bold text-green-400">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Healthy
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Database Cluster</span>
                            <span className="flex items-center gap-2 font-bold text-green-400">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Healthy
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Media Server</span>
                            <span className="flex items-center gap-2 font-bold text-green-400">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Healthy
                            </span>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-800">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            All systems are operational. Last backup was completed 4 hours ago.
                        </p>
                    </div>
                </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
