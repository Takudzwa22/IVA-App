'use client';

import React, { useState } from 'react';
import { mockAnnouncements } from '../lib/__fixtures__/mockData';
import { Announcement } from '../types';

interface AnnouncementsScreenProps {
    onBack?: () => void;
    isTeacher?: boolean;
    teacherName?: string;
}

const GRADES = [8, 9, 10, 11, 12];
const CATEGORIES: Announcement['category'][] = ['general', 'academic', 'sports', 'events'];

const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = ({ onBack, isTeacher = false, teacherName = 'Teacher' }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general' as Announcement['category'],
        priority: 'normal' as Announcement['priority'],
        target_grades: [] as number[],
    });
    const [isSaving, setIsSaving] = useState(false);

    const getCategoryColor = (category: Announcement['category']) => {
        switch (category) {
            case 'academic': return 'bg-blue-100 text-blue-700';
            case 'sports': return 'bg-green-100 text-green-700';
            case 'events': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityIcon = (priority?: Announcement['priority']) => {
        switch (priority) {
            case 'high': return <span className="material-symbols-outlined text-red-500 text-lg">priority_high</span>;
            case 'low': return <span className="material-symbols-outlined text-blue-400 text-lg">low_priority</span>;
            default: return null;
        }
    };

    const handleGradeToggle = (grade: number) => {
        setFormData(prev => ({
            ...prev,
            target_grades: prev.target_grades.includes(grade)
                ? prev.target_grades.filter(g => g !== grade)
                : [...prev.target_grades, grade].sort((a, b) => a - b)
        }));
    };

    const handleSelectAllGrades = () => {
        setFormData(prev => ({
            ...prev,
            target_grades: prev.target_grades.length === GRADES.length ? [] : [...GRADES]
        }));
    };

    const handleCreateAnnouncement = async () => {
        if (!formData.title.trim() || !formData.content.trim()) return;

        setIsSaving(true);

        // Simulate API call (replace with real API later)
        await new Promise(resolve => setTimeout(resolve, 500));

        const newAnnouncement: Announcement = {
            id: Date.now().toString(),
            title: formData.title,
            content: formData.content,
            date: new Date().toISOString().split('T')[0],
            author: teacherName,
            category: formData.category,
            priority: formData.priority,
            target_grades: formData.target_grades.length > 0 ? formData.target_grades : undefined,
        };

        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setShowCreateModal(false);
        setFormData({
            title: '',
            content: '',
            category: 'general',
            priority: 'normal',
            target_grades: [],
        });
        setIsSaving(false);
    };

    return (
        <div className="h-full bg-indigo-900 overflow-y-auto relative animate-in slide-in-from-right duration-300">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

            <div className="p-6 pb-24 md:p-8 space-y-6 relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Announcements</h1>
                        <p className="text-sm text-indigo-200">Latest updates from your school</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isTeacher && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        )}
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Create Button for Teachers */}
                {isTeacher && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:from-indigo-400 hover:to-purple-400 transition-all"
                    >
                        <span className="material-symbols-outlined">campaign</span>
                        Create Announcement
                    </button>
                )}

                {/* Announcements Feed */}
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize ${getCategoryColor(announcement.category)}`}>
                                        {announcement.category}
                                    </span>
                                    {getPriorityIcon(announcement.priority)}
                                    {announcement.target_grades && announcement.target_grades.length > 0 && (
                                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                                            Gr. {announcement.target_grades.join(', ')}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">
                                    {new Date(announcement.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                                {announcement.title}
                            </h3>

                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {announcement.content}
                            </p>

                            <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {announcement.author.charAt(0)}
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                    {announcement.author}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Announcement Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-indigo-600">campaign</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">New Announcement</h2>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="Announcement title"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                        rows={4}
                                        placeholder="Write your announcement..."
                                    />
                                </div>

                                {/* Category & Priority Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Announcement['category'] }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
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
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Target Grades */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700">Target Grades</label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllGrades}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            {formData.target_grades.length === GRADES.length ? 'Clear All' : 'Select All'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">Leave empty to show to all grades</p>
                                    <div className="flex flex-wrap gap-2">
                                        {GRADES.map(grade => (
                                            <button
                                                key={grade}
                                                type="button"
                                                onClick={() => handleGradeToggle(grade)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.target_grades.includes(grade)
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                Grade {grade}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleCreateAnnouncement}
                                    disabled={isSaving || !formData.title.trim() || !formData.content.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
