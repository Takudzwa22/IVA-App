/**
 * Responsive Layout Components
 * 
 * Layout wrappers that adapt to different device types.
 */

'use client';

import React, { useState } from 'react';
import { useDeviceType } from '../hooks/useDeviceType';
import { NavItem, SidebarWithAI, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';

// ============================================================================
// MOBILE LAYOUT
// ============================================================================

interface MobileLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
    floatingAction?: React.ReactNode;
}

/**
 * Mobile layout with bottom navigation bar
 */
export function MobileLayout({ children, navItems, floatingAction }: MobileLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="w-full min-h-screen bg-background relative">
                {/* Content area with bottom nav padding */}
                <div className="pb-24 overflow-y-auto min-h-screen scroll-smooth">
                    {children}
                </div>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.06)] z-50">
                    <div className="flex justify-around items-center h-20 px-1 w-full max-w-lg mx-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={item.onClick}
                                className={`flex flex-col items-center flex-1 min-w-0 transition-all duration-300 ${item.isActive ? 'text-primary' : 'text-gray-400'
                                    }`}
                            >
                                <div className={`transition-all duration-300 ${item.isActive ? '-translate-y-1' : 'translate-y-1'}`}>
                                    <span className={`material-symbols-outlined text-2xl ${item.isActive ? 'fill scale-110' : ''}`}>
                                        {item.icon}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        display: item.isActive ? 'block' : 'none',
                                        opacity: item.isActive ? 1 : 0,
                                        maxWidth: item.isActive ? '100px' : '0px'
                                    }}
                                    className="text-[10px] font-bold mt-0.5 whitespace-nowrap overflow-hidden transition-all duration-300"
                                >
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Floating Action */}
                {floatingAction && (
                    <div className="fixed bottom-24 right-4 z-40">
                        {floatingAction}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// DESKTOP LAYOUT
// ============================================================================

interface DesktopLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
    sidebarHeader?: React.ReactNode;
    onOpenAI?: () => void;
}

/**
 * Desktop layout with collapsible sidebar and content card
 */
// DesktopLayout: Auto-collapse on tablet, allow manual toggle
export function DesktopLayout({ children, navItems, sidebarHeader, onOpenAI }: DesktopLayoutProps) {
    const deviceType = useDeviceType();
    // Default to collapsed on tablet
    const [isCollapsed, setIsCollapsed] = useState(() => deviceType === 'tablet');

    // Dynamic margin based on sidebar state
    const contentMargin = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar - controlled by parent state */}
            <SidebarWithAI
                items={navItems}
                header={sidebarHeader}
                onOpenAI={onOpenAI}
                isCollapsed={isCollapsed}
                onCollapseChange={setIsCollapsed}
            />

            {/* Main content area - dynamic margin synced with sidebar */}
            <div
                className="min-h-screen transition-all duration-300 ease-in-out"
                style={{ marginLeft: contentMargin }}
            >
                {/* Content wrapper with padding */}
                <div className="p-4 lg:p-6">
                    {/* Content Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)]">
                        {/* Removed inner padding to avoid double padding */}
                        <div>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// RESPONSIVE LAYOUT (AUTO-SWITCH)
// ============================================================================

interface ResponsiveLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
    sidebarHeader?: React.ReactNode;
    /** Floating AI button for mobile */
    floatingAIButton?: React.ReactNode;
    /** AI button handler for desktop sidebar */
    onOpenAI?: () => void;
}

/**
 * Responsive layout that automatically switches between mobile and desktop
 */
export function ResponsiveLayout({
    children,
    navItems,
    sidebarHeader,
    floatingAIButton,
    onOpenAI,
}: ResponsiveLayoutProps) {
    const deviceType = useDeviceType();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (deviceType === 'mobile') {
        return (
            <MobileLayout navItems={navItems} floatingAction={floatingAIButton}>
                {children}
            </MobileLayout>
        );
    }

    return (
        <DesktopLayout navItems={navItems} sidebarHeader={sidebarHeader} onOpenAI={onOpenAI}>
            {children}
        </DesktopLayout>
    );
}

export default ResponsiveLayout;
