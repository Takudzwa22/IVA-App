/**
 * Teacher Dashboard UI Components
 * 
 * Reusable UI components for the teacher dashboard.
 */

import React from 'react';
import type { GradingTask } from '../_types';

// ============================================================================
// STAT CARD
// ============================================================================

export function StatCard({
    label,
    value,
    icon
}: {
    label: string;
    value: string;
    icon: string
}) {
    return (
        <div className="glass-card rounded-2xl p-4 shadow-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-sm shadow-primary/30">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                    {label}
                </p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

// ============================================================================
// SECTION HEADER
// ============================================================================

export function SectionHeader({
    title,
    action
}: {
    title: string;
    action?: string
}) {
    return (
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {action ? (
                <button className="text-xs font-semibold text-primary hover:underline">
                    {action}
                </button>
            ) : null}
        </div>
    );
}

// ============================================================================
// INFO ROW
// ============================================================================

export function InfoRow({
    icon,
    text
}: {
    icon: string;
    text: string
}) {
    return (
        <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="material-symbols-outlined text-base text-primary">{icon}</span>
            <span>{text}</span>
        </div>
    );
}

// ============================================================================
// STATUS PILL
// ============================================================================

export function StatusPill({
    status
}: {
    status: GradingTask['status']
}) {
    const styles = {
        'needs-grading': 'bg-red-50 text-red-600',
        'in-progress': 'bg-amber-50 text-amber-700',
        done: 'bg-emerald-50 text-emerald-700',
    }[status];

    const label = {
        'needs-grading': 'Needs grading',
        'in-progress': 'In progress',
        done: 'Done',
    }[status];

    return (
        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${styles}`}>
            {label}
        </span>
    );
}

// ============================================================================
// QUICK ACTION
// ============================================================================

export function QuickAction({
    icon,
    label
}: {
    icon: string;
    label: string
}) {
    return (
        <button className="flex flex-col items-start gap-2 p-3 rounded-xl bg-white/70 border border-white/40 hover:bg-white transition-all">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-sm shadow-primary/30">
                <span className="material-symbols-outlined">{icon}</span>
            </span>
            <span className="text-xs font-semibold text-gray-800">{label}</span>
        </button>
    );
}

// ============================================================================
// NAV ITEM
// ============================================================================

export function NavItem({
    isActive,
    onClick,
    icon,
    label,
}: {
    isActive: boolean;
    onClick: () => void;
    icon: string;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center flex-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400'
                }`}
        >
            <span className={`material-symbols-outlined text-2xl ${isActive ? 'fill' : ''}`}>
                {icon}
            </span>
            <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {label}
            </span>
        </button>
    );
}
