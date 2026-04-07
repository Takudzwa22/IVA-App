/**
 * Tests for lib/services/geminiService.ts
 * Mocks global fetch — no network calls.
 */
import { getStudyBuddyResponse } from '../lib/services/geminiService';
import type { ChatMessage } from '../types';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const makeOkResponse = (body: object) => ({
    ok: true,
    json: async () => body,
});

const makeErrorResponse = (body: object, status = 400) => ({
    ok: false,
    status,
    json: async () => body,
});

describe('getStudyBuddyResponse', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    // -----------------------------------------------------------------------
    // Happy path
    // -----------------------------------------------------------------------

    it('returns the response text on success', async () => {
        mockFetch.mockResolvedValueOnce(makeOkResponse({ response: 'Hello student!' }));

        const result = await getStudyBuddyResponse([], 'Hi');

        expect(result).toBe('Hello student!');
    });

    it('sends the correct request to /api/ai', async () => {
        mockFetch.mockResolvedValueOnce(makeOkResponse({ response: 'ok' }));

        const history: ChatMessage[] = [
            { role: 'user', content: 'Hello' },
            { role: 'model', content: 'Hi there!' },
        ];

        await getStudyBuddyResponse(history, 'Follow-up question');

        expect(mockFetch).toHaveBeenCalledWith('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history, message: 'Follow-up question' }),
        });
    });

    // -----------------------------------------------------------------------
    // Error paths
    // -----------------------------------------------------------------------

    it('returns the error message from the API on failure', async () => {
        mockFetch.mockResolvedValueOnce(makeErrorResponse({ error: 'Rate limit exceeded' }, 429));

        const result = await getStudyBuddyResponse([], 'Hi');

        expect(result).toBe('Rate limit exceeded');
    });

    it('returns fallback message when API error has no message body', async () => {
        mockFetch.mockResolvedValueOnce(makeErrorResponse({}, 500));

        const result = await getStudyBuddyResponse([], 'Hi');

        expect(result).toContain('trouble');
    });

    it('returns fallback message on network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network failure'));

        const result = await getStudyBuddyResponse([], 'Hi');

        expect(result).toContain('trouble');
    });

    it('returns fallback when successful response has no response field', async () => {
        mockFetch.mockResolvedValueOnce(makeOkResponse({}));

        const result = await getStudyBuddyResponse([], 'Hi');

        expect(result).toContain('trouble');
    });

    // -----------------------------------------------------------------------
    // Request shape
    // -----------------------------------------------------------------------

    it('sends an empty history array when no history is provided', async () => {
        mockFetch.mockResolvedValueOnce(makeOkResponse({ response: 'ok' }));

        await getStudyBuddyResponse([], 'First message');

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.history).toEqual([]);
        expect(body.message).toBe('First message');
    });

    it('never exposes secrets — calls /api/ai not a provider URL directly', async () => {
        mockFetch.mockResolvedValueOnce(makeOkResponse({ response: 'ok' }));

        await getStudyBuddyResponse([], 'test');

        const url: string = mockFetch.mock.calls[0][0];
        expect(url).toBe('/api/ai');
        expect(url).not.toContain('gemini');
        expect(url).not.toContain('googleapis');
        expect(url).not.toContain('openai');
    });
});
