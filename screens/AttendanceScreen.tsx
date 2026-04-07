'use client';

import React from 'react';

const AttendanceScreen: React.FC = () => {
  return (
    <iframe
      src="https://iva-attendance.vercel.app"
      style={{
        display: 'block',
        width: '100%',
        // Desktop: subtract outer padding (p-4 = 2rem total) + card border-radius buffer
        // Mobile: subtract bottom nav (5rem) + top breathing room
        height: 'calc(100vh - 4rem)',
        border: 'none',
        borderRadius: '1rem',
      }}
      title="Attendance"
      allow="fullscreen"
    />
  );
};

export default AttendanceScreen;
