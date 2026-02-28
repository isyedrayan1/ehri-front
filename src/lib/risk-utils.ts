import type { AlertLevel, MetricSeverityLevel, DynamicAlertSeverity } from '@/types/api';

// ── EHRI Score Color (existing, unchanged) ───

export function getRiskColor(score: number): string {
  if (score <= 25) return "rgb(34 197 94)"; // Green-500 (Safe)
  if (score <= 50) return "rgb(234 179 8)"; // Yellow-500 (Moderate)
  if (score <= 75) return "rgb(249 115 22)"; // Orange-500 (High)
  return "rgb(239 68 68)"; // Red-500 (Severe)
}

export function getRiskLabel(score: number): string {
  if (score <= 25) return "Low Risk";
  if (score <= 50) return "Moderate Risk";
  if (score <= 75) return "High Risk";
  return "Severe Risk";
}

// ── Alert Level → Color (backend alert_level strings) ───

export function getAlertLevelColor(level: AlertLevel): string {
  switch (level) {
    case 'low':      return 'rgb(34 197 94)';   // Green-500
    case 'moderate': return 'rgb(245 158 11)';   // Amber-500
    case 'high':     return 'rgb(249 115 22)';   // Orange-500
    case 'severe':   return 'rgb(239 68 68)';    // Red-500
    default:         return 'rgb(148 163 184)';  // Slate-400
  }
}

export function getAlertLevelLabel(level: AlertLevel): string {
  switch (level) {
    case 'low':      return 'Low Risk';
    case 'moderate': return 'Moderate Risk';
    case 'high':     return 'High Risk';
    case 'severe':   return 'Severe Risk';
    default:         return 'Unknown';
  }
}

export function getAlertLevelClasses(level: AlertLevel): string {
  switch (level) {
    case 'low':      return 'text-green-600 bg-green-50 border-green-100';
    case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'high':     return 'text-orange-600 bg-orange-50 border-orange-100';
    case 'severe':   return 'text-red-600 bg-red-50 border-red-100';
    default:         return 'text-slate-600 bg-slate-50 border-slate-100';
  }
}

// ── Metric Severity → Color (per-metric severity from backend) ───

export function getMetricSeverityColor(severity: MetricSeverityLevel): string {
  switch (severity) {
    case 'safe':      return 'rgb(34 197 94)';   // Green-500
    case 'moderate':  return 'rgb(245 158 11)';   // Amber-500
    case 'unhealthy': return 'rgb(249 115 22)';   // Orange-500
    case 'hazardous': return 'rgb(239 68 68)';    // Red-500
    case 'info':      return 'rgb(99 102 241)';   // Indigo-500
    default:          return 'rgb(148 163 184)';  // Slate-400
  }
}

export function getMetricSeverityClasses(severity: MetricSeverityLevel): string {
  switch (severity) {
    case 'safe':      return 'text-green-600 bg-green-50 border-green-100';
    case 'moderate':  return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'unhealthy': return 'text-orange-600 bg-orange-50 border-orange-100';
    case 'hazardous': return 'text-red-600 bg-red-50 border-red-100';
    case 'info':      return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    default:          return 'text-slate-600 bg-slate-50 border-slate-100';
  }
}

export function getMetricSeverityLabel(severity: MetricSeverityLevel): string {
  switch (severity) {
    case 'safe':      return 'Safe';
    case 'moderate':  return 'Moderate';
    case 'unhealthy': return 'Unhealthy';
    case 'hazardous': return 'Hazardous';
    case 'info':      return 'Info';
    default:          return 'Unknown';
  }
}

// ── Dynamic Alert Severity → Color ───

export function getDynamicAlertColor(severity: DynamicAlertSeverity): string {
  switch (severity) {
    case 'critical': return 'rgb(220 38 38)';  // Red-600
    case 'warning':  return 'rgb(234 88 12)';  // Orange-600
    default:         return 'rgb(148 163 184)';
  }
}

export function getDynamicAlertClasses(severity: DynamicAlertSeverity): string {
  switch (severity) {
    case 'critical': return 'text-red-700 bg-red-50 border-red-200';
    case 'warning':  return 'text-orange-700 bg-orange-50 border-orange-200';
    default:         return 'text-slate-600 bg-slate-50 border-slate-100';
  }
}
