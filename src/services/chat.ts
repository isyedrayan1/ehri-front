/**
 * Conversation / Chat API service functions.
 */

import { fetchAPI } from '@/services/api-client';
import type {
  ConversationResponse,
  ChatMessage,
  Audience,
  LegacyChatResponse,
} from '@/types/api';

// ── Primary Chat Endpoint ────────────────────

/**
 * Send a freeform message to the EHRI Conversation AI.
 * Auto-detects cities, classifies intent, returns markdown + cards + suggestions.
 *
 * POST /api/v1/ai/chat
 *
 * @param message  — user's message (min 2 chars)
 * @param audience — tone setting: 'public' | 'researcher' | 'professional'
 * @param history  — previous conversation turns (max 20, oldest first)
 */
export async function sendChatMessage(
  message: string,
  audience: Audience = 'public',
  history: ChatMessage[] = [],
): Promise<ConversationResponse> {
  // Trim history to last 20 entries per backend contract
  const trimmedHistory = history.slice(-20);

  return fetchAPI<ConversationResponse>('/v1/ai/chat', {
    message,
    audience,
    history: trimmedHistory,
  });
}

// ── Legacy Chat (backward compat) ────────────

/**
 * Legacy chat endpoint. Prefer sendChatMessage() for new features.
 *
 * POST /api/v1/chat/query
 */
export async function sendLegacyChatQuery(
  question: string,
  city?: string,
  history: ChatMessage[] = [],
): Promise<LegacyChatResponse> {
  return fetchAPI<LegacyChatResponse>('/v1/chat/query', {
    question,
    city,
    history: history.slice(-20),
  });
}
