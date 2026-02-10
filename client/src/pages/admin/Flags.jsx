import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const Flags = () => {
    const [selectedFlag, setSelectedFlag] = useState(null);
    const queryClient = useQueryClient();

    const { data: lessons, isLoading } = useQuery({
        queryKey: ['adminAllLessons'],
        queryFn: async () => {
            const res = await api.get('/lessons/admin/all');
            return res.data;
        }
    });

    const flaggedLessons = lessons?.filter(l =>
        l.moderationResult?.risk_level === 'HIGH' ||
        l.moderationResult?.risk_level === 'MEDIUM' ||
        l.status === 'pending_review' || l.status === 'blocked'
    ) || [];

    const reviewMutation = useMutation({
        mutationFn: async ({ id, action }) => {
            const res = await api.post(`/lessons/${id}/review`, { action });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminAllLessons']);
            setSelectedFlag(null);
        }
    });

    const getHarmLevelColor = (level) => {
        switch (level?.toUpperCase()) {
            case 'HIGH': return 'text-red-600 bg-red-50';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50';
            case 'LOW': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Flag size={28} className="text-red-600" />
                    Content Flags
                </h1>
                <p className="text-slate-500">Review and moderate content flagged by the AI moderation system.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {flaggedLessons.map((flag) => (
                    <div
                        key={flag._id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6"
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getHarmLevelColor(flag.moderationResult?.risk_level)}`}>
                                        {flag.moderationResult?.risk_level || 'UNKNOWN'} Risk
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">Flagged on {new Date(flag.createdAt).toLocaleDateString()}</span>
                                    {flag.status === 'pending_review' && (
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md uppercase">Pending Review</span>
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{flag.title}</h2>
                                    <p className="text-sm text-slate-500">Course: {flag.course?.title}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <MessageSquare size={14} />
                                        Reasoning Preview
                                    </p>
                                    <p className="text-sm text-slate-600 italic">"{flag.moderationResult?.short_reason || 'No specific reason provided.'}"</p>
                                </div>
                            </div>

                            <div className="flex lg:flex-col items-center lg:items-end justify-center gap-3 shrink-0">
                                <button
                                    onClick={() => setSelectedFlag(flag)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors font-bold text-sm"
                                >
                                    <Eye size={18} />
                                    Review Details
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => reviewMutation.mutate({ id: flag._id, action: 'approve' })}
                                        disabled={reviewMutation.isLoading}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50"
                                        title="Quick Approve"
                                    >
                                        <CheckCircle size={24} />
                                    </button>
                                    <button
                                        onClick={() => reviewMutation.mutate({ id: flag._id, action: 'reject' })}
                                        disabled={reviewMutation.isLoading}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                        title="Quick Reject"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {flaggedLessons.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">All Clear!</h3>
                        <p className="text-slate-500">No content currently requires moderation review.</p>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedFlag && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedFlag(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold text-slate-900">Reviewing: {selectedFlag.title}</h3>
                            <button onClick={() => setSelectedFlag(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Level</label>
                                    <p className={`text-sm font-bold uppercase ${getHarmLevelColor(selectedFlag.moderationResult?.risk_level)} px-2 py-0.5 rounded inline-block`}>
                                        {selectedFlag.moderationResult?.risk_level}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categories Detected</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFlag.moderationResult?.detected_categories?.map((cat, i) => (
                                            <span key={i} className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                {cat}
                                            </span>
                                        ))}
                                        {(!selectedFlag.moderationResult?.detected_categories || selectedFlag.moderationResult?.detected_categories.length === 0) && (
                                            <span className="text-xs text-slate-400 italic">None specifically identified</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Moderation Reason</label>
                                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {selectedFlag.moderationResult?.short_reason}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transcript Analysis</label>
                                <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl max-h-[200px] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                                    {selectedFlag.transcript || "Transcript not yet generated or available."}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
                            <button
                                disabled={reviewMutation.isLoading}
                                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-100 disabled:opacity-50"
                                onClick={() => reviewMutation.mutate({ id: selectedFlag._id, action: 'approve' })}
                            >
                                Approve Lesson
                            </button>
                            <button
                                disabled={reviewMutation.isLoading}
                                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-100 disabled:opacity-50"
                                onClick={() => reviewMutation.mutate({ id: selectedFlag._id, action: 'reject' })}
                            >
                                Reject Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Flags;
