'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Announcement, Student, Teacher } from '../types';

interface AnnouncementsScreenProps {
    isTeacher?: boolean;
    student?: Student | null;
    teacher?: Teacher | null;
}

const GRADES = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const CATEGORIES: Announcement['category'][] = ['general', 'academic', 'sports', 'events'];

const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = ({
    isTeacher = false,
    student = null,
    teacher = null,
}) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [audienceMode, setAudienceMode] = useState<'everyone' | 'grades' | 'subjects'>('everyone');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general' as Announcement['category'],
        priority: 'normal' as Announcement['priority'],
        target_grades: [] as number[],
        target_subjects: [] as string[],
        expires_in_days: '' as string, // empty = never
    });
    const [isSaving, setIsSaving] = useState(false);

    // Determine author info
    const authorName = teacher?.['Full name'] || teacher?.Name || 'Teacher';
    const authorEmail = teacher?.Email || '';
    const authorRole = teacher?.user_role === 'admin' ? 'admin' : 'teacher';

    const fetchAnnouncements = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (!isTeacher && student?.grade) {
                params.set('grade', student.grade.toString());
                params.set('role', 'student');
                if (student.student_number) {
                    params.set('studentNumber', student.student_number.toString());
                }
            } else {
                params.set('role', 'teacher');
            }
            const res = await fetch(`/api/announcements?${params}`);
            const data = await res.json();
            setAnnouncements(data.announcements || []);
        } catch {
            setAnnouncements([]);
        } finally {
            setIsLoading(false);
        }
    }, [isTeacher, student]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const getCategoryColor = (category: Announcement['category']) => {
        switch (category) {
            case 'academic': return 'bg-blue-100 text-blue-700';
            case 'sports': return 'bg-green-100 text-green-700';
            case 'events': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityBadge = (priority: Announcement['priority']) => {
        switch (priority) {
            case 'high':
                return (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-100 text-red-600">
                        <span className="material-symbols-outlined text-sm">priority_high</span>
                        Urgent
                    </span>
                );
            case 'low':
                return null;
            default:
                return null;
        }
    };

    const handleGradeToggle = (grade: number) => {
        setFormData(prev => ({
            ...prev,
            target_grades: prev.target_grades.includes(grade)
                ? prev.target_grades.filter(g => g !== grade)
                : [...prev.target_grades, grade].sort((a, b) => a - b),
        }));
    };

    const handleSelectAllGrades = () => {
        setFormData(prev => ({
            ...prev,
            target_grades: prev.target_grades.length === GRADES.length ? [] : [...GRADES],
        }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            category: 'general',
            priority: 'normal',
            target_grades: [],
            target_subjects: [],
            expires_in_days: '',
        });
        setAudienceMode('everyone');
    };

    const handleCreateAnnouncement = async () => {
        if (!formData.title.trim() || !formData.content.trim()) return;

        setIsSaving(true);

        // Calculate expiration date
        let expires_at: string | null = null;
        if (formData.expires_in_days && parseInt(formData.expires_in_days) > 0) {
            const d = new Date();
            d.setDate(d.getDate() + parseInt(formData.expires_in_days));
            expires_at = d.toISOString();
        }

        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    content: formData.content.trim(),
                    category: formData.category,
                    priority: formData.priority,
                    target_grades: audienceMode === 'grades' ? formData.target_grades : null,
                    target_subjects: audienceMode === 'subjects' ? formData.target_subjects : null,
                    author_email: authorEmail,
                    author_name: authorName,
                    author_role: authorRole,
                    expires_at,
                }),
            });

            const data = await res.json();
            if (res.ok && data.announcement) {
                setAnnouncements(prev => [data.announcement, ...prev]);
                setShowCreateModal(false);
                resetForm();
            }
        } catch {
            // silently fail for now
        } finally {
            setIsSaving(false);
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-full bg-orange-950 overflow-y-auto relative animate-in slide-in-from-right duration-300">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-amber-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />

            <div className="p-6 pb-24 md:p-8 space-y-6 relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Announcements</h1>
                        <p className="text-sm text-orange-200">Latest updates from your school</p>
                    </div>

                    {isTeacher && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-sm"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            New
                        </button>
                    )}
                </header>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && announcements.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-orange-200">campaign</span>
                        </div>
                        <p className="text-white font-medium mb-1">No announcements yet</p>
                        <p className="text-orange-200 text-sm">Check back later for updates</p>
                    </div>
                )}

                {/* Announcements Feed */}
                {!isLoading && (
                    <div className="space-y-4">
                        {announcements.map((a) => (
                            <div
                                key={a.id}
                                className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                            >
                                {/* Top badges row */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getCategoryColor(a.category)}`}>
                                        {a.category}
                                    </span>
                                    {getPriorityBadge(a.priority)}
                                    {a.target_grades && a.target_grades.length > 0 && (
                                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                                            {a.target_grades.map(g => g === 0 ? 'Trial' : `Gr. ${g}`).join(', ')}
                                        </span>
                                    )}
                                    {a.target_subjects && a.target_subjects.length > 0 && (
                                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600">
                                            {a.target_subjects.join(', ')}
                                        </span>
                                    )}
                                    <span className="ml-auto text-xs text-gray-400 font-medium whitespace-nowrap">
                                        {timeAgo(a.created_at)}
                                    </span>
                                </div>

                                {/* Title & content */}
                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                                    {a.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                    {a.content}
                                </p>

                                {/* Author footer */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                                        {a.author_name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-700 font-medium">{a.author_name}</span>
                                        <span className="text-[10px] text-gray-400 capitalize">{a.author_role}</span>
                                    </div>
                                    <span className="ml-auto text-[10px] text-gray-400">
                                        {new Date(a.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ============ Create Announcement Modal ============ */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                >
                    <div
                        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-orange-600">campaign</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">New Announcement</h2>
                                </div>
                                <button
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                        placeholder="Announcement title"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                                        rows={4}
                                        placeholder="Write your announcement..."
                                    />
                                </div>

                                {/* Category & Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Announcement['category'] }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Announcement['priority'] }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white"
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High (Urgent)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Audience selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
                                    <div className="flex gap-2">
                                        {(['everyone', 'grades', 'subjects'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setAudienceMode(mode)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    audienceMode === mode
                                                        ? 'bg-orange-600 text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {mode === 'everyone' ? 'Everyone' : mode === 'grades' ? 'By Grade' : 'By Subject'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Grade chips (shown when audience = grades) */}
                                {audienceMode === 'grades' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-700">Select Grades</label>
                                            <button
                                                type="button"
                                                onClick={handleSelectAllGrades}
                                                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                {formData.target_grades.length === GRADES.length ? 'Clear All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {GRADES.map(grade => (
                                                <button
                                                    key={grade}
                                                    type="button"
                                                    onClick={() => handleGradeToggle(grade)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                        formData.target_grades.includes(grade)
                                                            ? 'bg-orange-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {grade === 0 ? 'Trial Students' : `Grade ${grade}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Subject input (shown when audience = subjects) */}
                                {audienceMode === 'subjects' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={formData.target_subjects.join(', ')}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                target_subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                                            }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                            placeholder="e.g. Mathematics, English"
                                        />
                                    </div>
                                )}

                                {/* Expiration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Auto-expire after</label>
                                    <select
                                        value={formData.expires_in_days}
                                        onChange={(e) => setFormData(prev => ({ ...prev, expires_in_days: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white"
                                    >
                                        <option value="">Never</option>
                                        <option value="1">1 day</option>
                                        <option value="3">3 days</option>
                                        <option value="7">1 week</option>
                                        <option value="14">2 weeks</option>
                                        <option value="30">1 month</option>
                                    </select>
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleCreateAnnouncement}
                                    disabled={isSaving || !formData.title.trim() || !formData.content.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:from-orange-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">send</span>
                                            Publish Announcement
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsScreen;
