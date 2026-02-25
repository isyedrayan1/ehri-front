
export interface CityRiskData {
  city: string;
  ehri: number;
  pollutionStress: number;
  heatStress: number;
  humidityStress: number;
  topFactors: { name: string; value: number }[];
  explanation: string;
  trend: number[];
}

export const citiesData: Record<string, CityRiskData> = {
  "Delhi": {
    city: "Delhi",
    ehri: 74.3,
    pollutionStress: 0.82,
    heatStress: 0.68,
    humidityStress: 0.35,
    topFactors: [
      { name: "PM2.5", value: 0.92 },
      { name: "Temperature", value: 0.74 },
      { name: "NO2", value: 0.61 }
    ],
    explanation: "Environmental stress in Delhi is elevated primarily due to chronic high particulate matter (PM2.5) concentrations combined with rising seasonal temperatures. Industrial emissions and vehicular traffic are significant contributors, posing severe respiratory risks to the general population.",
    trend: [65, 68, 70, 72, 74.3]
  },
  "Singapore": {
    city: "Singapore",
    ehri: 32.1,
    pollutionStress: 0.25,
    heatStress: 0.55,
    humidityStress: 0.88,
    topFactors: [
      { name: "Humidity", value: 0.91 },
      { name: "Heat Island", value: 0.64 },
      { name: "PM10", value: 0.21 }
    ],
    explanation: "Singapore maintains low pollution levels, but humidity and heat stress are high. The urban heat island effect is the primary environmental health concern, though overall risk remains moderate thanks to excellent air quality management.",
    trend: [35, 33, 31, 32, 32.1]
  },
  "London": {
    city: "London",
    ehri: 48.5,
    pollutionStress: 0.42,
    heatStress: 0.35,
    humidityStress: 0.45,
    topFactors: [
      { name: "NO2", value: 0.58 },
      { name: "Pollen", value: 0.44 },
      { name: "Particulates", value: 0.38 }
    ],
    explanation: "London faces moderate environmental risks, with nitrogen dioxide (NO2) being a persistent concern in central corridors. Recent trends show a steady improvement in overall EHRI due to expanded low-emission zones.",
    trend: [58, 55, 52, 50, 48.5]
  },
  "Phoenix": {
    city: "Phoenix",
    ehri: 82.7,
    pollutionStress: 0.45,
    heatStress: 0.95,
    humidityStress: 0.15,
    topFactors: [
      { name: "Extreme Heat", value: 0.98 },
      { name: "Ozone", value: 0.62 },
      { name: "UV Index", value: 0.85 }
    ],
    explanation: "Phoenix is experiencing critical environmental health risks driven by extreme heat waves. Prolonged high temperatures present significant cardiovascular strain, making outdoor activities hazardous during summer months.",
    trend: [72, 75, 78, 80, 82.7]
  }
};

export const defaultCity = "Delhi";
