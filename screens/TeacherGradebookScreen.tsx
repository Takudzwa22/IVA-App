'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Teacher, Assessment } from '../types';
import { getSubjectIcon, getSubjectGradient } from '../lib/subjects';

interface TeacherGradebookScreenProps {
    teacher: Teacher | null;
    assessment: Assessment | null;
    onBack: () => void;
}

interface StudentMark {
    student_num: number;
    student_name: string;
    mark_id: string | null;
    mark_obtained: number | null;
    teacher_comments: string | null;
    is_published: boolean;
}

const TeacherGradebookScreen: React.FC<TeacherGradebookScreenProps> = ({
    teacher,
    assessment,
    onBack
}) => {
    const [students, setStudents] = useState<StudentMark[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingStudent, setEditingStudent] = useState<StudentMark | null>(null);
    const [markValue, setMarkValue] = useState<string>('');
    const [commentValue, setCommentValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ uploaded: number; skipped: number[]; errors: string[] } | null>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!assessment?.id) return;
        fetchStudents();
    }, [assessment?.id]);

    const fetchStudents = async () => {
        if (!assessment?.id) return;

        setIsLoading(true);
        try {
            const grade = assessment.grade ?? 10;
            const response = await fetch(`/api/teacher/marks?assessmentId=${assessment.id}&grade=${grade}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch students');
            }

            setStudents(data.students || []);
        } catch (err) {
            console.error('[TeacherGradebook] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load students');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditMark = (student: StudentMark) => {
        setEditingStudent(student);
        setMarkValue(student.mark_obtained?.toString() || '');
        setCommentValue(student.teacher_comments || '');
    };

    const handleSaveMark = async () => {
        if (!editingStudent || !assessment?.id) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/teacher/marks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessment_id: assessment.id,
                    student_num: editingStudent.student_num,
                    mark_obtained: markValue ? parseInt(markValue) : null,
                    teacher_comments: commentValue || null,
                    is_published: editingStudent.is_published
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save mark');
            }

            // Update local state
            setStudents(prev => prev.map(s =>
                s.student_num === editingStudent.student_num
                    ? { ...s, mark_obtained: markValue ? parseInt(markValue) : null, teacher_comments: commentValue || null }
                    : s
            ));

            setEditingStudent(null);
        } catch (err) {
            console.error('[TeacherGradebook] Save error:', err);
            setError('Failed to save mark');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublishAll = async (publish: boolean) => {
        if (!assessment?.id) return;

        setIsPublishing(true);
        try {
            const response = await fetch('/api/teacher/marks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessment_id: assessment.id,
                    is_published: publish
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update publish status');
            }

            // Update local state
            setStudents(prev => prev.map(s => ({ ...s, is_published: publish })));
        } catch (err) {
            console.error('[TeacherGradebook] Publish error:', err);
            setError('Failed to publish marks');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !assessment?.id) return;

        setIsUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('assessment_id', assessment.id);
            formData.append('grade', String(assessment.grade ?? 10));
            formData.append('file', file);

            const response = await fetch('/api/teacher/marks/upload', {
                method: 'POST',
                body: formData,
            });

            console.log('[Upload] Response status:', response.status, response.statusText);
            const text = await response.text();
            console.log('[Upload] Raw response:', text);

            let data;
            try { data = JSON.parse(text); } catch { data = { error: text }; }

            if (!response.ok) {
                setUploadResult({ uploaded: 0, skipped: [], errors: [data.error || `Upload failed: ${response.status} ${response.statusText}`] });
            } else {
                setUploadResult(data);
                await fetchStudents();
            }
        } catch {
            setUploadResult({ uploaded: 0, skipped: [], errors: ['Unexpected error during upload'] });
        } finally {
            setIsUploading(false);
            // Reset file input so same file can be re-uploaded
            if (csvInputRef.current) csvInputRef.current.value = '';
        }
    };

    if (!assessment) {
        return (
            <div className="h-full bg-teal-950 flex items-center justify-center">
                <p className="text-white">No assessment selected</p>
            </div>
        );
    }

    const icon = getSubjectIcon(assessment.subject_name);
    const gradient = getSubjectGradient(assessment.subject_name);
    const allPublished = students.every(s => s.is_published);
    const gradedCount = students.filter(s => s.mark_obtained !== null).length;

    return (
        <div className="h-full bg-teal-950 overflow-y-auto relative">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

            <div className="px-6 py-6 pb-32 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white">{assessment.title}</h1>
                        <p className="text-teal-200 text-sm">{assessment.subject_name} • Grade 10</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        <span className="material-symbols-outlined text-white">{icon}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                        <p className="text-2xl font-bold text-white">{students.length}</p>
                        <p className="text-xs text-teal-200">Students</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                        <p className="text-2xl font-bold text-white">{gradedCount}</p>
                        <p className="text-xs text-teal-200">Graded</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                        <p className="text-2xl font-bold text-white">{assessment.max_marks}</p>
                        <p className="text-xs text-teal-200">Max Marks</p>
                    </div>
                </div>

                {/* CSV Upload */}
                <input
                    ref={csvInputRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    onChange={handleCsvUpload}
                />
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => csvInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50"
                    >
                        {isUploading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">upload_file</span>
                                Upload XLSX
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handlePublishAll(!allPublished)}
                        disabled={isPublishing || gradedCount === 0}
                        className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${allPublished
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                    >
                        {isPublishing ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {allPublished ? 'Unpublishing...' : 'Publishing...'}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">{allPublished ? 'visibility_off' : 'publish'}</span>
                                {allPublished ? 'Unpublish' : 'Publish All'}
                            </>
                        )}
                    </button>
                </div>

                {/* XLSX Upload tip */}
                <p className="text-xs text-teal-300 mb-4 text-center">
                    Excel format: columns <span className="font-mono bg-white/10 px-1 rounded">student_num | mark | comments</span> (header row optional)
                </p>

                {/* Upload result */}
                {uploadResult && (
                    <div className={`rounded-2xl p-4 mb-4 text-sm ${uploadResult.errors.length > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        <p className="font-semibold">{uploadResult.uploaded} mark{uploadResult.uploaded !== 1 ? 's' : ''} uploaded</p>
                        {uploadResult.skipped.length > 0 && (
                            <p className="mt-1 text-xs">Skipped (not in grade): {uploadResult.skipped.join(', ')}</p>
                        )}
                        {uploadResult.errors.map((e, i) => (
                            <p key={i} className="mt-1 text-xs">{e}</p>
                        ))}
                    </div>
                )}

                {/* Students List */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-3 w-20 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600">
                        <span className="material-symbols-outlined text-lg mr-2">error</span>
                        {error}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {students.map((student) => (
                            <button
                                key={student.student_num}
                                onClick={() => handleEditMark(student)}
                                className="w-full bg-white rounded-xl p-3 text-left hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-gray-500">person</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{student.student_name}</p>
                                        <p className="text-xs text-gray-500">#{student.student_num}</p>
                                    </div>
                                    <div className="text-right">
                                        {student.mark_obtained !== null ? (
                                            <div>
                                                <p className="font-bold text-gray-900">
                                                    {student.mark_obtained}/{assessment.max_marks}
                                                </p>
                                                {student.is_published && (
                                                    <span className="text-xs text-green-600 flex items-center justify-end gap-0.5">
                                                        <span className="material-symbols-outlined text-xs">check_circle</span>
                                                        Published
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Not graded</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Mark Modal */}
            {editingStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{editingStudent.student_name}</h2>
                                    <p className="text-sm text-gray-500">#{editingStudent.student_num}</p>
                                </div>
                                <button
                                    onClick={() => setEditingStudent(null)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mark (out of {assessment.max_marks})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={assessment.max_marks || 100}
                                        value={markValue}
                                        onChange={(e) => setMarkValue(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-2xl font-bold text-center"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comment (optional)
                                    </label>
                                    <textarea
                                        value={commentValue}
                                        onChange={(e) => setCommentValue(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                        rows={3}
                                        placeholder="Add feedback for this student..."
                                    />
                                </div>

                                <button
                                    onClick={handleSaveMark}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:from-teal-500 hover:to-emerald-500 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">save</span>
                                            Save Mark
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

export default TeacherGradebookScreen;
