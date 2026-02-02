'use client';

import React, { useState, useEffect } from 'react';
import type { Teacher, Assessment } from '../types';
import { getSubjectIcon, getSubjectGradient } from '../lib/subjects';

interface TeacherAssessmentsScreenProps {
    teacher: Teacher | null;
    selectedSubject: string | null;
    onBack: () => void;
    onGradeAssessment: (assessment: Assessment) => void;
}

interface AssessmentFormData {
    id?: string;
    subject_name: string;
    title: string;
    due_date: string;
    max_marks: number | null;
    weighting: number | null;
    is_test: boolean;
    cycle: number;
}

const TeacherAssessmentsScreen: React.FC<TeacherAssessmentsScreenProps> = ({
    teacher,
    selectedSubject,
    onBack,
    onGradeAssessment
}) => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<AssessmentFormData>({
        subject_name: selectedSubject || '',
        title: '',
        due_date: new Date().toISOString().split('T')[0],
        max_marks: 100,
        weighting: 0.25,
        is_test: false,
        cycle: 1
    });

    useEffect(() => {
        if (!teacher?.Email) return;
        fetchAssessments();
    }, [teacher?.Email, selectedSubject]);

    const fetchAssessments = async () => {
        if (!teacher?.Email) return;

        setIsLoading(true);
        try {
            let url = `/api/teacher/assessments?email=${encodeURIComponent(teacher.Email)}`;
            if (selectedSubject) {
                url += `&subject=${encodeURIComponent(selectedSubject)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch assessments');
            }

            setAssessments(data.assessments || []);
        } catch (err) {
            console.error('[TeacherAssessments] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load assessments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingAssessment(null);
        setFormData({
            subject_name: selectedSubject || '',
            title: '',
            due_date: new Date().toISOString().split('T')[0],
            max_marks: 100,
            weighting: 0.25,
            is_test: false,
            cycle: 1
        });
        setShowModal(true);
    };

    const handleEdit = (assessment: Assessment) => {
        setEditingAssessment(assessment);
        setFormData({
            id: assessment.id,
            subject_name: assessment.subject_name,
            title: assessment.title,
            due_date: assessment.due_date,
            max_marks: assessment.max_marks,
            weighting: assessment.weighting,
            is_test: assessment.is_test,
            cycle: assessment.cycle
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/teacher/assessments?id=${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete assessment');
            }

            setAssessments(prev => prev.filter(a => a.id !== id));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('[TeacherAssessments] Delete error:', err);
            setError('Failed to delete assessment');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                ...formData,
                teacher_email: teacher?.Email
            };

            const method = editingAssessment ? 'PUT' : 'POST';
            const response = await fetch('/api/teacher/assessments', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save assessment');
            }

            await fetchAssessments();
            setShowModal(false);
        } catch (err) {
            console.error('[TeacherAssessments] Save error:', err);
            setError(err instanceof Error ? err.message : 'Failed to save assessment');
        } finally {
            setIsSaving(false);
        }
    };

    const icon = selectedSubject ? getSubjectIcon(selectedSubject) : 'assignment';
    const gradient = selectedSubject ? getSubjectGradient(selectedSubject) : 'from-indigo-500 to-purple-500';

    return (
        <div className="h-full bg-indigo-900 overflow-y-auto relative">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

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
                        <h1 className="text-2xl font-bold text-white">{selectedSubject || 'All Assessments'}</h1>
                        <p className="text-indigo-200 text-sm">Grade 10</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        <span className="material-symbols-outlined text-white">{icon}</span>
                    </div>
                </div>

                {/* Add Button */}
                <button
                    onClick={handleCreate}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-2xl mb-6 flex items-center justify-center gap-2 shadow-lg hover:from-indigo-400 hover:to-purple-400 transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add New Assessment
                </button>

                {/* Assessments List */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-32 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600">
                        <span className="material-symbols-outlined text-lg mr-2">error</span>
                        {error}
                    </div>
                ) : assessments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-gray-400">assignment</span>
                        </div>
                        <p className="text-gray-900 font-medium">No assessments yet</p>
                        <p className="text-sm text-gray-500 mt-1">Create your first assessment above</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assessments.map((assessment) => (
                            <div key={assessment.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${assessment.is_test ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                        <span className={`material-symbols-outlined ${assessment.is_test ? 'text-orange-600' : 'text-blue-600'}`}>
                                            {assessment.is_test ? 'quiz' : 'assignment'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900">{assessment.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            Due: {new Date(assessment.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                {assessment.max_marks} marks
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                Cycle {assessment.cycle}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => onGradeAssessment(assessment)}
                                        className="flex-1 py-2 px-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1 hover:bg-green-100 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">grading</span>
                                        Grade
                                    </button>
                                    <button
                                        onClick={() => handleEdit(assessment)}
                                        className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(assessment.id)}
                                        className="py-2 px-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center justify-center hover:bg-red-100 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingAssessment ? 'Edit Assessment' : 'New Assessment'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="e.g., Test 1 - Algebra"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={formData.subject_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject_name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="e.g., Mathematics"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                                        <input
                                            type="number"
                                            value={formData.max_marks || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, max_marks: e.target.value ? parseInt(e.target.value) : null }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Weighting</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={formData.weighting || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, weighting: e.target.value ? parseFloat(e.target.value) : null }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="0.25"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
                                    <select
                                        value={formData.cycle}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cycle: parseInt(e.target.value) }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                        <option value={1}>Cycle 1</option>
                                        <option value={2}>Cycle 2</option>
                                        <option value={3}>Cycle 3</option>
                                        <option value={4}>Cycle 4</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="checkbox"
                                        id="is_test"
                                        checked={formData.is_test}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_test: e.target.checked }))}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_test" className="text-sm font-medium text-gray-700">
                                        This is a test/exam
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">save</span>
                                            {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-red-600">delete_forever</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Assessment?</h3>
                        <p className="text-gray-500 mb-6">
                            This will also delete all student marks for this assessment. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAssessmentsScreen;
