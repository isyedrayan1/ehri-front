/**
 * Legacy API service — now wires to real backend.
 *
 * The old `fetchCityRisk()` is kept for backward compatibility during
 * migration. It calls the real dashboard/insights endpoint and transforms
 * the response into the old CityRiskData shape so existing components
 * don't break.
 *
 * New code should import from `@/services/dashboard` directly.
 */

import { fetchDashboardInsights } from '@/services/dashboard';
import type { DashboardInsightsResponse } from '@/types/api';

// ── The original mock data type (kept for compat) ────────────

export interface CityRiskData {
  city: string;
  ehri: number;
  status: string;
  pollutionStress: number;
  heatStress: number;
  humidityStress: number;
  airQuality: {
    pm25: number;
    status: string;
    trend: number[];
  };
  weather: {
    temp: number;
    humidity: number;
    condition: string;
  };
  populationDensity: {
    value: string;
    context: string;
  };
  topFactors: { name: string; value: number }[];
  explanation: string;
  trend: number[];
  precautions: { icon: string; text: string }[];
  healthImpact: {
    respiratory: {
      summary: string;
      severity: number;
      indicators: string[];
    };
    cardiovascular: {
      summary: string;
      severity: number;
      indicators: string[];
    };
    vulnerability: {
      demographic: string;
      riskFactor: string;
    };
    longTerm: string;
  };
}

/**
 * Map a precaution text to a Lucide icon name.
 * Simple keyword-based mapping.
 */
function mapPrecautionIcon(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('mask') || lower.includes('n95')) return 'Shield';
  if (lower.includes('indoor') || lower.includes('remain')) return 'Home';
  if (lower.includes('purif')) return 'Wind';
  if (lower.includes('exercise') || lower.includes('exertion')) return 'Activity';
  if (lower.includes('hydra') || lower.includes('drink') || lower.includes('water')) return 'GlassWater';
  if (lower.includes('medical') || lower.includes('symptom')) return 'Stethoscope';
  if (lower.includes('uv') || lower.includes('sun')) return 'Sun';
  if (lower.includes('ventilat')) return 'Wind';
  return 'ShieldAlert';
}

/**
 * Convert the new DashboardInsightsResponse into the legacy CityRiskData shape.
 * This allows existing components to work without modification during migration.
 */
export function transformToLegacy(data: DashboardInsightsResponse): CityRiskData {
  const metrics = data.metric_breakdown.metrics;
  const pm25Metric = metrics.find(m => m.name === 'PM2.5');
  const tempMetric = metrics.find(m => m.name === 'Temperature');
  const humidityMetric = metrics.find(m => m.name === 'Humidity');
  const popMetric = metrics.find(m => m.name === 'Population Density');

  // Derive stress values from metrics (normalized 0-1)
  const pm25Val = pm25Metric?.value ?? 0;
  const tempVal = tempMetric?.value ?? 0;
  const humidityVal = humidityMetric?.value ?? 0;

  const pollutionStress = Math.min(pm25Val / 500, 1);
  const heatStress = Math.min(tempVal / 50, 1);
  const humidityStress = Math.min(humidityVal / 100, 1);

  // Build forecast-based trend or fallback
  const trendData = data.forecast_snapshot.available
    ? data.forecast_snapshot.forecast_values
    : [];

  return {
    city: data.risk_summary.city,
    ehri: data.risk_summary.ehri,
    status: data.risk_summary.summary,
    pollutionStress,
    heatStress,
    humidityStress,
    airQuality: {
      pm25: pm25Val,
      status: pm25Metric?.description ?? 'Unknown',
      trend: trendData.length > 0 ? [data.risk_summary.ehri, ...trendData] : [data.risk_summary.ehri],
    },
    weather: {
      temp: tempVal,
      humidity: humidityVal,
      condition: tempMetric?.description ?? 'Unknown',
    },
    populationDensity: {
      value: popMetric ? `${popMetric.value.toLocaleString()}/km²` : 'N/A',
      context: popMetric?.description ?? '',
    },
    topFactors: metrics
      .filter(m => m.name !== 'Population Density')
      .map(m => ({
        name: m.name,
        value: m.severity === 'hazardous' ? 0.9 : m.severity === 'unhealthy' ? 0.7 : m.severity === 'moderate' ? 0.5 : 0.3,
      })),
    explanation: data.ai_summary,
    trend: [data.risk_summary.ehri],
    precautions: data.health_advisory.precautions.map(text => ({
      icon: mapPrecautionIcon(text),
      text,
    })),
    healthImpact: {
      respiratory: {
        summary: data.health_advisory.health_impacts[0] ?? 'No data available.',
        severity: data.risk_summary.alert_level === 'severe' ? 85 : data.risk_summary.alert_level === 'high' ? 65 : 40,
        indicators: data.health_advisory.health_impacts.slice(0, 3),
      },
      cardiovascular: {
        summary: data.health_advisory.health_impacts[2] ?? 'No data available.',
        severity: data.risk_summary.alert_level === 'severe' ? 72 : data.risk_summary.alert_level === 'high' ? 55 : 30,
        indicators: data.health_advisory.health_impacts.slice(2, 5),
      },
      vulnerability: {
        demographic: data.health_advisory.vulnerable_groups.slice(0, 3).join(', '),
        riskFactor: data.health_advisory.vulnerable_groups.length > 3
          ? `Includes ${data.health_advisory.vulnerable_groups.slice(3).join(', ')}`
          : 'Standard population risk factors.',
      },
      longTerm: data.health_advisory.health_impacts[data.health_advisory.health_impacts.length - 1] ?? '',
    },
  };
}

// ── Default city ─────────────────────────────

export const defaultCity = 'Delhi';

/**
 * Fetch city risk data.
 *
 * Calls the REAL backend at /api/v1/dashboard/insights and transforms
 * the response into the legacy CityRiskData shape for backward compat.
 *
 * New code should use `fetchDashboardInsights()` directly from
 * `@/services/dashboard` instead.
 */
export async function fetchCityRisk(cityName: string): Promise<CityRiskData> {
  const data = await fetchDashboardInsights(cityName);
  return transformToLegacy(data);
}
