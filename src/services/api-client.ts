/**
 * Central API client for the EHRI FastAPI backend.
 *
 * Base URL: http://localhost:8000/api  (configurable via NEXT_PUBLIC_API_URL)
 *
 * Features:
 *  - Typed request / response via generics
 *  - Uniform error envelope parsing ({ error, detail, code })
 *  - Auto-retry on 502 (external source failure) — 1 retry, 2 s delay
 *  - X-Request-ID header logging in development
 */

import { ApiError } from '@/lib/api-error';
import type { APIErrorResponse } from '@/types/api';

// ── Configuration ────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://6701-2401-4900-cbfd-9d2d-f082-7520-c7aa-c1af.ngrok-free.app/api';

const MAX_RETRIES_ON_502 = 1;
const RETRY_DELAY_MS = 2000;

// ── Core Fetch ───────────────────────────────

async function rawFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420' // Skip ngrok landing page for API requests
    },
    ...options,
  });
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Primary API helper.
 *
 * @param path  — endpoint path, e.g. `/v1/dashboard/insights`
 * @param body  — optional request body (auto-stringified, sets method to POST)
 * @returns     — parsed JSON typed as `T`
 * @throws      — `ApiError` for any non-2xx response
 *
 * @example
 * ```ts
 * const data = await fetchAPI<DashboardInsightsResponse>(
 *   '/v1/dashboard/insights',
 *   { city: 'Delhi' },
 * );
 * ```
 */
export async function fetchAPI<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const init: RequestInit = body
    ? { method: 'POST', body: JSON.stringify(body) }
    : { method: 'GET' };

  let lastError: ApiError | null = null;
  const attempts = MAX_RETRIES_ON_502 + 1; // first try + retries

  for (let attempt = 0; attempt < attempts; attempt++) {
    // Wait before retrying (skip on first attempt)
    if (attempt > 0) {
      await delay(RETRY_DELAY_MS);
    }

    const res = await rawFetch(url, init);

    // ── Dev-mode logging of X-Request-ID ──
    if (process.env.NODE_ENV === 'development') {
      const requestId = res.headers.get('X-Request-ID');
      if (requestId) {
        console.debug(`[EHRI API] ${init.method} ${path} — X-Request-ID: ${requestId}`);
      }
    }

    // ── Success ──
    if (res.ok) {
      return res.json() as Promise<T>;
    }

    // ── Error parsing ──
    let errPayload: APIErrorResponse;
    try {
      errPayload = await res.json();
    } catch {
      errPayload = {
        error: 'UnknownError',
        detail: `Request failed with status ${res.status}`,
        code: res.status,
      };
    }

    lastError = new ApiError(
      errPayload.code ?? res.status,
      errPayload.detail ?? 'An unexpected error occurred.',
      errPayload.error ?? 'APIError',
    );

    // Only retry on 502 (external API failure)
    if (res.status === 502 && attempt < MAX_RETRIES_ON_502) {
      console.warn(`[EHRI API] 502 on ${path} — retrying in ${RETRY_DELAY_MS}ms (attempt ${attempt + 1})`);
      continue;
    }

    // All other errors — throw immediately
    break;
  }

  throw lastError!;
}

/**
 * Health check — quick connectivity test.
 * GET /api/health → { status: "ok" }
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetchAPI<{ status: string }>('/health');
    return res.status === 'ok';
  } catch {
    return false;
  }
}
