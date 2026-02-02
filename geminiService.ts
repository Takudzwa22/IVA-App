/**
 * Gemini AI Service
 * 
 * Client-side service that calls the server API route.
 * The API key is NOT exposed to the browser.
 */

import { ChatMessage } from './types';

export const getStudyBuddyResponse = async (
  history: ChatMessage[],
  message: string
): Promise<string> => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AI Service] API error:', response.status, errorData);
      return errorData.error || "Sorry, I'm having trouble thinking right now. Could you ask again?";
    }

    const data = await response.json();
    return data.response || "Sorry, I'm having trouble thinking right now. Could you ask again?";
  } catch (error) {
    console.error('[AI Service] Error:', error);
    return "Sorry, I'm having trouble thinking right now. Could you ask again?";
  }
};
