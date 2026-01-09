import { Link } from 'react-router-dom';
import placeholder from '../assets/thumbnail.png';
import { Star, Play } from 'lucide-react';

export const CourseCard = ({ course, viewMode = 'grid' }) => {
    if (viewMode === 'list') {
        
        return (
            <div className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex border border-gray-100">
                <div className="relative w-80 h-48 overflow-hidden flex-shrink-0">
                    <img
                        src={course.thumbnail || 'https://via.placeholder.com/400x225'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-md">
                            <Play className="w-6 h-6 text-gray-900 ml-1" />
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md border bg-indigo-600/90 text-white border-indigo-400">
                            Channel
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.description}</p>
                        <p className="text-sm text-gray-500 mb-4">
                            {course.instructor?.name || 'Unknown Instructor'}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-gray-900">4.8</span>
                            </div>
                            <span>•</span>
                            <span>{course.lessonCount || 0} lessons</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link to={`/course/${course._id}`} className="group block">
            <div className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Image with Play Button Overlay */}
                <div className="relative overflow-hidden aspect-video">
                    <img
                        src={course.thumbnail || placeholder}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                            <Play className="w-6 h-6 text-gray-900 ml-1" />
                        </div>
                    </div>

                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md border bg-indigo-600/90 text-white border-indigo-400">
                            Channel
                        </div>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-gray-900 shadow-sm border border-gray-100">
                        ${course.price}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-3">
                        {course.instructor?.name || 'Unknown Instructor'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-gray-900">4.8</span>
                        </div>
                        <span>•</span>
                        <span>{course.lessonCount || 0} lessons</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
