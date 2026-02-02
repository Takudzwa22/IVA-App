/**
 * Teacher Dashboard Page
 * 
 * Main entry point for the teacher dashboard.
 * Uses responsive layout with sidebar on desktop, bottom nav on mobile.
 */

'use client';

import React, { useMemo, useState } from 'react';
import type { TabKey } from './_types';
import { teacherClasses, scheduleToday, tabs } from './_data/mockData';
import { HomeTab, ClassesTab, GradesTab, ProfileTab } from './_components/Tabs';
import { ResponsiveLayout } from '@/lib/components/ResponsiveLayout';
import type { NavItem } from '@/lib/components/Sidebar';

export default function TeacherHomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const classMap = useMemo(
    () => Object.fromEntries(teacherClasses.map((c) => [c.id, c])),
    []
  );

  // Navigation items for responsive layout
  const navItems: NavItem[] = useMemo(() =>
    tabs.map((tab) => ({
      key: tab.key,
      label: tab.label,
      icon: tab.icon,
      isActive: activeTab === tab.key,
      onClick: () => setActiveTab(tab.key),
    })),
    [activeTab]
  );

  // Sidebar header for desktop
  const sidebarHeader = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30">
        <span className="text-white font-bold text-lg">T</span>
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-900">Prof. Evelyn</h1>
        <p className="text-xs text-gray-500">Teacher Portal</p>
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      {/* Header */}
      <header className="mb-6">
        <p className="text-xs text-gray-500 font-medium">Teacher Workspace</p>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Hi, Prof. Evelyn</h1>
        <p className="text-xs text-gray-500 mt-2">Today · {scheduleToday.length} classes</p>
      </header>

      {/* Tab Content */}
      <main className="space-y-6">
        {activeTab === 'home' && <HomeTab classMap={classMap} />}
        {activeTab === 'classes' && <ClassesTab />}
        {activeTab === 'grades' && <GradesTab classMap={classMap} />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>
    </>
  );

  return (
    <ResponsiveLayout
      navItems={navItems}
      sidebarHeader={sidebarHeader}
    >
      <div className="p-6 md:p-0">
        {renderContent()}
      </div>
    </ResponsiveLayout>
  );
}
