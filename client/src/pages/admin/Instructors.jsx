import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRound, Search, DollarSign, Users as UsersIcon, Mail } from 'lucide-react';
import api from '../../utils/api';
import AdminTable from '../../components/admin/AdminTable';

const Instructors = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['adminAllUsers'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data;
        }
    });

    const { data: courses, isLoading: coursesLoading } = useQuery({
        queryKey: ['adminAllCourses'],
        queryFn: async () => {
            const res = await api.get('/admin/courses');
            return res.data;
        }
    });

    const instructors = users?.filter(user => user.role === 'instructor') || [];
console.log("instructors", instructors);
    const instructorsWithStats = instructors.map(instructor => {
        const instructorCourses = courses?.filter(c => c.instructor?._id === instructor._id) || [];
        const totalStudents = instructorCourses.reduce((acc, curr) => acc + (curr.enrolledStudents?.length || 0), 0);
        const totalRevenue = instructorCourses.reduce((acc, curr) => acc + ((curr.enrolledStudents?.length || 0) * curr.price), 0);
        console.log("log", instructorCourses);   

        return {
            ...instructor,
            courseCount: instructorCourses.length,
            totalStudents,
            totalRevenue
        };
    });

    const filteredInstructors = instructorsWithStats.filter(instructor =>
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headers = ['Instructor', 'Courses', 'Total Students', 'Revenue', 'Joined']; //, 'Actions'

    const renderRow = (instructor) => (
        <>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100">
                        {instructor.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{instructor.name}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={12} />
                            {instructor.email}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-slate-900 font-bold">{instructor.courseCount}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <UsersIcon size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-900 font-bold">{instructor.totalStudents}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-green-600 font-bold">
                    <DollarSign size={16} />
                    {instructor.totalRevenue.toLocaleString()}
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-xs text-slate-400">{new Date(instructor.createdAt).toLocaleDateString()}</span>
            </td>
            {/* <td className="px-6 py-4 text-right">
                <button className="text-xs font-bold text-indigo-600 hover:underline">
                    View Profile
                </button>
            </td> */}
        </>
    );

    if (usersLoading || coursesLoading) {
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
                        <UserRound size={28} className="text-purple-600" />
                        Instructors
                    </h1>
                    <p className="text-slate-500">Manage your platform's educators and their earnings.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all w-full md:w-64 text-sm"
                    />
                </div>
            </div>

            <AdminTable
                headers={headers}
                data={filteredInstructors}
                renderRow={renderRow}
            />
        </div>
    );
};

export default Instructors;
