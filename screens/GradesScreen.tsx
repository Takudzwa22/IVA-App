'use client';

import React, { useMemo } from 'react';
import { useDevStudent, useStudentTimetable, DEV_MODE } from '../lib/hooks';
import { getSubjectConfig } from '../lib/subjects';

interface SubjectCard {
  name: string;
  code: string;
  color: string;
  icon: string;
}

interface GradesScreenProps {
  onSubjectSelect?: (subject: SubjectCard) => void;
}

const GradesScreen: React.FC<GradesScreenProps> = ({ onSubjectSelect }) => {
  // Get student's subjects from timetable
  const devStudent = useDevStudent();
  const studentNumber = DEV_MODE ? devStudent.selectedStudentNumber : null;
  const { timetable, isLoading } = useStudentTimetable(studentNumber);

  // Extract unique subjects from timetable
  const subjects: SubjectCard[] = useMemo(() => {
    if (!timetable) return [];

    const periodCodes = [
      'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1',
      'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2',
      'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3',
      'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4',
      'A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5',
    ] as const;

    const subjectSet = new Set<string>();

    for (const code of periodCodes) {
      const subject = timetable[code as keyof typeof timetable] as string | null;
      if (subject &&
        subject !== 'Free' &&
        !subject.includes('Cycle Test') &&
        !subject.includes('Assembly') &&
        !subject.includes('All ') &&  // Skip "All X" combined periods
        !subject.endsWith(' All')) {  // Skip "X All" combined periods
        // Normalize subject names
        let normalized = subject;
        if (subject.includes('Further focus')) {
          normalized = subject.replace('Further focus ', '');
        }
        subjectSet.add(normalized);
      }
    }

    return Array.from(subjectSet)
      .sort()
      .map(name => {
        const config = getSubjectConfig(name);
        return {
          name,
          code: name.substring(0, 3).toUpperCase(),
          color: config.gradient,
          icon: config.icon,
        };
      });
  }, [timetable]);

  const handleSubjectClick = (subject: SubjectCard) => {
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center py-4 mb-4">
        <div className="w-8" />
        <h1 className="text-xl font-bold">Grades</h1>
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          <span className="material-symbols-outlined">tune</span>
        </button>
      </header>

      {/* Current Term Display */}
      <div className="my-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Current Period</p>
              <p className="text-white text-lg font-bold">2026 • Term 1</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">calendar_month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4 px-1">My Subjects</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-md animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
                <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-16 h-3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center shadow-subtle">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-300">school</span>
            </div>
            <p className="text-gray-500 font-medium text-sm">No subjects found</p>
            <p className="text-xs text-gray-400 mt-1">
              Your subjects will appear once your timetable is configured
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.name}
                onClick={() => handleSubjectClick(subject)}
                className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-white text-xl">{subject.icon}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">
                  {subject.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium uppercase">
                    View Grades
                  </span>
                  <span className="material-symbols-outlined text-gray-300 text-sm group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Summary Card */}
      <div className="glass-card rounded-2xl p-5 shadow-subtle">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white">info</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">Grades Coming Soon</h3>
            <p className="text-xs text-gray-500">
              Click on any subject to view your grades. The grading system is being configured by your school.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesScreen;
