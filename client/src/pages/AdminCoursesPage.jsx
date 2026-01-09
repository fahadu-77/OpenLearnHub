import { useEffect, useState } from 'react';
import api from '../utils/api';
import { BookOpen, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setCourses(res.data);
        } catch (err) {
            alert('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-8">Loading courses...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-green-600" />
                Course Management
            </h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses or instructors..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Total Courses: <span className="font-semibold text-gray-900">{filteredCourses.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Instructor</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCourses.map(course => (
                                <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        <div className="flex items-center gap-3">
                                            {course.thumbnail && (
                                                <img src={course.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                                            )}
                                            {course.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{course.instructor?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        {course.price === 0 ? (
                                            <span className="text-green-600 font-medium">Free</span>
                                        ) : (
                                            `$${course.price}`
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/course/${course._id}`}
                                            target="_blank"
                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-end gap-1"
                                        >
                                            View <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                </div>
            </div>
        </div>
    );
};

export default AdminCoursesPage;
