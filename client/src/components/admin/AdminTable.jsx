import React from 'react';

const AdminTable = ({ headers, data, renderRow }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            {headers.map((header, idx) => (
                                <th
                                    key={idx}
                                    className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data?.map((item, idx) => (
                            <tr
                                key={idx}
                                className="hover:bg-slate-50 transition-colors group"
                            >
                                {renderRow(item)}
                            </tr>
                        ))}
                        {(!data || data.length === 0) && (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-400">
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTable;
