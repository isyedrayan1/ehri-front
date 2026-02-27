/**
 * Custom hook for polling the global alert feed.
 *
 * Polls GET /api/v1/alerts every 60 seconds.
 * Only returns alerts for cities that have been previously analyzed
 * in the current backend session.
 *
 * Usage:
 * ```tsx
 * const { alerts, totalAlerts, citiesMonitored, loading } = useAlerts();
 * ```
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAlertFeed } from '@/services/dashboard';
import type { DynamicAlertResponse } from '@/types/api';

const POLL_INTERVAL_MS = 60_000; // 60 seconds

interface UseAlertsResult {
  alerts: DynamicAlertResponse[];
  totalAlerts: number;
  citiesMonitored: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<DynamicAlertResponse[]>([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [citiesMonitored, setCitiesMonitored] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAlertFeed();
      setAlerts(result.alerts);
      setTotalAlerts(result.total_alerts);
      setCitiesMonitored(result.cities_monitored);
    } catch (err) {
      // Alert polling is non-critical — don't crash the app
      setError(err instanceof Error ? err.message : 'Alert fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    loadAlerts();

    // Poll every 60 seconds
    intervalRef.current = setInterval(loadAlerts, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadAlerts]);

  return {
    alerts,
    totalAlerts,
    citiesMonitored,
    loading,
    error,
    refetch: loadAlerts,
  };
}
