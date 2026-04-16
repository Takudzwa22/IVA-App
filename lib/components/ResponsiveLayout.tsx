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
    navActiveClass?: string;
}

/**
 * Mobile layout with bottom navigation bar
 */
export function MobileLayout({ children, navItems, navActiveClass }: MobileLayoutProps) {
    return (
        <div className="h-screen bg-background">
            <div className="w-full h-full bg-background relative">
                {/* Content area — fixed height so h-full children resolve correctly */}
                <div className="h-full overflow-y-auto pb-24 scroll-smooth">
                    {children}
                </div>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.06)] z-50">
                    <div className="flex justify-around items-center h-20 px-1 w-full max-w-lg mx-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={item.onClick}
                                data-tour={item.dataTour}
                                className={`flex flex-col items-center flex-1 min-w-0 transition-all duration-200 ${item.isActive ? (navActiveClass || 'text-primary') : 'text-gray-400'}`}
                            >
                                <span className={`material-symbols-outlined text-2xl transition-all duration-200 ${item.isActive ? 'fill scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-semibold mt-0.5 whitespace-nowrap transition-all duration-200 ${item.isActive ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>

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
    navActiveClass?: string;
}

/**
 * Desktop layout with collapsible sidebar and content card
 */
// DesktopLayout: Auto-collapse on tablet, allow manual toggle
export function DesktopLayout({ children, navItems, sidebarHeader, navActiveClass }: DesktopLayoutProps) {
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
                isCollapsed={isCollapsed}
                onCollapseChange={setIsCollapsed}
                activeClass={navActiveClass}
            />

            {/* Main content area - dynamic margin synced with sidebar */}
            <div
                className="min-h-screen transition-all duration-300 ease-in-out"
                style={{ marginLeft: contentMargin }}
            >
                {/* Content wrapper with padding */}
                <div className="p-4 lg:p-6 h-full">
                    {/* Content Card — explicit height so h-full children fill it; overflow-hidden clips dark bg to rounded corners */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden">
                        <div className="h-full">
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
    navActiveClass?: string;
}

/**
 * Responsive layout that automatically switches between mobile and desktop
 */
export function ResponsiveLayout({
    children,
    navItems,
    sidebarHeader,
    navActiveClass,
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
            <MobileLayout navItems={navItems} navActiveClass={navActiveClass}>
                {children}
            </MobileLayout>
        );
    }

    return (
        <DesktopLayout navItems={navItems} sidebarHeader={sidebarHeader} navActiveClass={navActiveClass}>
            {children}
        </DesktopLayout>
    );
}

export default ResponsiveLayout;
