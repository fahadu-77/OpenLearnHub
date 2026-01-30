import React from 'react';

const AdminStatCard = ({ label, value, icon: Icon, color, trend }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}%
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
            </div>
        </div>
    );
};

export default AdminStatCard;
