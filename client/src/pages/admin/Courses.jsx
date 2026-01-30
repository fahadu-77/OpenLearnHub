import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, ExternalLink, Filter } from 'lucide-react';
import api from '../../utils/api';
import AdminTable from '../../components/admin/AdminTable';

const Courses = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: courses, isLoading } = useQuery({
        queryKey: ['adminAllCourses'],
        queryFn: async () => {
            const res = await api.get('/admin/courses');
            return res.data;
        }
    });

    const filteredCourses = courses?.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headers = ['Course', 'Instructor', 'Category', 'Price', 'Students'];//, 'Status', 'Actions'

    const renderRow = (course) => (
        <>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {course.thumbnail && (
                            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={course.title}>
                        {course.title}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm font-medium text-slate-600">{course.instructor?.name || 'Unknown'}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                    {course.category}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm font-bold text-slate-900">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                </span>
            </td>
            <td className="px-6 py-4 text-center">
                <span className="text-sm font-medium text-slate-600">{course.enrolledStudents?.length || 0}</span>
            </td>
            {/* <td className="px-6 py-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${course.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'
                    }`}>
                    {course.status}
                </span>
            </td> */}
            {/* <td className="px-6 py-4 text-right">
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                    <ExternalLink size={18} />
                </button>
            </td> */}
        </>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen size={28} className="text-green-600" />
                        Course Inventory
                    </h1>
                    <p className="text-slate-500">Overview of all educational content on the platform.</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all w-full md:w-64 text-sm"
                        />
                    </div>
                    {/* <button className="p-2 border border-slate-200 rounded-xl hover:bg-white transition-all">
                        <Filter size={18} className="text-slate-500" />
                    </button> */}
                </div>
            </div>

            <AdminTable
                headers={headers}
                data={filteredCourses}
                renderRow={renderRow}
            />
        </div>
    );
};

export default Courses;
