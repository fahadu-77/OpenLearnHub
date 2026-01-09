import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Users, BookOpen, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const fetchAllUsers = async () => {
    const res = await api.get('/auth/users');
    return res.data;
};

const fetchAllLessons = async () => {
    const res = await api.get('/lessons/admin/all');
    return res.data;
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, name: '' });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        queryFn: fetchAllUsers,
        enabled: user?.role === 'admin'
    });

    const { data: lessons, isLoading: lessonsLoading } = useQuery({
        queryKey: ['allLessons'],
        queryFn: fetchAllLessons,
        enabled: user?.role === 'admin'
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId) => api.delete(`/auth/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['allUsers']);
            setDeleteConfirm({ type: null, id: null, name: '' });
            alert('User deleted successfully');
        },
        onError: (err) => {
            alert(err.response?.data?.msg || 'Error deleting user');
        }
    });

    const deleteLessonMutation = useMutation({
        mutationFn: (lessonId) => api.delete(`/lessons/${lessonId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['allLessons']);
            setDeleteConfirm({ type: null, id: null, name: '' });
            alert('Lesson deleted successfully');
        },
        onError: (err) => {
            alert(err.response?.data?.msg || 'Error deleting lesson');
        }
    });

    const handleDelete = () => {
        if (deleteConfirm.type === 'user') {
            deleteUserMutation.mutate(deleteConfirm.id);
        } else if (deleteConfirm.type === 'lesson') {
            deleteLessonMutation.mutate(deleteConfirm.id);
        }
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <AlertCircle className="w-8 h-8 text-red-600" />
                Admin Dashboard
            </h1>

            {/* Users Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    User Management
                </h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {usersLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading users...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Enrolled Courses</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users?.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                u.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.enrolledCourses?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: 'user', id: u._id, name: u.name })}
                                                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Lessons Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    Lesson Management
                </h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {lessonsLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading lessons...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Channel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {lessons?.map((lesson) => (
                                    <tr key={lesson._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lesson.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lesson.course?.title || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${lesson.lessonType === 'youtube' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {lesson.lessonType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lesson.createdBy?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setDeleteConfirm({ type: 'lesson', id: lesson._id, name: lesson.title })}
                                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.type && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete {deleteConfirm.type} <strong>{deleteConfirm.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setDeleteConfirm({ type: null, id: null, name: '' })}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteUserMutation.isPending || deleteLessonMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {(deleteUserMutation.isPending || deleteLessonMutation.isPending) ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
