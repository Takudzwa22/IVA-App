'use client';

import React, { useState } from 'react';
import { useSignOut } from '../lib/hooks';
import type { Student, Teacher } from '../types';

interface ProfileScreenProps {
  student: Student | null;
  teacher?: Teacher | null;
  onLogout?: () => void;
}

// Support Issue Types
const ISSUE_TYPES = [
  { value: 'subjects_wrong', label: 'My subjects are incorrect' },
  { value: 'marks_issue', label: 'Marks not showing correctly' },
  { value: 'other', label: 'Other issue' },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ student, teacher, onLogout }) => {
  const signOut = useSignOut();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onLogout?.();
  };

  const handleSendSupport = () => {
    if (!issueType) return;
    console.log('Support request:', { issueType, issueDescription, student: student?.student_number, teacher: teacher?.Email });
    setSupportSent(true);
    setTimeout(() => {
      setShowSupport(false);
      setSupportSent(false);
      setIssueType('');
      setIssueDescription('');
    }, 2000);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Determine user info
  const isTeacher = teacher !== null && teacher !== undefined;
  const displayName = isTeacher
    ? (teacher?.['Full name'] || `${teacher?.Name} ${teacher?.Surname}`)
    : (student ? `${student.first_name} ${student.last_name}` : 'Not Signed In');
  const initials = isTeacher
    ? (teacher?.Name?.charAt(0) || 'T')
    : (student?.first_name?.charAt(0) || '?');

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="w-8" />
        <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
        <div className="w-8" />
      </header>

      {/* Profile Header */}
      <section className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4 group">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-semibold shadow-lg border-4 border-white">
            {initials}
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">{displayName}</h2>
        {isTeacher ? (
          <p className="text-sm text-gray-500 font-medium mt-1">
            Teacher • {teacher?.Email}
          </p>
        ) : student ? (
          <p className="text-sm text-gray-500 font-medium mt-1">
            ID: {student.student_number} • Grade {student.grade}
          </p>
        ) : (
          <p className="text-sm text-gray-500 font-medium mt-1">Please sign in to view your profile</p>
        )}
      </section>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Personal Information</h3>

          {isTeacher && teacher ? (
            <ul className="space-y-6">
              <InfoItem
                icon="email"
                label="Email"
                value={teacher.Email}
                color="purple"
              />
              <InfoItem
                icon="badge"
                label="Role"
                value="Teacher"
                color="indigo"
              />
              <InfoItem
                icon="verified"
                label="Status"
                value="Active"
                color="green"
              />
            </ul>
          ) : student ? (
            <ul className="space-y-6">
              <InfoItem
                icon="email"
                label="Email"
                value={`${student.student_number}@ivaschool.online`}
                color="purple"
              />
              <InfoItem
                icon="badge"
                label="Student Number"
                value={student.student_number.toString()}
                color="blue"
              />
              <InfoItem
                icon="school"
                label="Grade Level"
                value={`Grade ${student.grade}`}
                color="yellow"
              />
              <InfoItem
                icon="verified"
                label="Status"
                value="Active"
                color="green"
              />
            </ul>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Sign in to view your information
            </p>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-subtle">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Settings</h3>
          <ul className="space-y-4">
            {/* Push Notifications */}
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-50 p-2 rounded-xl mr-4">
                  <span className="material-symbols-outlined text-blue-600">notifications</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">Push Notifications</p>
              </div>
              <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </li>

            {/* Appearance / Dark Mode Toggle */}
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-xl mr-4 ${isDarkMode ? 'bg-indigo-100' : 'bg-gray-50'}`}>
                  <span className={`material-symbols-outlined ${isDarkMode ? 'text-indigo-600' : 'text-gray-600'}`}>
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Appearance</p>
                  <p className="text-xs text-gray-500">{isDarkMode ? 'Dark mode' : 'Light mode'}</p>
                </div>
              </div>
              <button
                onClick={handleToggleDarkMode}
                className={`w-12 h-7 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDarkMode ? 'right-1' : 'left-1'
                  }`} />
              </button>
            </li>

            {/* Help & Support */}
            <li
              onClick={() => setShowSupport(true)}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-xl transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-orange-50 p-2 rounded-xl mr-4">
                  <span className="material-symbols-outlined text-orange-600">support_agent</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">Contact Support</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </li>

            {/* Privacy Policy */}
            <li
              onClick={() => setShowPrivacy(true)}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-xl transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-gray-100 p-2 rounded-xl mr-4">
                  <span className="material-symbols-outlined text-gray-600">privacy_tip</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">Privacy Policy</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </li>
          </ul>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-50 text-red-600 font-semibold py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowSupport(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600">support_agent</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Contact Support</h2>
                  <p className="text-xs text-gray-500">We're here to help</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupport(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              {supportSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Sent!</h3>
                  <p className="text-sm text-gray-500">We'll get back to you soon.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Issue Type Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What issue are you facing?
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select an issue type...</option>
                      {ISSUE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the issue (optional)
                    </label>
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Please provide more details about your issue..."
                      rows={4}
                      className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendSupport}
                    disabled={!issueType}
                    className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors ${issueType
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <span className="material-symbols-outlined">send</span>
                    Send Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowPrivacy(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-600">privacy_tip</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Privacy Policy</h2>
              </div>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm text-gray-600">
                <p className="text-xs text-gray-400 mb-4">Last updated: February 2026</p>

                <h4 className="text-sm font-semibold text-gray-900 mb-2">1. Information We Collect</h4>
                <p className="text-sm mb-4">
                  We collect information you provide directly, including your student number, email,
                  and academic records to provide educational services.
                </p>

                <h4 className="text-sm font-semibold text-gray-900 mb-2">2. How We Use Your Information</h4>
                <p className="text-sm mb-4">
                  Your information is used to display your timetable, assessments, marks, and
                  attendance records. We do not share your data with third parties.
                </p>

                <h4 className="text-sm font-semibold text-gray-900 mb-2">3. Data Security</h4>
                <p className="text-sm mb-4">
                  We implement industry-standard security measures to protect your personal
                  information from unauthorized access or disclosure.
                </p>

                <h4 className="text-sm font-semibold text-gray-900 mb-2">4. Your Rights</h4>
                <p className="text-sm mb-4">
                  You have the right to access, correct, or delete your personal data.
                  Contact your school administration for any data requests.
                </p>

                <h4 className="text-sm font-semibold text-gray-900 mb-2">5. Contact Us</h4>
                <p className="text-sm">
                  For privacy concerns, please contact us through the Support section or
                  email privacy@ivaschool.online.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <li className="flex items-center">
      <div className={`${colors.bg} p-3 rounded-xl mr-4`}>
        <span className={`material-symbols-outlined ${colors.text}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">{label}</p>
        <p className="font-medium text-gray-900 text-base">{value}</p>
      </div>
    </li>
  );
};

export default ProfileScreen;
