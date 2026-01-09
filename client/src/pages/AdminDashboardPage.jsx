import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { LayoutDashboard, Users, BookOpen, Activity, AlertCircle } from 'lucide-react';

const AdminDashboardPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
    const [stats, setStats] = useState({ users: 0, courses: 0, instructors: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/logs?limit=5')
                ]);
                setStats(statsRes.data);
                setLogs(logsRes.data.logs);
            } catch (err) {
                console.error('Failed to fetch admin data', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'admin') {
            fetchData();
        }
    }, [isAuthenticated, user]);

    if (authLoading || (loading && isAuthenticated)) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Courses</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.courses}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                        <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Instructors</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.instructors}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-500" />
                            Recent Activity
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 mb-1">
                                                {log.action}
                                            </span>
                                            <p className="text-sm text-gray-600">
                                                Target: <span className="font-medium text-gray-900">{log.target}</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                By: {log.admin?.email || 'Unknown'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500">No recent activity</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link to="/admin/users" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                            <h3 className="font-semibold text-gray-900">Manage Users</h3>
                            <p className="text-sm text-gray-500">View users, promote to instructor, or demote.</p>
                        </Link>
                        <Link to="/admin/courses" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                            <h3 className="font-semibold text-gray-900">Manage Courses</h3>
                            <p className="text-sm text-gray-500">View all courses and moderate content.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
