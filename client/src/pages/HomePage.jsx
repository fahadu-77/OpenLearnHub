import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const CATEGORIES = [
    { name: 'Development', emoji: '💻', gradient: 'from-blue-50 to-indigo-50', hover: 'hover:from-blue-100 hover:to-indigo-100', text: 'text-blue-600' },
    { name: 'Design', emoji: '🎨', gradient: 'from-purple-50 to-pink-50', hover: 'hover:from-purple-100 hover:to-pink-100', text: 'text-purple-600' },
    { name: 'Business', emoji: '💼', gradient: 'from-orange-50 to-amber-50', hover: 'hover:from-orange-100 hover:to-amber-100', text: 'text-orange-600' },
    { name: 'Marketing', emoji: '📈', gradient: 'from-green-50 to-emerald-50', hover: 'hover:from-green-100 hover:to-emerald-100', text: 'text-green-600' },
    { name: 'IT & Software', emoji: '⚙️', gradient: 'from-gray-50 to-slate-50', hover: 'hover:from-gray-100 hover:to-slate-100', text: 'text-gray-600' },
    { name: 'Personal Development', emoji: '🌱', gradient: 'from-teal-50 to-cyan-50', hover: 'hover:from-teal-100 hover:to-cyan-100', text: 'text-teal-600' },
    { name: 'Photography', emoji: '📷', gradient: 'from-red-50 to-rose-50', hover: 'hover:from-red-100 hover:to-rose-100', text: 'text-red-600' },
    { name: 'Music', emoji: '🎵', gradient: 'from-yellow-50 to-orange-50', hover: 'hover:from-yellow-100 hover:to-orange-100', text: 'text-yellow-600' },
];

const HomePage = () => {
    const { hash } = useLocation();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [hash]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                <div className="container mx-auto px-4 py-24 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-8 animate-fade-in">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Join 10M+ learners worldwide
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 tracking-tight animate-slide-up">
                            Learn anything,
                            <br />
                            <span className="text-gray-400">anytime</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto animate-slide-up-delay">
                            Explore thousands of creative courses. Build skills with expert-led classes.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
                            {!isAuthenticated ? (
                                <Link
                                    to="/register"
                                    className="group px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    Start Learning Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <Link
                                    to="/dashboard"
                                    className="group px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                            <Link
                                to="#categories"
                                className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-full font-semibold text-lg hover:border-gray-300 transition-all duration-300"
                            >
                                Browse Categories
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div id="categories" className="container mx-auto px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            What will you create?
                        </h2>
                        <p className="text-xl text-gray-500">
                            Choose your path and start learning today
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CATEGORIES.map((category, index) => (
                            <Link
                                key={category.name}
                                to={`/category/${category.name}`}
                                className="group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={`
                                    relative overflow-hidden rounded-2xl p-8 
                                    bg-gradient-to-br ${category.gradient} ${category.hover}
                                    transition-all duration-500 ease-out
                                    transform hover:-translate-y-2 hover:shadow-xl
                                    border border-gray-100
                                `}>
                                    {/* Emoji Icon */}
                                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                        {category.emoji}
                                    </div>

                                    {/* Category Name */}
                                    <h3 className={`text-lg font-semibold ${category.text} mb-2`}>
                                        {category.name}
                                    </h3>

                                    {/* Arrow - appears on hover */}
                                    <div className="flex items-center text-gray-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Explore
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-20 border-y border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '10M+', label: 'Students' },
                            { value: '50K+', label: 'Instructors' },
                            { value: '100K+', label: 'Courses' },
                            { value: '4.8★', label: 'Rating' }
                        ].map((stat, index) => (
                            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to unlock your creativity?
                        </h2>
                        <p className="text-xl text-gray-300 mb-10">
                            Join our community and start your learning journey today
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 group"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
