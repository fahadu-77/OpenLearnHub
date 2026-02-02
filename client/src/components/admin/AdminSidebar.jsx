import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Flag,
    BookOpen,
    Users,
    UserRound,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Flag, label: 'Flags', path: '/admin/flags' },
        { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
        { icon: UserRound, label: 'Instructors', path: '/admin/instructors' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
                {!isCollapsed && (
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Admin Panel
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
              ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50'}
            `}
                    >
                        <item.icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
                        {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
