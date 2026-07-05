/**
 * Samsung Store Assistant — Chatbot API Service
 *
 * In development: requests go to /api/chat which Vite proxies to http://localhost:5000
 * In production:  set VITE_API_URL env var to the deployed backend URL
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function sendChatMessage(message, history = []) {
  const url = API_BASE + '/api/chat';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to reach the assistant. Please try again.');
  }

  return data.reply;
}
