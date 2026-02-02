/**
 * Sidebar Navigation Component
 * 
 * Collapsible vertical navigation for tablet and desktop layouts.
 */

'use client';

import React from 'react';

export interface NavItem {
    key: string;
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

interface SidebarProps {
    items: NavItem[];
    /** Optional header content (logo, user info, etc.) */
    header?: React.ReactNode;
    /** Optional footer content */
    footer?: React.ReactNode;
    /** Whether sidebar is collapsed (controlled externally) */
    isCollapsed: boolean;
    /** Callback when collapse state changes */
    onCollapseChange: (collapsed: boolean) => void;
}

export function Sidebar({ items, header, footer, isCollapsed, onCollapseChange }: SidebarProps) {
    return (
        <aside
            className={`
        fixed left-0 top-0 h-full
        bg-white/95 backdrop-blur-xl border-r border-gray-100 
        shadow-xl z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Header with collapse button */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between min-h-[72px]">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {header || (
                            <>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30 flex-shrink-0">
                                    <span className="text-white font-bold text-lg">I</span>
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-gray-900 truncate">IVA</h1>
                                    <p className="text-xs text-gray-500 truncate">Student Portal</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Collapsed logo */}
                {isCollapsed && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30 mx-auto">
                        <span className="text-white font-bold text-lg">I</span>
                    </div>
                )}

                {/* Collapse/Expand button */}
                <button
                    onClick={() => onCollapseChange(!isCollapsed)}
                    className={`
            p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0
            ${isCollapsed ? 'absolute top-16 left-1/2 -translate-x-1/2' : ''}
          `}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className="material-symbols-outlined text-xl">
                        {isCollapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
                {items.map((item) => (
                    <button
                        key={item.key}
                        onClick={item.onClick}
                        title={isCollapsed ? item.label : undefined}
                        className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
              ${item.isActive
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
            `}
                    >
                        <span className={`material-symbols-outlined text-xl ${item.isActive ? 'fill' : ''}`}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            {footer && (
                <div className={`p-3 border-t border-gray-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {footer}
                </div>
            )}
        </aside>
    );
}

/**
 * Sidebar with AI button in footer (controlled component)
 */
export function SidebarWithAI({
    items,
    header,
    onOpenAI,
    isCollapsed,
    onCollapseChange,
}: Omit<SidebarProps, 'footer'> & { onOpenAI?: () => void }) {
    return (
        <aside
            className={`
        fixed left-0 top-0 h-full
        bg-white/95 backdrop-blur-xl border-r border-gray-100 
        shadow-xl z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Header with collapse button */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between min-h-[72px]">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {header || (
                            <>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30 flex-shrink-0">
                                    <span className="text-white font-bold text-lg">I</span>
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-gray-900 truncate">IVA</h1>
                                    <p className="text-xs text-gray-500 truncate">Student Portal</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Collapsed logo */}
                {isCollapsed && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30 mx-auto">
                        <span className="text-white font-bold text-lg">I</span>
                    </div>
                )}

                {/* Collapse/Expand button */}
                <button
                    onClick={() => onCollapseChange(!isCollapsed)}
                    className={`
            p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0
            ${isCollapsed ? 'absolute top-16 left-1/2 -translate-x-1/2' : ''}
          `}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className="material-symbols-outlined text-xl">
                        {isCollapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
                {items.map((item) => (
                    <button
                        key={item.key}
                        onClick={item.onClick}
                        title={isCollapsed ? item.label : undefined}
                        className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
              ${item.isActive
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
            `}
                    >
                        <span className={`material-symbols-outlined text-xl ${item.isActive ? 'fill' : ''}`}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* AI Button Footer */}
            {onOpenAI && (
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={onOpenAI}
                        title={isCollapsed ? 'AI Assistant' : undefined}
                        className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl 
              bg-gradient-to-r from-primary to-secondary text-white 
              shadow-md shadow-primary/30 hover:scale-[1.02] transition-transform
              ${isCollapsed ? 'justify-center' : ''}
            `}
                    >
                        <span className="material-symbols-outlined text-xl fill">smart_toy</span>
                        {!isCollapsed && (
                            <span className="font-medium text-sm">AI Assistant</span>
                        )}
                    </button>
                </div>
            )}
        </aside>
    );
}

// Export widths for layout calculations
export const SIDEBAR_WIDTH = 256; // w-64 = 16rem = 256px
export const SIDEBAR_COLLAPSED_WIDTH = 80; // w-20 = 5rem = 80px

export default Sidebar;
