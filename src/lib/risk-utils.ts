
export function getRiskColor(score: number): string {
  if (score <= 25) return "rgb(34 197 94)"; // Green-500
  if (score <= 50) return "rgb(234 179 8)"; // Yellow-500
  if (score <= 75) return "rgb(249 115 22)"; // Orange-500
  return "rgb(239 68 68)"; // Red-500
}

export function getRiskLabel(score: number): string {
  if (score <= 25) return "Low Risk";
  if (score <= 50) return "Moderate Risk";
  if (score <= 75) return "High Risk";
  return "Severe Risk";
}
