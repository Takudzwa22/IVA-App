'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AssessmentCycle, SubjectAssessments } from '../../types';

interface UseStudentAssessmentsResult {
    currentCycle: AssessmentCycle | null;
    cycles: AssessmentCycle[];
    subjects: SubjectAssessments[];
    selectedCycle: number | null;
    setSelectedCycle: (cycle: number) => void;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useStudentAssessmentsAPI(
    studentNumber: number | undefined,
    grade: number | string | undefined
): UseStudentAssessmentsResult {
    const [currentCycle, setCurrentCycle] = useState<AssessmentCycle | null>(null);
    const [cycles, setCycles] = useState<AssessmentCycle[]>([]);
    const [subjects, setSubjects] = useState<SubjectAssessments[]>([]);
    const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAssessments = useCallback(async () => {
        if (!studentNumber || !grade) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                studentNumber: studentNumber.toString(),
                grade: grade.toString(),
            });

            if (selectedCycle !== null) {
                params.append('cycle', selectedCycle.toString());
            }

            const response = await fetch(`/api/student/assessments?${params}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to fetch assessments');
                return;
            }

            setCurrentCycle(data.currentCycle);
            setCycles(data.cycles);
            setSubjects(data.subjects);

            // Set selected cycle if not already set
            if (selectedCycle === null && data.currentCycle) {
                setSelectedCycle(data.currentCycle.cycle);
            }
        } catch (err) {
            console.error('[useStudentAssessmentsAPI] Error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [studentNumber, grade, selectedCycle]);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    const handleSetSelectedCycle = useCallback((cycle: number) => {
        setSelectedCycle(cycle);
    }, []);

    return {
        currentCycle,
        cycles,
        subjects,
        selectedCycle,
        setSelectedCycle: handleSetSelectedCycle,
        isLoading,
        error,
        refetch: fetchAssessments,
    };
}
