/**
 * Custom hook for city comparison analysis.
 *
 * Usage:
 * ```tsx
 * const { compare, loading, error } = useCompare(['Delhi', 'Mumbai']);
 * ```
 */

'use client';

import { useState, useCallback } from 'react';
import { fetchCityComparison } from '@/services/dashboard';
import type { CompareResponse } from '@/types/api';
import { ApiError } from '@/lib/api-error';

interface UseCompareResult {
  compare: (cities: string[]) => Promise<CompareResponse | null>;
  loading: boolean;
  error: string | null;
  data: CompareResponse | null;
}

export function useCompare(): UseCompareResult {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async (cities: string[]) => {
    if (cities.length < 2) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchCityComparison(cities);
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof ApiError ? err.detail : 'Comparison analysis failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    compare,
    loading,
    error,
    data,
  };
}
