/**
 * Dashboard-specific API service functions.
 * All functions use the central fetchAPI client.
 */

import { fetchAPI } from '@/services/api-client';
import type {
  DashboardInsightsResponse,
  CityAnalyzeResponse,
  CityForecastResponse,
  CompareResponse,
  AlertFeedResponse,
} from '@/types/api';

// ── Primary Dashboard Endpoint ───────────────

/**
 * Fetch full dashboard intelligence for a city.
 * Returns all 5 cards + dynamic alerts + AI summary in a single call.
 *
 * POST /api/v1/dashboard/insights
 */
export async function fetchDashboardInsights(
  city: string,
  latitude?: number,
  longitude?: number,
): Promise<DashboardInsightsResponse> {
  return fetchAPI<DashboardInsightsResponse>('/v1/dashboard/insights', { 
    city,
    latitude,
    longitude 
  });
}

// ── Supporting Endpoints ─────────────────────

/**
 * Full EHRI analysis for a single city (raw data version).
 *
 * POST /api/v1/city/analyze
 */
export async function fetchCityAnalysis(
  city: string,
): Promise<CityAnalyzeResponse> {
  return fetchAPI<CityAnalyzeResponse>('/v1/city/analyze', { city });
}

/**
 * Forecast EHRI for next 2 days (needs 3+ prior analyses).
 *
 * POST /api/v1/city/forecast
 */
export async function fetchCityForecast(
  city: string,
): Promise<CityForecastResponse> {
  return fetchAPI<CityForecastResponse>('/v1/city/forecast', { city });
}

/**
 * Compare 2-5 cities side by side.
 * Returns cities sorted worst → best.
 *
 * POST /api/v1/compare
 */
export async function fetchCityComparison(
  cities: string[],
): Promise<CompareResponse> {
  return fetchAPI<CompareResponse>('/v1/compare', { cities });
}

/**
 * Global alert feed — returns all triggered dynamic alerts.
 *
 * GET /api/v1/alerts
 */
export async function fetchAlertFeed(): Promise<AlertFeedResponse> {
  return fetchAPI<AlertFeedResponse>('/v1/alerts');
}
