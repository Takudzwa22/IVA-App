'use client';

import React, { useState } from 'react';
import type { Student, AssessmentCycle, SubjectAssessments, AssessmentWithMark } from '../types';
import { useStudentAssessmentsAPI } from '../lib/hooks';

// Marks Detail Modal Component
const MarksDetailModal: React.FC<{
    assessment: (AssessmentWithMark & { subjectName: string }) | null;
    onClose: () => void;
}> = ({ assessment, onClose }) => {
    if (!assessment) return null;

    const mark = assessment.mark;
    const maxMarks = assessment.max_marks || 0;
    const obtained = mark?.obtained ?? null;
    const percentage = obtained !== null && maxMarks > 0 ? (obtained / maxMarks) * 100 : null;

    // Determine color based on percentage
    const getGradeColor = () => {
        if (percentage === null) return 'gray';
        if (percentage >= 80) return 'green';
        if (percentage >= 60) return 'blue';
        if (percentage >= 50) return 'yellow';
        return 'red';
    };

    const gradeColors: Record<string, { bg: string; text: string; ring: string }> = {
        green: { bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', ring: 'ring-yellow-200' },
        red: { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200' },
        gray: { bg: 'bg-gray-100', text: 'text-gray-500', ring: 'ring-gray-200' },
    };

    const color = gradeColors[getGradeColor()];

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${assessment.is_test ? 'bg-orange-100' : 'bg-blue-100'
                                }`}>
                                <span className={`material-symbols-outlined text-2xl ${assessment.is_test ? 'text-orange-600' : 'text-blue-600'
                                    }`}>
                                    {assessment.is_test ? 'quiz' : 'assignment'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{assessment.title}</h2>
                                <p className="text-sm text-gray-500">{assessment.subjectName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-400">close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Mark Display - Large */}
                    <div className="text-center mb-8">
                        {mark?.isPublished && percentage !== null ? (
                            <>
                                <div className={`inline-flex w-32 h-32 rounded-full ${color.bg} ${color.ring} ring-8 items-center justify-center mb-4`}>
                                    <span className={`text-4xl font-bold ${color.text}`}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-gray-600 font-medium">
                                    {obtained} / {maxMarks} marks
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex w-32 h-32 rounded-full bg-gray-100 ring-8 ring-gray-50 items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-5xl text-gray-400">pending</span>
                                </div>
                                <p className="text-gray-500 font-medium">Mark Not Yet Published</p>
                            </>
                        )}
                    </div>

                    {/* Assessment Details */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Type</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {assessment.is_test ? 'Test' : 'Assignment'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Due Date</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(assessment.due_date).toLocaleDateString('en-ZA', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Max Marks</p>
                                    <p className="text-sm font-semibold text-gray-900">{maxMarks}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Weighting</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {assessment.weighting !== null
                                            ? `${(assessment.weighting > 1 ? assessment.weighting : assessment.weighting * 100).toFixed(0)}%`
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Teacher Comments */}
                        {mark?.isPublished && mark.comments && (
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-blue-600">comment</span>
                                    <p className="text-xs text-blue-600 uppercase font-medium">Teacher's Comment</p>
                                </div>
                                <p className="text-sm text-gray-700">{mark.comments}</p>
                            </div>
                        )}

                        {/* Status Badge */}
                        <div className={`rounded-2xl p-4 flex items-center gap-3 ${mark?.isPublished ? 'bg-green-50' : 'bg-amber-50'
                            }`}>
                            <span className={`material-symbols-outlined ${mark?.isPublished ? 'text-green-600' : 'text-amber-500'
                                }`}>
                                {mark?.isPublished ? 'check_circle' : 'schedule'}
                            </span>
                            <div>
                                <p className={`text-sm font-medium ${mark?.isPublished ? 'text-green-700' : 'text-amber-700'
                                    }`}>
                                    {mark?.isPublished ? 'Mark Published' : 'Awaiting Grading'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {mark?.isPublished
                                        ? 'Your teacher has graded this assessment'
                                        : 'Check back later for your results'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface AssessmentsScreenProps {
    student: Student | null;
    onAssessmentSelect?: (assessment: AssessmentWithMark & { subjectName: string }) => void;
}

const MiniCalendar: React.FC<{
    cycles: AssessmentCycle[];
    currentCycle: AssessmentCycle | null;
    assessments: AssessmentWithMark[];
    onDateSelect: (date: string | null) => void;
    selectedDate: string | null;
}> = ({ currentCycle, assessments, onDateSelect, selectedDate }) => {
    const [viewDate, setViewDate] = useState(new Date());

    // Reset view to cycle start when cycle changes
    React.useEffect(() => {
        if (currentCycle) {
            setViewDate(new Date(currentCycle.start_date));
        }
    }, [currentCycle]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const today = new Date();

    // Assessments map for dots
    const assessmentsByDate = React.useMemo(() => {
        const map = new Map<string, number>(); // date -> count
        assessments.forEach(a => {
            const date = a.due_date.split('T')[0];
            map.set(date, (map.get(date) || 0) + 1);
        });
        return map;
    }, [assessments]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isToday = (day: number) => {
        return today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear();
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return selectedDate === dateStr;
    };

    // Generate calendar grid
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const count = assessmentsByDate.get(dateStr);

        days.push(
            <button
                key={d}
                onClick={() => onDateSelect(selectedDate === dateStr ? null : dateStr)}
                className={`h-8 w-8 rounded-full flex flex-col items-center justify-center relative text-xs font-medium transition-all ${isSelected(d)
                    ? 'bg-primary text-white shadow-md'
                    : isToday(d)
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                <span>{d}</span>
                {count && !isSelected(d) && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-400" />
                )}
            </button>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-[10px] font-bold text-gray-400 uppercase">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {days}
            </div>

            {/* Legend / Status */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 justify-center border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>Assessment Due</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                    <span>Today</span>
                </div>
            </div>

            {/* View All / Clear Filter */}
            {selectedDate && (
                <button
                    onClick={() => onDateSelect(null)}
                    className="mt-3 w-full py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                    <span className="material-symbols-outlined text-base">calendar_view_month</span>
                    View All Assessments
                </button>
            )}
        </div>
    );
};

const AssessmentsScreen: React.FC<AssessmentsScreenProps> = ({ student, onAssessmentSelect }) => {
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const {
        currentCycle,
        cycles,
        subjects,
        selectedCycle,
        setSelectedCycle,
        isLoading,
        error
    } = useStudentAssessmentsAPI(
        student?.student_number,
        student?.grade
    );

    const toggleSubject = (subjectName: string) => {
        setExpandedSubject(expandedSubject === subjectName ? null : subjectName);
    };

    // Flatten assessments for calendar
    const allAssessments = React.useMemo(() => {
        return subjects.flatMap(s => s.assessments);
    }, [subjects]);

    // Filter subjects based on selected date
    const filteredSubjects = React.useMemo(() => {
        if (!selectedDate) return subjects;

        return subjects.map(s => ({
            ...s,
            assessments: s.assessments.filter(a => a.due_date.startsWith(selectedDate))
        })).filter(s => s.assessments.length > 0);
    }, [subjects, selectedDate]);

    // Calculate percentage for a mark
    const getPercentage = (mark: AssessmentWithMark['mark'], maxMarks: number | null): string => {
        if (!mark || mark.obtained === null || !maxMarks || maxMarks === 0) return '--%';
        const pct = (mark.obtained / maxMarks) * 100;
        return `${pct.toFixed(0)}%`;
    };

    // Get color based on percentage
    const getMarkColor = (mark: AssessmentWithMark['mark'], maxMarks: number | null): string => {
        if (!mark || mark.obtained === null || !maxMarks) return 'text-gray-400';
        const pct = (mark.obtained / maxMarks) * 100;
        if (pct >= 80) return 'text-green-600';
        if (pct >= 60) return 'text-blue-600';
        if (pct >= 50) return 'text-yellow-600';
        return 'text-red-500';
    };

    // Count assessments with published marks for a subject
    const getSubjectStats = (subjectAssessments: SubjectAssessments) => {
        const total = subjectAssessments.assessments.length;
        const published = subjectAssessments.assessments.filter(a => a.mark?.isPublished).length;
        const avgPct = subjectAssessments.assessments.reduce((sum, a) => {
            if (a.mark?.isPublished && a.mark.obtained !== null && a.max_marks) {
                return sum + (a.mark.obtained / a.max_marks) * 100;
            }
            return sum;
        }, 0) / (published || 1);
        return { total, published, avgPct: published > 0 ? avgPct.toFixed(0) : null };
    };

    // Helper to format weighting
    const formatWeighting = (weighting: number | null) => {
        if (weighting === null) return null;
        // If weighting is > 1, assume it's already a percentage (e.g. 25)
        // If it's <= 1, assume it's a decimal (e.g. 0.25)
        const val = weighting > 1 ? weighting : weighting * 100;
        return `${val.toFixed(0)}%`;
    };

    if (!student) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-500 py-12">
                    Please sign in to view your assessments
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-indigo-900 overflow-hidden">
            {/* Dark Header */}
            <div className="pt-8 px-6 pb-6 shrink-0 relative z-0">
                {/* Background Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <header className="flex items-center justify-between mb-2 relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Grades</h1>
                        <p className="text-sm text-indigo-200">
                            {currentCycle ? `Cycle ${currentCycle.cycle} In Progress` : 'Viewing Grades'}
                        </p>
                    </div>

                    {/* Cycle Selector - Glassmorphic */}
                    {cycles.length > 0 && (
                        <div className="relative">
                            <select
                                value={selectedCycle || ''}
                                onChange={(e) => setSelectedCycle(parseInt(e.target.value, 10))}
                                className="appearance-none bg-white/10 border border-white/20 rounded-xl pl-4 pr-10 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-md"
                            >
                                {cycles.map((c) => (
                                    <option key={c.id} value={c.cycle} className="text-gray-900 bg-white">
                                        Cycle {c.cycle}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none text-xl">
                                keyboard_arrow_down
                            </span>
                        </div>
                    )}
                </header>
            </div>

            {/* Content Sheet */}
            <div className="flex-1 bg-gray-50 rounded-t-[2.5rem] overflow-hidden flex flex-col relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] animate-slide-up">
                <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-6">

                    {/* Loading State */}
                    {isLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 shadow-subtle animate-pulse border border-gray-100">
                                    <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 w-24 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    {/* Calendar View */}
                    {!isLoading && !error && (
                        <div className="relative">
                            <MiniCalendar
                                cycles={cycles}
                                currentCycle={currentCycle}
                                assessments={allAssessments}
                                onDateSelect={setSelectedDate}
                                selectedDate={selectedDate}
                            />
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && filteredSubjects.length === 0 && (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">
                                assignment
                            </span>
                            <p className="text-gray-500">
                                {selectedDate
                                    ? 'No assessments due on this date'
                                    : 'No assessments found for this cycle'}
                            </p>
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="mt-4 text-primary font-medium text-sm hover:underline"
                                >
                                    View all assessments
                                </button>
                            )}
                        </div>
                    )}

                    {/* Subject List */}
                    {!isLoading && !error && filteredSubjects.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 px-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Subject Breakdown
                            </h2>

                            {filteredSubjects.map((subject) => {
                                const stats = getSubjectStats(subject);
                                const isExpanded = expandedSubject === subject.subjectName || !!selectedDate;

                                return (
                                    <div key={subject.subjectId} className="bg-white rounded-2xl shadow-subtle overflow-hidden border border-gray-100">
                                        {/* Subject Header - Clickable */}
                                        <button
                                            onClick={() => toggleSubject(subject.subjectName)}
                                            className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary">
                                                        menu_book
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900">
                                                        {subject.subjectName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        {stats.published}/{stats.total} graded
                                                        {stats.avgPct && ` • ${stats.avgPct}% avg`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`material-symbols-outlined text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>

                                        {/* Expanded Assessments */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 px-5 pb-5 bg-gray-50/50">
                                                {subject.assessments.length === 0 ? (
                                                    <p className="text-gray-400 text-sm py-4 text-center">
                                                        No assessments yet
                                                    </p>
                                                ) : (
                                                    <div className="divide-y divide-gray-100">
                                                        {subject.assessments.map((assessment) => (
                                                            <div
                                                                key={assessment.id}
                                                                onClick={() => onAssessmentSelect?.({ ...assessment, subjectName: subject.subjectName })}
                                                                className="py-4 flex items-center justify-between cursor-pointer hover:bg-white p-2 rounded-xl transition-all duration-200 group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${assessment.is_test ? 'bg-orange-100' : 'bg-blue-100'
                                                                        }`}>
                                                                        <span className={`material-symbols-outlined ${assessment.is_test ? 'text-orange-600' : 'text-blue-600'
                                                                            }`}>
                                                                            {assessment.is_test ? 'quiz' : 'assignment'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                                            {assessment.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            Due: {new Date(assessment.due_date).toLocaleDateString('en-ZA', {
                                                                                day: 'numeric',
                                                                                month: 'short',
                                                                            })}
                                                                            {assessment.weighting !== null && ` • ${formatWeighting(assessment.weighting)}`}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Mark Display */}
                                                                <div className="text-right">
                                                                    {assessment.mark?.isPublished ? (
                                                                        <>
                                                                            <p className={`text-sm font-bold ${getMarkColor(assessment.mark, assessment.max_marks)}`}>
                                                                                {getPercentage(assessment.mark, assessment.max_marks)}
                                                                            </p>
                                                                            <p className="text-[10px] text-gray-400 font-medium">
                                                                                {assessment.mark.obtained}/{assessment.max_marks}
                                                                            </p>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1 text-gray-400">
                                                                            <span className="material-symbols-outlined text-sm">pending</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentsScreen;
