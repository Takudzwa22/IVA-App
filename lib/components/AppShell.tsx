/**
 * Responsive App Shell
 * 
 * Wrapper component that provides responsive layout:
 * - Mobile (< 768px): Full-width compact view
 * - Tablet (768px - 1024px): Centered with padding
 * - Desktop (> 1024px): Multi-column layout or centered wide view
 */

'use client';

import React from 'react';

interface AppShellProps {
    children: React.ReactNode;
    /** Navigation element to render at the bottom/side */
    navigation?: React.ReactNode;
    /** Floating action elements */
    floatingActions?: React.ReactNode;
}

/**
 * Responsive app shell that adapts to different screen sizes.
 * 
 * On mobile: Centered max-w-md with bottom nav
 * On tablet: Wider container with more padding
 * On desktop: Full-width with optional sidebar layout
 */
export function AppShell({ children, navigation, floatingActions }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Main content container - responsive widths */}
            <div className="
        mx-auto 
        max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
        min-h-screen 
        bg-background 
        relative 
        shadow-2xl md:shadow-xl
        transition-all duration-300
      ">
                {/* Scrollable content area */}
                <div className="pb-24 md:pb-20 overflow-y-auto h-screen scroll-smooth">
                    {children}
                </div>

                {/* Navigation - responsive positioning */}
                {navigation}

                {/* Floating actions */}
                {floatingActions}
            </div>
        </div>
    );
}

/**
 * Bottom navigation bar that adapts to screen size
 */
export function BottomNav({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <nav className={`
      fixed bottom-0 left-1/2 -translate-x-1/2 
      w-full 
      max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
      bg-white/80 backdrop-blur-xl 
      border-t border-gray-100 
      rounded-t-3xl md:rounded-t-2xl
      shadow-[0_-8px_32px_rgba(0,0,0,0.06)] 
      z-50
      transition-all duration-300
      ${className}
    `}>
            <div className="flex justify-around items-center h-20 md:h-16 px-2 md:px-6">
                {children}
            </div>
        </nav>
    );
}

/**
 * Responsive grid for dashboard-like layouts
 */
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {children}
        </div>
    );
}

/**
 * Card that spans full width on mobile, partial on larger screens
 */
export function ResponsiveCard({
    children,
    span = 1,
    className = ''
}: {
    children: React.ReactNode;
    span?: 1 | 2 | 3;
    className?: string;
}) {
    const spanClasses = {
        1: '',
        2: 'md:col-span-2',
        3: 'lg:col-span-3',
    };

    return (
        <div className={`glass-card rounded-2xl p-5 shadow-subtle ${spanClasses[span]} ${className}`}>
            {children}
        </div>
    );
}

export default AppShell;
