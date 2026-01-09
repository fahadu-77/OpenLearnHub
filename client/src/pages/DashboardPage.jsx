import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { CourseCard } from '../components/CourseCard';
import { Clock, Star, Trophy, Target, Grid } from 'lucide-react';

const fetchMe = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

const DashboardPage = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['me'],
        queryFn: fetchMe,
        enabled: isAuthenticated, // Only run if authenticated
    });
    const userId = user?._id || user?.id;

    const { data: createdCourses } = useQuery({
        queryKey: ['createdCourses', userId],
        queryFn: async () => {
            const res = await api.get(`/courses?instructor=${userId}`);
            return res.data;
        },
        enabled: !!userId // Only run if user ID is available
    });

    if (!isAuthenticated) {
        return <div className="p-8">Please login to view dashboard.</div>;
    }

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading dashboard</div>;



    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>

            {/* Gamification Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Learning Hours</p>
                            <h3 className="text-3xl font-bold">{user.learningHours || 0} hrs</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Star className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-amber-100 text-sm font-medium uppercase tracking-wider">Learning Points</p>
                            <h3 className="text-3xl font-bold">{user.learningPoints || 0} pts</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Milestones</p>
                            <h3 className="text-3xl font-bold">{user.checkpointsReached?.length || 0} achieved</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {/* Checkpoints Section */}
                {user.checkpointsReached?.length > 0 && (
                    <div className="bg-white p-6 rounded shadow-md border-l-4 border-amber-500">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Target className="w-6 h-6 text-amber-500" /> My Achievements
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {user.checkpointsReached.map(cp => (
                                <div key={cp} className="flex flex-col items-center p-4 bg-amber-50 rounded-lg border border-amber-200 min-w-[120px]">
                                    <Trophy className="w-10 h-10 text-amber-600 mb-2" />
                                    <span className="font-bold text-amber-900">{cp} Hours</span>
                                    <span className="text-[10px] text-amber-700 uppercase">Mastery Badge</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructor Section */}
                {(user.role === 'instructor' || user.role === 'admin') && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Creator Console</h2>
                            <Link to="/create-course" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 font-medium shadow-md transition-all">
                                + Create New Channel
                            </Link>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Grid className="w-5 h-5 text-indigo-500" /> My Channels
                            </h3>
                            {createdCourses?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {createdCourses.map(course => (
                                        <CourseCard key={course._id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-sm">No channels created yet. Start your teaching journey today!</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Enrolled Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900">My Learning Library</h2>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-indigo-500" /> Enrolled Channels
                        </h3>
                        {user.enrolledCourses?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.enrolledCourses.map(course => (
                                    <CourseCard key={course._id} course={course} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Not enrolled in any channels yet. <Link to="/" className="text-indigo-600 hover:underline">Explore Creator Channels</Link></p>
                            
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DashboardPage;
