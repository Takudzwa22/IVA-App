'use client';

import React from 'react';

interface SubjectGradesScreenProps {
  subject: {
    name: string;
    code: string;
    color: string;
    icon: string;
  };
  onBack: () => void;
}

const SubjectGradesScreen: React.FC<SubjectGradesScreenProps> = ({ subject, onBack }) => {
  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white shadow-subtle flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{subject.name}</h1>
          <p className="text-xs text-gray-500 font-medium">{subject.code}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg`}>
          <span className="material-symbols-outlined text-white text-2xl">{subject.icon}</span>
        </div>
      </header>

      {/* Stats Overview - Coming Soon */}
      <div className="glass-card rounded-2xl p-6 mb-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Performance Overview</h2>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-gray-400">--</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Average</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-gray-400">--</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Highest</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-gray-400">--</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Tests</p>
          </div>
        </div>
      </div>

      {/* Assignments List - Empty State */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Recent Assessments</h2>
        <div className="glass-card rounded-2xl p-8 text-center shadow-subtle">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-gray-300">assignment</span>
          </div>
          <p className="text-gray-500 font-medium text-sm">No assessments yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Grades will appear here once recorded
          </p>
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Progress Over Time</h2>
        <div className="glass-card rounded-2xl p-6 shadow-subtle">
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">show_chart</span>
              <p className="text-xs text-gray-400">Chart coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card rounded-2xl p-5 shadow-subtle">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center flex-shrink-0`}>
            <span className="material-symbols-outlined text-white">info</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">Grades for {subject.name}</h3>
            <p className="text-xs text-gray-500">
              Your test scores, assignments, and assessments for this subject will be displayed here once your teachers record them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectGradesScreen;
