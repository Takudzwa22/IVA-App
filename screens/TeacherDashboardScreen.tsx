'use client';

import React, { useState, useEffect } from 'react';
import type { Teacher, Assessment } from '../types';
import { getSubjectIcon, getSubjectGradient } from '../lib/subjects';

interface TeacherDashboardScreenProps {
    teacher: Teacher | null;
    onSubjectSelect: (subjectName: string) => void;
}

interface TeacherSubject {
    subject_name: string;
}

const TeacherDashboardScreen: React.FC<TeacherDashboardScreenProps> = ({
    teacher,
    onSubjectSelect
}) => {
    const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!teacher?.Email) return;

        const fetchData = async () => {
            try {
                // Fetch subjects
                const subjectsRes = await fetch(`/api/teacher/subjects?email=${encodeURIComponent(teacher.Email)}`);
                const subjectsData = await subjectsRes.json();

                if (!subjectsRes.ok) {
                    throw new Error(subjectsData.error || 'Failed to fetch subjects');
                }

                setSubjects(subjectsData.subjects || []);

                // Fetch assessments
                const assessmentsRes = await fetch(`/api/teacher/assessments?email=${encodeURIComponent(teacher.Email)}`);
                const assessmentsData = await assessmentsRes.json();

                if (assessmentsRes.ok) {
                    setAssessments(assessmentsData.assessments || []);
                }
            } catch (err) {
                console.error('[TeacherDashboard] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [teacher?.Email]);

    const teacherName = teacher?.Name || teacher?.['Full name']?.split(' ')[0] || 'Teacher';

    // Get upcoming assessments (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingAssessments = assessments
        .filter(a => {
            const dueDate = new Date(a.due_date);
            return dueDate >= today && dueDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);

    return (
        <div className="h-full bg-indigo-900 overflow-y-auto relative">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

            <div className="px-6 py-8 pb-32 relative z-10">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back,</p>
                    <h1 className="text-3xl font-bold text-white">{teacherName}</h1>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                        <p className="text-2xl font-bold text-white">{subjects.length}</p>
                        <p className="text-indigo-200 text-xs">Subjects</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                        <p className="text-2xl font-bold text-white">{assessments.length}</p>
                        <p className="text-indigo-200 text-xs">Assessments</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                        <p className="text-2xl font-bold text-white">{upcomingAssessments.length}</p>
                        <p className="text-indigo-200 text-xs">Due Soon</p>
                    </div>
                </div>

                {/* Upcoming Assessments Section */}
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        Upcoming Assessments
                    </h2>

                    <div className="bg-white rounded-3xl p-4 shadow-lg">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                                        <div className="flex-1">
                                            <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                                            <div className="h-3 w-20 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : upcomingAssessments.length === 0 ? (
                            <div className="text-center py-6">
                                <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">event_available</span>
                                <p className="text-gray-500 text-sm">No assessments due in the next 7 days</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAssessments.map((assessment) => {
                                    const dueDate = new Date(assessment.due_date);
                                    const isToday = dueDate.toDateString() === today.toDateString();
                                    const isTomorrow = dueDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
                                    const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dueDate.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });

                                    return (
                                        <div
                                            key={assessment.id}
                                            onClick={() => onSubjectSelect(assessment.subject_name)}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${assessment.is_test ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                                <span className={`material-symbols-outlined ${assessment.is_test ? 'text-orange-600' : 'text-blue-600'}`}>
                                                    {assessment.is_test ? 'quiz' : 'assignment'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{assessment.title}</p>
                                                <p className="text-xs text-gray-500">{assessment.subject_name}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-xs font-medium ${isToday ? 'text-red-600' : isTomorrow ? 'text-orange-600' : 'text-gray-600'}`}>
                                                    {dateLabel}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Subjects Section */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Your Subjects
                    </h2>

                    {isLoading ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-xl bg-gray-200 mb-3"></div>
                                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600">
                            <span className="material-symbols-outlined text-lg mr-2">error</span>
                            {error}
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-gray-400">school</span>
                            </div>
                            <p className="text-gray-900 font-medium">No subjects found</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Create assessments to see your subjects here
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {subjects.map((subject) => {
                                const icon = getSubjectIcon(subject.subject_name);
                                const gradient = getSubjectGradient(subject.subject_name);
                                const subjectAssessments = assessments.filter(a => a.subject_name === subject.subject_name);

                                return (
                                    <button
                                        key={subject.subject_name}
                                        onClick={() => onSubjectSelect(subject.subject_name)}
                                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left group"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md mb-3`}>
                                            <span className="material-symbols-outlined text-white text-lg">{icon}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                                            {subject.subject_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {subjectAssessments.length} assessment{subjectAssessments.length !== 1 ? 's' : ''}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default TeacherDashboardScreen;
