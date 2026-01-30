import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users as UsersIcon, Search, GraduationCap, MapPin, Calendar } from 'lucide-react';
import api from '../../utils/api';
import AdminTable from '../../components/admin/AdminTable';

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: users, isLoading } = useQuery({
        queryKey: ['adminAllUsers'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data;
        }
    });

    const students = users?.filter(user => user.role === 'student' || !user.role) || [];

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headers = ['Student', 'Email', 'Enrollments','Joined'];//, 'Actions', 'Learning Points', 

    const renderRow = (student) => (
        <>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-indigo-100 shadow-sm">
                        {student.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{student.name}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-slate-600">{student.email}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{student.enrolledCourses?.length || 0} Courses</span>
                </div>
            </td>
            {/* <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
                    <span className="text-sm font-bold text-slate-900">{student.learningPoints || 0} pts</span>
                </div>
            </td> */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={14} />
                    {new Date(student.createdAt).toLocaleDateString()}
                </div>
            </td>
            {/* <td className="px-6 py-4 text-right">
                <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                    View Detail
                </button>
            </td> */}
        </>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UsersIcon size={28} className="text-indigo-600" />
                        Students Explorer
                    </h1>
                    <p className="text-slate-500">Monitor student engagement and enrollment trends.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all w-full md:w-64 text-sm"
                    />
                </div>
            </div>

            <AdminTable
                headers={headers}
                data={filteredStudents}
                renderRow={renderRow}
            />
        </div>
    );
};

export default Users;
