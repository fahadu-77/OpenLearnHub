import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Filter, Grid, List, Star, Trophy } from 'lucide-react';
import { useState } from 'react';
import api from '../utils/api';
import { CourseCard } from '../components/CourseCard';

const fetchCoursesByCategory = async (category) => {
    const res = await api.get(`/courses?category=${category}`);
    return res.data;
};

const CategoryCoursesPage = () => {
    const { category } = useParams();
    const [viewMode, setViewMode] = useState('grid');
    const [activeType, setActiveType] = useState('youtube');

    const { data: courses, isLoading, error } = useQuery({
        queryKey: ['courses', category],
        queryFn: () => fetchCoursesByCategory(category),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading courses...</p>
                </div>
            </div>
        );
    }

    if (error || !courses) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="text-xl">Error loading courses</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-16">
                <div className="container mx-auto px-4">
                    <Link
                        to="/"
                        className="inline-flex items-center text-indigo-100 hover:text-white mb-6 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Library
                    </Link>

                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">{category}</h1>
                    <div className="flex flex-wrap gap-4 items-center text-indigo-100">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                            <Grid className="w-4 h-4" />
                            <span className="text-sm">{courses.length} Channels Available</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-end py-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Channel Information Alert */}
            <div className="container mx-auto px-4 mt-8">
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                        <h4 className="font-bold text-indigo-900">Creator Channels in {category}</h4>
                        <p className="text-sm text-indigo-800">Enroll in a channel to unlock all current and future lessons. Learn directly from experts.</p>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="container mx-auto px-4 py-8">
                {courses.length > 0 ? (
                    <div className={
                        viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4"
                    }>
                        {courses.map(course => (
                            <CourseCard key={course._id} course={course} viewMode={viewMode} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Filter className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No {activeType === 'premium' ? 'premium' : 'YouTube'} courses found
                            </h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Explore the other tab or check back later!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryCoursesPage;
