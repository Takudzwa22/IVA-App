/**
 * Teacher Dashboard Tabs
 * 
 * Tab content components for the teacher dashboard.
 */

'use client';

import React from 'react';
import type { TeacherClass } from '../_types';
import {
    teacherClasses,
    gradingQueue,
    scheduleToday,
    attendanceAlerts,
    gradebookSummary
} from '../_data/mockData';
import {
    StatCard,
    SectionHeader,
    InfoRow,
    StatusPill,
    QuickAction
} from './ui';

// ============================================================================
// HOME TAB
// ============================================================================

export function HomeTab({ classMap }: { classMap: Record<string, TeacherClass> }) {
    const totals = {
        students: teacherClasses.reduce((sum, c) => sum + c.students, 0),
        classesToday: scheduleToday.length,
        attendance: Math.round(
            teacherClasses.reduce((sum, c) => sum + c.attendanceRate, 0) / teacherClasses.length
        ),
        gradingTodo: gradingQueue.filter((g) => g.status !== 'done').length,
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Students" value={totals.students.toString()} icon="group" />
                <StatCard label="Classes" value={totals.classesToday.toString()} icon="calendar_month" />
                <StatCard label="Attendance" value={`${totals.attendance}%`} icon="check_circle" />
                <StatCard label="To grade" value={totals.gradingTodo.toString()} icon="grading" />
            </div>

            <section className="glass-card rounded-2xl p-5 shadow-subtle space-y-4">
                <SectionHeader title="Today's Schedule" action="Attendance" />
                <div className="space-y-3">
                    {scheduleToday.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start justify-between p-3 rounded-xl bg-white/70 hover:bg-white transition-all border border-white/40"
                        >
                            <div>
                                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                                    {item.startsAt} - {item.endsAt}
                                </p>
                                <h3 className="text-sm font-bold text-gray-900">
                                    {classMap[item.classId]?.name ?? item.classId}
                                </h3>
                                <p className="text-xs text-gray-500">{item.topic}</p>
                            </div>
                            <button className="text-primary text-xs font-semibold hover:underline">
                                Open
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card rounded-2xl p-5 shadow-subtle space-y-4">
                <SectionHeader title="Grading Queue" action="See all" />
                <div className="space-y-3">
                    {gradingQueue.slice(0, 3).map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-white/40"
                        >
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                                <p className="text-xs text-gray-500">
                                    {classMap[task.classId]?.code} · {task.submissions} submissions
                                </p>
                            </div>
                            <StatusPill status={task.status} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card rounded-2xl p-5 shadow-subtle space-y-4">
                <SectionHeader title="Attendance Alerts" />
                <div className="space-y-3">
                    {attendanceAlerts.map((alert, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-white/40"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    {alert.student.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{alert.student}</p>
                                    <p className="text-xs text-gray-500">{alert.note}</p>
                                </div>
                            </div>
                            <button className="text-primary text-xs font-semibold hover:underline">
                                View
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card rounded-2xl p-5 shadow-subtle space-y-4">
                <SectionHeader title="Quick Actions" />
                <div className="grid grid-cols-3 gap-2">
                    <QuickAction icon="add_task" label="New assignment" />
                    <QuickAction icon="post_add" label="Post announcement" />
                    <QuickAction icon="folder_zip" label="Export grades" />
                </div>
            </section>
        </div>
    );
}

// ============================================================================
// CLASSES TAB
// ============================================================================

export function ClassesTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Your Classes</h2>
                <button className="text-xs font-semibold text-primary hover:underline">
                    Create section
                </button>
            </div>
            <div className="space-y-3">
                {teacherClasses.map((cls) => (
                    <div
                        key={cls.id}
                        className="glass-card rounded-2xl p-5 shadow-subtle border border-white/50 hover:bg-white transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                                    {cls.code}
                                </p>
                                <h3 className="text-base font-bold text-gray-900">{cls.name}</h3>
                                <p className="text-xs text-gray-500">Room {cls.room}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] text-gray-400">Students</p>
                                <p className="text-lg font-bold text-gray-900">{cls.students}</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <InfoRow icon="schedule" text={cls.nextMeeting} />
                            <InfoRow icon="assignment" text={cls.nextAssignment || 'No upcoming assignments'} />
                            <InfoRow icon="task_alt" text={`${cls.attendanceRate}% attendance`} />
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-white shadow-sm shadow-primary/30">
                                Open class
                            </button>
                            <button className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-800">
                                Attendance
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// GRADES TAB
// ============================================================================

export function GradesTab({ classMap }: { classMap: Record<string, TeacherClass> }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Grades Overview</h2>
                <div className="flex gap-2">
                    <button className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-800">
                        Export CSV
                    </button>
                    <button className="text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-white shadow-sm shadow-primary/30">
                        Gradebook
                    </button>
                </div>
            </div>

            <section className="glass-card rounded-2xl p-5 shadow-subtle space-y-4">
                <SectionHeader title="Class Averages" />
                <div className="space-y-3">
                    {gradebookSummary.map((row) => (
                        <div
                            key={row.classId}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-white/40"
                        >
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">
                                    {classMap[row.classId]?.name ?? row.classId}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Median: {row.median}% · {row.missing} missing
                                </p>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{row.avg}%</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card rounded-2xl p-5 shadow-subtle space-y-4">
                <SectionHeader title="Grading Queue" action="See all" />
                <div className="space-y-3">
                    {gradingQueue.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-white/40"
                        >
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                                <p className="text-xs text-gray-500">
                                    {classMap[task.classId]?.code} · {task.dueDate}
                                </p>
                            </div>
                            <StatusPill status={task.status} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

// ============================================================================
// PROFILE TAB
// ============================================================================

export function ProfileTab() {
    return (
        <div className="space-y-6">
            <section className="glass-card rounded-2xl p-6 shadow-subtle text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-primary/30">
                    EP
                </div>
                <h2 className="mt-4 text-lg font-bold text-gray-900">Prof. Evelyn Parker</h2>
                <p className="text-sm text-gray-500">evelyn.parker@school.edu</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                        Mathematics
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                        History
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                        Chemistry
                    </span>
                </div>
            </section>

            <section className="glass-card rounded-2xl p-5 shadow-subtle space-y-3">
                <h2 className="text-sm font-bold text-gray-900">Settings</h2>
                {[
                    { icon: 'notifications', label: 'Notifications' },
                    { icon: 'lock', label: 'Privacy' },
                    { icon: 'palette', label: 'Appearance' },
                    { icon: 'help', label: 'Help & Support' },
                ].map(({ icon, label }) => (
                    <button
                        key={label}
                        className="flex w-full items-center justify-between p-3 rounded-xl bg-white/70 border border-white/40 hover:bg-white transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">{icon}</span>
                            <span className="text-sm font-medium text-gray-800">{label}</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 text-lg">chevron_right</span>
                    </button>
                ))}
            </section>

            <button className="w-full py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                Sign out
            </button>
        </div>
    );
}
