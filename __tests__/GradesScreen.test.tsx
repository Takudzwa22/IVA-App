/**
 * Tests for GradesScreen component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import GradesScreen from '../screens/GradesScreen';

// Mock the hooks
jest.mock('../lib/hooks', () => ({
    useDevStudent: () => ({
        selectedStudentNumber: 100001,
        isLoading: false,
    }),
    useStudentTimetable: () => ({
        timetable: {
            A1: 'Mathematics',
            B1: 'English',
            C1: 'Science',
            D1: 'Free',
            E1: 'History',
            // All other periods null for simplicity
            A2: null, B2: null, C2: null, D2: null, E2: null, F2: null, G2: null, H2: null, I2: null,
            A3: null, B3: null, C3: null, D3: null, E3: null, F3: null, G3: null, H3: null, I3: null,
            A4: null, B4: null, C4: null, D4: null, E4: null, F4: null, G4: null, H4: null, I4: null,
            A5: null, B5: null, C5: null, D5: null, E5: null, F5: null, G5: null, H5: null, I5: null,
            F1: null, G1: null, H1: null, I1: null,
        },
        isLoading: false,
    }),
    DEV_MODE: true,
}));

describe('GradesScreen', () => {
    it('should render the Grades header', () => {
        render(<GradesScreen />);
        expect(screen.getByText('Grades')).toBeInTheDocument();
    });

    it('should render the current term display', () => {
        render(<GradesScreen />);
        expect(screen.getByText('Current Period')).toBeInTheDocument();
        expect(screen.getByText(/Term 1/)).toBeInTheDocument();
    });

    it('should render My Subjects section', () => {
        render(<GradesScreen />);
        expect(screen.getByText('My Subjects')).toBeInTheDocument();
    });

    it('should render extracted subjects from timetable', () => {
        render(<GradesScreen />);

        // These subjects should be extracted from the mock timetable
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Science')).toBeInTheDocument();
        expect(screen.getByText('History')).toBeInTheDocument();
    });

    it('should not render Free as a subject', () => {
        render(<GradesScreen />);

        // Free should be filtered out
        const subjects = screen.queryAllByText('Free');
        expect(subjects.length).toBe(0);
    });

    it('should render the info card about grades coming soon', () => {
        render(<GradesScreen />);
        expect(screen.getByText('Grades Coming Soon')).toBeInTheDocument();
    });

    it('should show View Grades text for each subject', () => {
        render(<GradesScreen />);

        const viewGradesButtons = screen.getAllByText('View Grades');
        expect(viewGradesButtons.length).toBeGreaterThan(0);
    });
});

describe('GradesScreen with onSubjectSelect', () => {
    it('should call onSubjectSelect when a subject is clicked', async () => {
        const mockOnSelect = jest.fn();

        // Use fireEvent instead of userEvent to avoid dynamic import issues
        const { fireEvent } = await import('@testing-library/react');

        render(<GradesScreen onSubjectSelect={mockOnSelect} />);

        const mathButton = screen.getByText('Mathematics').closest('button');
        if (mathButton) {
            fireEvent.click(mathButton);
            expect(mockOnSelect).toHaveBeenCalled();
            expect(mockOnSelect.mock.calls[0][0]).toMatchObject({
                name: 'Mathematics',
            });
        }
    });
});

