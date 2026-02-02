/**
 * Gemini AI API Route
 * 
 * Server-side API route to protect the Gemini API key from client exposure.
 * The API key is only accessible on the server, not in the browser bundle.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Rate limiting (simple in-memory for demo - use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimit.get(ip);

    if (!record || now > record.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: NextRequest) {
    // Get client IP for rate limiting (from headers since NextRequest doesn't have ip)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    // Validate API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[AI API] GEMINI_API_KEY not configured');
        return NextResponse.json(
            { error: 'AI service not configured' },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const { history, message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Validate history format
        if (history && !Array.isArray(history)) {
            return NextResponse.json(
                { error: 'History must be an array' },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                ...(history || []).map((m: { role: string; content: string }) => ({
                    role: m.role,
                    parts: [{ text: m.content }],
                })),
                { role: 'user', parts: [{ text: message }] },
            ],
            config: {
                systemInstruction:
                    "You are a friendly and helpful AI Study Buddy named IVA (Intelligent Virtual Assistant). You help students with their homework, study schedules, and explain complex academic concepts simply. You have access to their current grade info and classes. Keep responses encouraging and concise. Format responses in a way that's easy to read on a mobile device.",
            },
        });

        const text =
            response.text ||
            "Sorry, I'm having trouble thinking right now. Could you ask again?";

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error('[AI API] Error:', error);
        return NextResponse.json(
            { error: "Sorry, I'm having trouble thinking right now. Could you ask again?" },
            { status: 500 }
        );
    }
}
