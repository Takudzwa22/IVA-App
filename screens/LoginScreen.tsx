'use client';

import React, { useState } from 'react';
import type { Student, Teacher } from '../types';

interface LoginScreenProps {
    onLogin: (userData: { student?: Student; teacher?: Teacher }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail.includes('@')) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            // Dev mode - simulate login with mock data
            console.warn('[Login] Supabase not configured - simulating login');

            // Check if it looks like a student email (number@ivaschool.online)
            if (trimmedEmail.endsWith('@ivaschool.online')) {
                const numberPart = trimmedEmail.replace('@ivaschool.online', '');
                const studentNumber = parseInt(numberPart, 10);

                if (!isNaN(studentNumber) && studentNumber > 0) {
                    const mockStudent: Student = {
                        student_number: studentNumber,
                        first_name: 'Hadassah',
                        last_name: 'Adams',
                        grade: 10,
                        user_role: 'student',
                    };
                    setTimeout(() => {
                        setIsLoading(false);
                        onLogin({ student: mockStudent });
                    }, 500);
                    return;
                }
            }

            // Otherwise treat as teacher
            const mockTeacher: Teacher = {
                Email: trimmedEmail,
                Name: 'Test',
                Surname: 'Teacher',
                'Full name': 'Test Teacher',
                user_role: 'teacher',
            };
            setTimeout(() => {
                setIsLoading(false);
                onLogin({ teacher: mockTeacher });
            }, 500);
            return;
        }

        // Real database verification via API (uses service role key server-side)
        try {
            console.log('[Login] Verifying email via API:', trimmedEmail);

            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            console.log('[Login] Verification result:', data);

            if (data.type === 'student' && data.data) {
                // Successful student login
                onLogin({ student: data.data });
            } else if (data.type === 'teacher' && data.data) {
                // Successful teacher login
                onLogin({ teacher: data.data });
            } else {
                setError('Email not found in school records');
            }
        } catch (err) {
            console.error('[Login] Error:', err);
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-600 relative overflow-hidden flex flex-col">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-indigo-500 to-indigo-700 z-0"></div>
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[10%] left-[-10%] w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            {/* Header Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-12 pb-24 px-6 text-center">
                <div className="mb-4">
                    <img
                        src="/iva-logo.png"
                        alt="IVA Global School"
                        className="h-20 mx-auto brightness-0 invert drop-shadow-lg"
                    />
                </div>
                <p className="text-indigo-100 font-medium">Welcome to the IVA App</p>
            </div>

            {/* Login Card - Bottom Sheet Style */}
            <div className="relative z-10 bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-2xl animate-slide-up">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>

                <div className="max-w-sm mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Please enter your details below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600">
                                    email
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@ivaschool.online"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 font-medium animate-shake">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isLoading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>Sign in</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            Having trouble? <button className="text-indigo-600 font-semibold hover:underline">Contact Support</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
