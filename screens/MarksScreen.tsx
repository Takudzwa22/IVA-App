'use client';

import React from 'react';
import type { AssessmentWithMark } from '../types';

interface MarksScreenProps {
    assessment: (AssessmentWithMark & { subjectName: string }) | null;
    onBack: () => void;
}

const MarksScreen: React.FC<MarksScreenProps> = ({ assessment, onBack }) => {
    if (!assessment) {
        return (
            <div className="p-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Assessments
                </button>
                <div className="text-center py-12 text-gray-500">
                    No assessment selected
                </div>
            </div>
        );
    }

    const mark = assessment.mark;
    const maxMarks = assessment.max_marks || 0;
    const obtained = mark?.obtained ?? null;
    const percentage = obtained !== null && maxMarks > 0 ? (obtained / maxMarks) * 100 : null;

    // Extract teacher name from email
    const getTeacherName = (email: string | null): string => {
        if (!email) return 'Not assigned';
        // Extract name part before @ and format it
        const namePart = email.split('@')[0];
        // Convert "john.doe" or "johndoe" to "John Doe" or "Johndoe"
        return namePart
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    };

    // Determine color based on percentage
    const getGradeColor = () => {
        if (percentage === null) return 'gray';
        if (percentage >= 80) return 'green';
        if (percentage >= 60) return 'blue';
        if (percentage >= 50) return 'yellow';
        return 'red';
    };

    const gradeColors: Record<string, { bg: string; text: string; ring: string; gradient: string }> = {
        green: { bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200', gradient: 'from-green-400 to-emerald-500' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200', gradient: 'from-blue-400 to-cyan-500' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', ring: 'ring-yellow-200', gradient: 'from-yellow-400 to-orange-500' },
        red: { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200', gradient: 'from-red-400 to-pink-500' },
        gray: { bg: 'bg-gray-100', text: 'text-gray-500', ring: 'ring-gray-200', gradient: 'from-gray-400 to-gray-500' },
    };

    const color = gradeColors[getGradeColor()];

    return (
        <div className="h-full bg-indigo-900 overflow-y-auto relative">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

            <div className="p-6 pb-24 max-w-2xl mx-auto relative z-10">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-indigo-200 hover:text-white mb-6 transition-colors group"
                >
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-sm font-bold">Back to Assessments</span>
                </button>

                {/* Notification Banner - Only show when not published */}
                {!mark?.isPublished && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 flex items-center gap-3 border border-white/20">
                        <div className="w-10 h-10 rounded-full bg-indigo-400/30 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white">notifications_active</span>
                        </div>
                        <p className="text-white/90 text-sm font-medium">
                            You will be notified when your grades are released.
                        </p>
                    </div>
                )}

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 shadow-card mb-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${assessment.is_test ? 'bg-orange-100' : 'bg-blue-100'
                            }`}>
                            <span className={`material-symbols-outlined text-3xl ${assessment.is_test ? 'text-orange-600' : 'text-blue-600'
                                }`}>
                                {assessment.is_test ? 'quiz' : 'assignment'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${assessment.is_test
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-blue-100 text-blue-600'
                                }`}>
                                {assessment.is_test ? 'Test' : 'Assignment'}
                            </span>
                            <h1 className="text-xl font-semibold text-gray-900">{assessment.title}</h1>
                            <p className="text-sm text-gray-500">{assessment.subjectName}</p>
                        </div>
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                            {getTeacherName(assessment.teacher_email).charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Teacher</p>
                            <p className="text-sm font-semibold text-gray-900">{getTeacherName(assessment.teacher_email)}</p>
                        </div>
                    </div>
                </div>

                {/* Mark Display - Large */}
                <div className="bg-white rounded-3xl p-8 shadow-card mb-6 text-center">
                    {mark?.isPublished && percentage !== null ? (
                        <>
                            <div className={`inline-flex w-36 h-36 rounded-full ${color.bg} ${color.ring} ring-8 items-center justify-center mb-4`}>
                                <span className={`text-5xl font-bold ${color.text}`}>
                                    {percentage.toFixed(0)}%
                                </span>
                            </div>
                            <p className="text-gray-600 font-medium text-lg">
                                {obtained} / {maxMarks} marks
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {percentage >= 80 ? 'Outstanding!' :
                                    percentage >= 60 ? 'Good job!' :
                                        percentage >= 50 ? 'Keep improving!' : 'Talk to your teacher'}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex w-36 h-36 rounded-full bg-gray-100 ring-8 ring-gray-50 items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-6xl text-gray-400">pending</span>
                            </div>
                            <p className="text-gray-600 font-medium text-lg">Not Yet Graded</p>
                            <p className="text-sm text-gray-400 mt-1">Check back later for your results</p>
                        </>
                    )}
                </div>

                {/* Assessment Details */}
                <div className="bg-white rounded-3xl p-6 shadow-card mb-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Due Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {new Date(assessment.due_date).toLocaleDateString('en-ZA', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Max Marks</p>
                            <p className="text-sm font-semibold text-gray-900">{maxMarks}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Weighting</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {assessment.weighting !== null
                                    ? `${(assessment.weighting > 1 ? assessment.weighting : assessment.weighting * 100).toFixed(0)}%`
                                    : '-'
                                }
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Cycle</p>
                            <p className="text-sm font-semibold text-gray-900">Cycle {assessment.cycle}</p>
                        </div>
                    </div>
                </div>

                {/* Teacher Comments */}
                <div className="bg-blue-50 rounded-3xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-blue-600">comment</span>
                        <h2 className="text-base font-semibold text-blue-900">Teacher's Comment</h2>
                    </div>
                    {mark?.comments ? (
                        <p className="text-gray-700 leading-relaxed">{mark.comments}</p>
                    ) : (
                        <p className="text-gray-400 italic">No comments from your teacher yet.</p>
                    )}
                </div>

                {/* Status Badge - Only show when published */}
                {mark?.isPublished && (
                    <div className="rounded-3xl p-5 flex items-center gap-4 mb-6 bg-green-50">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                            <span className="material-symbols-outlined text-2xl text-green-600">
                                check_circle
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-green-700">
                                Mark Published
                            </p>
                            <p className="text-sm text-gray-500">
                                Your teacher has graded this assessment
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Upload Feature (Placeholder) */}
                {!assessment.is_test && (
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg border border-white/10">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-3xl">smart_toy</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">AI Assignment Helper</h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Upload your assignment PDF for AI-powered feedback and tips to improve.
                                </p>
                                <button
                                    disabled
                                    className="w-full py-3 bg-white/20 rounded-xl font-semibold flex items-center justify-center gap-2 opacity-75 cursor-not-allowed hover:bg-white/30 transition-colors"
                                >
                                    <span className="material-symbols-outlined">upload_file</span>
                                    Coming Soon
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarksScreen;
