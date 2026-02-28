/**
 * Custom hook for fetching dashboard insights from the real backend.
 *
 * Usage:
 * ```tsx
 * const { data, loading, error, refetch } = useDashboard('Delhi');
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardInsights } from '@/services/dashboard';
import type { DashboardInsightsResponse } from '@/types/api';
import { ApiError } from '@/lib/api-error';

interface UseDashboardResult {
  data: DashboardInsightsResponse | null;
  loading: boolean;
  error: string | null;
  errorCode: number | null;
  isRateLimited: boolean;
  refetch: () => void;
}

export function useDashboard(
  city: string, 
  latitude?: number, 
  longitude?: number
): UseDashboardResult {
  const [data, setData] = useState<DashboardInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const loadData = useCallback(async () => {
    if (!city) return;

    setLoading(true);
    setError(null);
    setErrorCode(null);
    setIsRateLimited(false);
    setData(null); // Clear old data immediately to prevent "Zombie Data"

    try {
      const result = await fetchDashboardInsights(city, latitude, longitude);
      setData(result);
    } catch (err) {
      setData(null); // Ensure data is cleared on error
      if (err instanceof ApiError) {
        setError(err.detail);
        setErrorCode(err.code);
        setIsRateLimited(err.isRateLimited);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to connect to EHRI backend. Is the server running on localhost:8000?',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [city, latitude, longitude]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    errorCode,
    isRateLimited,
    refetch: loadData,
  };
}
