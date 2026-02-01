import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { CourseCard } from '../components/CourseCard';
import placeholder from '../assets/thumbnail.png';
import {
    Clock,
    Trophy,
    BookOpen,
    CheckCircle2,
    Play,
    Layout,
    Sparkles,
    TrendingUp,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { plugin } from 'postcss';

const fetchMe = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

const fetchAllCourses = async () => {
    const res = await api.get('/courses');
    return res.data;
};

const DashboardPage = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('all');

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: fetchMe,
        enabled: isAuthenticated,
    });

    const { data: allCourses, isLoading: coursesLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: fetchAllCourses,
        enabled: isAuthenticated,
    });

    const processedData = useMemo(() => {
        if (!user || !allCourses) return null;

        const enrolledWithProgress = user.enrolledCourses.map(course => {
            const progress = user.learningProgress?.find(p => p.course._id === course._id || p.course === course._id);
            const totalLessons = course.lessons?.length || 0;
            const completedLessons = progress?.lessons?.filter(l => l.lessonCompleted)?.length || 0;
            const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

            let status = 'not started';
            if (progressPercent > 0 && progressPercent < 100) status = 'in progress';
            else if (progressPercent === 100) status = 'completed';

            // Estimated days: assuming 1 lesson per day for the remaining lessons
            const estimatedDays = totalLessons - completedLessons;

            return {
                ...course,
                progressPercent,
                completedLessons,
                totalLessons,
                status,
                estimatedDays,
                lastWatched: progress?.lastWatched
            };
        });

        // Find hero course: One with lastWatched, or the first "in progress" one, or the most recent enrolled
        const heroCourse = enrolledWithProgress.find(c => c.lastWatched) ||
            enrolledWithProgress.find(c => c.status === 'in progress') ||
            enrolledWithProgress[0];

        // Recommendations: same categories as enrolled, excluding already enrolled
        const enrolledCategories = [...new Set(user.enrolledCourses.map(c => c.category))];
        const enrolledIds = user.enrolledCourses.map(c => c._id);
        const recommended = allCourses
            .filter(c => enrolledCategories.includes(c.category) && !enrolledIds.includes(c._id)&& c.lessons?.length > 0)
            .slice(0, 4);

        // Learning Summary
        const totalLessonsDone = enrolledWithProgress.reduce((acc, curr) => acc + curr.completedLessons, 0);
        const inProgressCount = enrolledWithProgress.filter(c => c.status === 'in progress').length;
        const completedCount = enrolledWithProgress.filter(c => c.status === 'completed').length;

        return {
            enrolledWithProgress,
            heroCourse,
            recommended,
            summary: {
                totalLessonsDone,
                inProgressCount,
                completedCount
            }
        };
    }, [user, allCourses]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Please login to view dashboard</h2>
                    <Link to="/login" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (userLoading || coursesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full"></div>
                    <div className="text-slate-400 font-medium">Loading your journey...</div>
                </div>
            </div>
        );
    }

    if (!processedData) return null;

    const { enrolledWithProgress, heroCourse, recommended, summary } = processedData;

    const filteredCourses = enrolledWithProgress.filter(c => {
        if (filterStatus === 'all') return true;
        return c.status === filterStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Welcome back, <span className="text-indigo-600">{user.name}!</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Pick up right where you left off.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        {['all', 'in progress', 'completed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${filterStatus === status
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Hero Section: Continue Learning */}
                {heroCourse && (
                    <section>
                        <div className="relative overflow-hidden bg-slate-900/95 rounded-3xl border border-slate-800 shadow-xl group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>

                            <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12">
                                <div className="w-full lg:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-700 self-start">
                                    <img
                                        src={heroCourse.thumbnail || placeholder}
                                        alt={heroCourse.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 space-y-6 w-full text-slate-100">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3" /> Most Recently Active
                                        </div>
                                        <h2 className="text-2xl lg:text-3xl font-bold leading-tight">
                                            {heroCourse.title}
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widerCondensed">Progress</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                                                        style={{ width: `${heroCourse.progressPercent}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold">{heroCourse.progressPercent}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widerCondensed">Lessons</p>
                                            <div className="flex items-center gap-2 font-bold">
                                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                                <span>{heroCourse.completedLessons} / {heroCourse.totalLessons}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widerCondensed">Estimate</p>
                                            <div className="flex items-center gap-2 font-bold">
                                                <Calendar className="w-4 h-4 text-indigo-400" />
                                                <span>{heroCourse.estimatedDays || 0} days</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex pt-4">
                                        <button
                                            onClick={() => navigate(`/course/${heroCourse._id}`)}
                                            className="group/btn relative overflow-hidden bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Play className="w-5 h-5 fill-current" />
                                            Continue Course
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

                    {/* Enrolled Courses */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Layout className="w-6 h-6 text-indigo-600" />
                                My Courses
                                <span className="text-sm font-medium text-slate-400 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full ml-2">
                                    {filteredCourses.length}
                                </span>
                            </h2>
                        </div>

                        {filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredCourses.map(course => (
                                    <div key={course._id} className="group bg-white rounded-2xl border border-slate-200 hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-300 overflow-hidden">
                                        <div className="relative aspect-video">
                                            <img src={course.thumbnail || placeholder} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                            <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-black tracking-widest text-slate-800 border border-slate-100 shadow-sm">
                                                {course.status.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-5">
                                            <Link to={`/course/${course._id}`} className="block group-hover:text-indigo-600 transition-colors">
                                                <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">{course.title}</h3>
                                            </Link>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    <span>{course.progressPercent}% Complete</span>
                                                    <span>{course.totalLessons - course.completedLessons} left</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${course.progressPercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                    <Clock className="w-4 h-4 text-slate-300" />
                                                    <span>~{course.estimatedDays} days left</span>
                                                </div>
                                                <Link
                                                    to={`/course/${course._id}`}
                                                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                                                >
                                                    <Play className="w-4 h-4 fill-current" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start your journey by enrolling in a new channel from our curated selection.</p>
                                <Link to="/#categories" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                                    Browse Channels
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Recommended & Summary */}
                    <aside className="space-y-10">

                        {/* Summary Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Activity
                            </h3>
                            <div className="bg-slate-900/95 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6 text-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{summary.totalLessonsDone}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Lessons Done</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/20 text-blue-300 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{summary.inProgressCount}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">In Progress</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-500/20 text-green-300 rounded-xl flex items-center justify-center shrink-0">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{summary.completedCount}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Recommended Section */}
                        {recommended.length > 0 && (
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    Recommended
                                </h3>
                                <div className="space-y-4">
                                    {recommended.map(course => (
                                        <Link key={course._id} to={`/course/${course._id}`} className="group flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
                                            <img src={course.thumbnail || placeholder} className="w-16 h-12 object-cover rounded-lg shrink-0" alt="" />
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {course.title}
                                                </h4>
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{course.instructor?.name || 'Instructor'}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

