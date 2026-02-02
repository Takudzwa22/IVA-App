'use client';

import React, { useState, useMemo } from 'react';
import { useStudentTimetableAPI, useStudentAttendanceAPI } from '../lib/hooks';
import type { Student } from '../types';
import type { DetailedScheduleItem } from '../lib/hooks/useTimetableAPI';

interface ScheduleScreenProps {
  student: Student | null;
  onSubjectSelect?: (subject: { name: string; code: string; color: string; icon: string }) => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

// Get subject color style based on subject name
function getSubjectStyle(subject: string | undefined) {
  if (!subject || subject === 'Free') return { bg: 'bg-gray-100', text: 'text-gray-500', icon: 'pause', iconBg: 'bg-gray-200', iconColor: 'text-gray-500' };

  const s = subject.toLowerCase();
  if (s.includes('math')) return { bg: 'bg-indigo-500', text: 'text-white', icon: 'calculate', iconBg: 'bg-white', iconColor: 'text-indigo-600' };
  if (s.includes('english') || s.includes('literacy')) return { bg: 'bg-orange-400', text: 'text-white', icon: 'book', iconBg: 'bg-white', iconColor: 'text-orange-500' };
  if (s.includes('science') || s.includes('physics') || s.includes('biology')) return { bg: 'bg-purple-500', text: 'text-white', icon: 'science', iconBg: 'bg-white', iconColor: 'text-purple-600' };
  if (s.includes('history') || s.includes('geo')) return { bg: 'bg-emerald-500', text: 'text-white', icon: 'public', iconBg: 'bg-white', iconColor: 'text-emerald-600' };
  if (s.includes('art') || s.includes('design')) return { bg: 'bg-pink-500', text: 'text-white', icon: 'palette', iconBg: 'bg-white', iconColor: 'text-pink-600' };
  if (s.includes('lo') || s.includes('life')) return { bg: 'bg-cyan-500', text: 'text-white', icon: 'self_improvement', iconBg: 'bg-white', iconColor: 'text-cyan-600' };
  if (s.includes('computer') || s.includes('cat') || s.includes('it')) return { bg: 'bg-slate-700', text: 'text-white', icon: 'computer', iconBg: 'bg-white', iconColor: 'text-slate-800' };
  if (s.includes('business')) return { bg: 'bg-amber-500', text: 'text-white', icon: 'bar_chart', iconBg: 'bg-white', iconColor: 'text-amber-600' };

  return { bg: 'bg-blue-500', text: 'text-white', icon: 'school', iconBg: 'bg-white', iconColor: 'text-blue-600' };
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ student, onSubjectSelect }) => {
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    // If weekend, show Monday (0)
    return today === 0 || today === 6 ? 0 : today - 1;
  });
  const [showAttendance, setShowAttendance] = useState(false);

  // Use student from props (passed from login)
  const studentNumber = student?.student_number ?? null;
  const studentGrade = student?.grade;

  // Fetch timetable data from API
  const { timetable, isLoading } = useStudentTimetableAPI(studentNumber, studentGrade);

  // Fetch attendance data from API
  const { records: attendanceRecords, summary: attendanceSummary, isLoading: attendanceLoading } = useStudentAttendanceAPI(studentNumber);

  // Get schedule for selected day
  const daySchedule = useMemo((): DetailedScheduleItem[] => {
    if (!timetable) return [];
    if (timetable.type === 'detailed') {
      return timetable.schedule[WEEKDAYS[selectedDay]] || [];
    } else {
      return timetable.subjects.map((subject, idx) => ({
        period_number: idx + 1,
        subject,
        start_time: `0${8 + idx}:00`, // Fake times for simple view
        end_time: `0${9 + idx}:00`,
        code: '',
      }));
    }
  }, [timetable, selectedDay]);

  // Handle spare time calculation
  const scheduleWithBreaks = useMemo(() => {
    const result: (DetailedScheduleItem | { type: 'break', start: string, end: string })[] = [];

    // Sort logic here if needed (assuming sorted)

    for (let i = 0; i < daySchedule.length; i++) {
      const current = daySchedule[i];
      result.push(current);

      // Check for gap before next period
      if (i < daySchedule.length - 1) {
        const next = daySchedule[i + 1];
        if (current.end_time < next.start_time) {
          result.push({
            type: 'break',
            start: current.end_time,
            end: next.start_time
          });
        }
      }
    }
    return result;
  }, [daySchedule]);

  const changeDay = (weekdayIndex: number) => {
    if (weekdayIndex >= 0 && weekdayIndex <= 4) {
      setSelectedDay(weekdayIndex);
    }
  };

  const handlePrevDay = () => setSelectedDay(prev => (prev > 0 ? prev - 1 : 4));
  const handleNextDay = () => setSelectedDay(prev => (prev < 4 ? prev + 1 : 0));

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentDayNum = new Date().getDate(); // Simplified: assuming today is relevant for UI display context

  return (
    <div className="flex flex-col h-full bg-indigo-900 overflow-hidden">
      {/* Dark Header Section */}
      <div className="pt-8 px-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-8 text-white">
          <div className="flex items-center gap-2 text-lg font-medium">
            <span>{currentMonth}</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </div>
          <button
            onClick={() => setShowAttendance(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">fact_check</span>
            <span className="text-[10px] font-medium text-white/70">Attendance</span>
          </button>
        </div>

        {/* Calendar Strip */}
        <div className="flex justify-between items-center mb-6">
          {WEEKDAYS_SHORT.map((day, idx) => {
            // Map S M T W T F S to 0-6 index.
            // But our selectedDay is 0 (Mon) to 4 (Fri).
            // Let's align S(0) M(1) T(2) W(3) T(4) F(5) S(6)
            // Monday is index 1 in this array, matches selectedDay 0.
            const isSelected = (idx - 1) === selectedDay;
            const isWeekend = idx === 0 || idx === 6;

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className={`text-xs font-medium ${isSelected || (idx === 0 || idx === 6) ? 'text-white/60' : 'text-white/60'}`}>
                  {day}
                </span>
                <button
                  onClick={() => !isWeekend && changeDay(idx - 1)}
                  disabled={isWeekend}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isSelected
                    ? 'bg-indigo-500 text-white ring-4 ring-indigo-900 border border-indigo-400'
                    : isWeekend
                      ? 'text-white/20 cursor-default'
                      : 'text-white hover:bg-white/10'
                    }`}
                >
                  {/* Just mock dates relative to "17" for demo effect, or just show dots */}
                  {/* Ideally we'd calculate actual dates, but for now just showing visual state */}
                  {14 + idx}
                </button>
                {isSelected && <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Sheet */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] overflow-hidden flex flex-col relative z-10 animate-slide-up">
        {/* Date Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              {daySchedule.filter(i => i.subject).length} lessons
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {WEEKDAYS[selectedDay]} {15 + selectedDay}
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrevDay} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-gray-600">chevron_left</span>
            </button>
            <button onClick={handleNextDay} className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-white">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Timeline Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {isLoading ? (
            <div className="space-y-6 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : scheduleWithBreaks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 pb-20">
              <span className="material-symbols-outlined text-6xl mb-4 text-gray-200">event_busy</span>
              <p className="font-medium">No classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {scheduleWithBreaks.map((item, idx) => {
                if ('type' in item && item.type === 'break') {
                  // Render break
                  return (
                    <div key={`break-${idx}`} className="flex gap-4 min-h-[60px]">
                      <div className="w-14 shrink-0 flex flex-col items-center justify-center text-xs font-medium text-gray-400">
                        {/* Time gap indicator if needed */}
                      </div>
                      <div className="flex-1 relative">
                        {/* Diagonals pattern background */}
                        <div className="absolute inset-0 rounded-2xl border border-gray-100 bg-[length:10px_10px] bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.03)_25%,rgba(0,0,0,0.03)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.03)_75%,rgba(0,0,0,0.03)_100%)] flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-400 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-100">
                            Free time: {formatTime(item.start)} - {formatTime(item.end)}
                          </span>
                        </div>
                        {/* Pink indicator line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-500" />
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-full h-px bg-pink-500/20" />
                      </div>
                    </div>
                  );
                }

                // Regular class item
                const period = item as DetailedScheduleItem;
                const style = getSubjectStyle(period.subject);

                return (
                  <div key={idx} className="flex gap-4">
                    {/* Time Column */}
                    <div className="w-14 shrink-0 flex flex-col justify-between py-2 items-end">
                      <div className="text-right">
                        <p className="text-gray-900 font-bold text-sm leading-none">{formatTime(period.start_time).split(' ')[0]}</p>
                        <p className="text-gray-400 text-[10px] font-medium uppercase mt-1">{formatTime(period.start_time).split(' ')[1]}</p>
                      </div>
                      <div className="text-right opacity-0"> {/* Spacer for alignment */}
                        <p className="text-gray-400 text-[10px] font-medium">{formatTime(period.end_time)}</p>
                      </div>
                    </div>

                    {/* Card */}
                    <div
                      onClick={() => onSubjectSelect?.({
                        name: period.subject,
                        code: period.code || period.subject.substring(0, 3).toUpperCase(),
                        color: style.bg.replace('bg-', 'from-').replace('500', '600') + ' to-' + style.bg.replace('bg-', '').replace('500', '400'),
                        icon: style.icon
                      })}
                      className={`flex-1 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${style.bg} ${style.text}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${style.iconBg}`}>
                          <span className={`material-symbols-outlined text-2xl ${style.iconColor}`}>
                            {style.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight mb-1">{period.subject}</h3>
                          <p className="opacity-90 text-sm font-medium mb-4">
                            {period.subject === 'Free' ? 'Free Period' : 'Standard Grade Class'}
                          </p>

                          <div className="flex items-center gap-2 opacity-80 text-xs font-medium">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>{formatTime(period.start_time)} - {formatTime(period.end_time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in" onClick={() => setShowAttendance(false)}>
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
                <p className="text-sm text-gray-500 mt-1">Your attendance summary</p>
              </div>
              <button
                onClick={() => setShowAttendance(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {attendanceLoading ? (
                <div className="space-y-4">
                  <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                  <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
              ) : (
                <>
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex items-center gap-6">
                      {/* Percentage Ring */}
                      <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                          <circle
                            cx="40" cy="40" r="36"
                            stroke="white" strokeWidth="8" fill="none"
                            strokeDasharray={`${(attendanceSummary?.attendancePercentage || 0) * 2.26} 226`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold">{attendanceSummary?.attendancePercentage || 0}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium mb-1">Overall Attendance</p>
                        <p className="text-2xl font-bold">{attendanceSummary?.present || 0} / {attendanceSummary?.total || 0}</p>
                        <p className="text-white/60 text-xs mt-1">classes attended</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <span className="text-2xl font-bold text-emerald-600">{attendanceSummary?.present || 0}</span>
                      <p className="text-xs text-emerald-600/70 font-medium mt-1">Present</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <span className="text-2xl font-bold text-red-600">{attendanceSummary?.absent || 0}</span>
                      <p className="text-xs text-red-600/70 font-medium mt-1">Absent</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <span className="text-2xl font-bold text-amber-600">{attendanceSummary?.late || 0}</span>
                      <p className="text-xs text-amber-600/70 font-medium mt-1">Late</p>
                    </div>
                  </div>

                  {/* Records List */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Records</h3>
                    {attendanceRecords.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">event_available</span>
                        <p className="text-sm">No attendance records yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {attendanceRecords.slice(0, 10).map((record, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-emerald-500' :
                              record.status === 'absent' ? 'bg-red-500' :
                                record.status === 'late' ? 'bg-amber-500' : 'bg-gray-400'
                              }`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{record.subject}</p>
                              <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                              record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                record.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleScreen;
