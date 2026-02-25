
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

export const citiesData: Record<string, CityRiskData> = {
  "Delhi": {
    city: "Delhi",
    ehri: 73.4,
    status: "High Risk – approaching severe threshold",
    pollutionStress: 0.82,
    heatStress: 0.68,
    humidityStress: 0.35,
    airQuality: {
      pm25: 128,
      status: "Unhealthy",
      trend: [110, 115, 120, 130, 125, 128, 128]
    },
    weather: {
      temp: 34,
      humidity: 62,
      condition: "Haze"
    },
    populationDensity: {
      value: "11,312/km²",
      context: "Critically high density exacerbating thermal stress."
    },
    topFactors: [
      { name: "PM2.5", value: 0.92 },
      { name: "Thermal Load", value: 0.74 },
      { name: "NO2", value: 0.61 }
    ],
    explanation: "Delhi's EHRI is primarily driven by chronic particulate matter concentrations and intense seasonal heat waves. The synergy between high density and stagnant air creates a significant health burden.",
    trend: [65, 68, 70, 72, 71, 72.5, 73.4],
    precautions: [
      { icon: "Shield", text: "Wear N95 mask outdoors" },
      { icon: "Activity", text: "Avoid peak-hour exertion" },
      { icon: "Droplets", text: "Maintain hyper-hydration" }
    ],
    healthImpact: {
      respiratory: {
        summary: "Critical particulate load causing acute airway inflammation.",
        severity: 85,
        indicators: ["Asthma exacerbation", "COPD stress", "Reduced FVC"]
      },
      cardiovascular: {
        summary: "Systemic oxidative stress linked to ultrafine particles.",
        severity: 72,
        indicators: ["Hypertension", "Arrhythmia risk", "Endothelial strain"]
      },
      vulnerability: {
        demographic: "Elderly and children under 5",
        riskFactor: "Chronic exposure to PM2.5 levels exceeding WHO limits by 10x."
      },
      longTerm: "Sustained exposure leads to permanent reduction in lung capacity and increased risk of ischemic heart disease."
    }
  },
  "Mumbai": {
    city: "Mumbai",
    ehri: 52.1,
    status: "Moderate Risk – stable baseline",
    pollutionStress: 0.45,
    heatStress: 0.55,
    humidityStress: 0.85,
    airQuality: {
      pm25: 65,
      status: "Moderate",
      trend: [60, 62, 68, 70, 65, 63, 65]
    },
    weather: {
      temp: 31,
      humidity: 78,
      condition: "Humid"
    },
    populationDensity: {
      value: "21,000/km²",
      context: "Extreme density contributing to coastal humidity entrapment."
    },
    topFactors: [
      { name: "Humidity", value: 0.88 },
      { name: "Sea Salt", value: 0.32 },
      { name: "Traffic", value: 0.64 }
    ],
    explanation: "Coastal moisture trapping and high vehicle density are the core factors in Mumbai. While air turnover is better than inland cities, humidity significantly modifies the perceived risk.",
    trend: [50, 51, 53, 52, 51, 52, 52.1],
    precautions: [
      { icon: "Home", text: "Use dehumidifiers indoors" },
      { icon: "Wind", text: "Seek ventilated spaces" },
      { icon: "Sun", text: "Limit UV exposure" }
    ],
    healthImpact: {
      respiratory: {
        summary: "High moisture and vehicular emissions trap pollutants at ground level.",
        severity: 54,
        indicators: ["Mold allergies", "Rhinitis", "Airway hyper-reactivity"]
      },
      cardiovascular: {
        summary: "Thermal stress exacerbates underlying cardiovascular conditions.",
        severity: 48,
        indicators: ["Tachycardia", "Dehydration strain", "Edema risk"]
      },
      vulnerability: {
        demographic: "Traffic workers and commuters",
        riskFactor: "Exposure to elevated humidity levels trapping PM10."
      },
      longTerm: "Chronic respiratory stress from allergen-pollutant synergy."
    }
  },
  "Chennai": {
    city: "Chennai",
    ehri: 44.8,
    status: "Moderate Risk – low pollution threshold",
    pollutionStress: 0.35,
    heatStress: 0.75,
    humidityStress: 0.80,
    airQuality: {
      pm25: 42,
      status: "Good",
      trend: [38, 40, 45, 42, 41, 43, 42]
    },
    weather: {
      temp: 32,
      humidity: 75,
      condition: "Clear"
    },
    populationDensity: {
      value: "14,350/km²",
      context: "Moderate density with significant thermal island effects."
    },
    topFactors: [
      { name: "Heat Stress", value: 0.78 },
      { name: "Humidity", value: 0.72 },
      { name: "SO2", value: 0.25 }
    ],
    explanation: "Chennai faces predominantly thermal stress rather than particulate pollution. Sea breezes provide daily relief, maintaining overall EHRI in the moderate range.",
    trend: [42, 43, 44, 44, 45, 44.5, 44.8],
    precautions: [
      { icon: "GlassWater", text: "Drink electrolyte fluids" },
      { icon: "Shirt", text: "Wear breathable fabrics" },
      { icon: "Clock", text: "Monitor wet-bulb temp" }
    ],
    healthImpact: {
      respiratory: {
        summary: "Low particulate risk; primary stress is humidity-linked mucosal irritation.",
        severity: 35,
        indicators: ["Mucosal dryness", "Sinusitis risk", "Allergic triggers"]
      },
      cardiovascular: {
        summary: "Thermal load requires efficient thermoregulation.",
        severity: 78,
        indicators: ["Heat exhaustion", "Renal strain", "Fluid imbalance"]
      },
      vulnerability: {
        demographic: "Outdoor laborers and children",
        riskFactor: "Intense wet-bulb temperatures leading to thermal fatigue."
      },
      longTerm: "Chronic heat exposure risk for kidney health."
    }
  },
  "Bangalore": {
    city: "Bangalore",
    ehri: 31.5,
    status: "Low Risk – optimal conditions",
    pollutionStress: 0.30,
    heatStress: 0.25,
    humidityStress: 0.40,
    airQuality: {
      pm25: 28,
      status: "Excellent",
      trend: [25, 27, 30, 28, 29, 28, 28]
    },
    weather: {
      temp: 24,
      humidity: 55,
      condition: "Cloudy"
    },
    populationDensity: {
      value: "4,381/km²",
      context: "Balanced density with significant green cover."
    },
    topFactors: [
      { name: "Pollen", value: 0.55 },
      { name: "Ozone", value: 0.32 },
      { name: "Construction", value: 0.45 }
    ],
    explanation: "Bangalore maintains one of the lowest EHRI scores among metros due to elevation and vegetation. Seasonal pollen and construction dust are the primary minor stressors.",
    trend: [30, 31, 32, 31, 31, 32, 31.5],
    precautions: [
      { icon: "Smile", text: "Enjoy outdoor activities" },
      { icon: "Flower2", text: "Monitor allergy alerts" },
      { icon: "Filter", text: "Indoor HEPA recommended" }
    ],
    healthImpact: {
      respiratory: {
        summary: "Particulate-low environment with seasonal bio-aerosol risk.",
        severity: 28,
        indicators: ["Pollen allergies", "Hay fever", "Allergic asthma"]
      },
      cardiovascular: {
        summary: "Minimal environmental strain on heart and vessels.",
        severity: 22,
        indicators: ["Low stress levels", "Healthy BP baseline", "Stable thermoregulation"]
      },
      vulnerability: {
        demographic: "Individuals with seasonal allergies",
        riskFactor: "Urban vegetation diversity leading to high pollen counts."
      },
      longTerm: "Optimal urban living environment for metabolic and respiratory longevity."
    }
  },
  "Kolkata": {
    city: "Kolkata",
    ehri: 61.2,
    status: "High Risk – rising particulate trend",
    pollutionStress: 0.72,
    heatStress: 0.58,
    humidityStress: 0.65,
    airQuality: {
      pm25: 94,
      status: "Unhealthy for Sensitive Groups",
      trend: [80, 85, 90, 95, 92, 94, 94]
    },
    weather: {
      temp: 30,
      humidity: 70,
      condition: "Mist"
    },
    populationDensity: {
      value: "24,000/km²",
      context: "Extremely high density limiting air circulation."
    },
    topFactors: [
      { name: "Particulates", value: 0.78 },
      { name: "Coal Emissions", value: 0.45 },
      { name: "Humidity", value: 0.68 }
    ],
    explanation: "Kolkata suffers from high population density and winter temperature inversions that trap industrial and domestic emissions, leading to high seasonal EHRI spikes.",
    trend: [55, 57, 59, 60, 62, 61, 61.2],
    precautions: [
      { icon: "Shield", text: "High-grade mask outdoors" },
      { icon: "Fan", text: "Use air purification" },
      { icon: "Stethoscope", text: "Monitor respiratory health" }
    ],
    healthImpact: {
      respiratory: {
        summary: "Frequent winter inversions leading to high-load airway stress.",
        severity: 74,
        indicators: ["Chronic bronchitis", "Reduced peak flow", "Frequent infections"]
      },
      cardiovascular: {
        summary: "Particulate-linked micro-vascular inflammation risk.",
        severity: 65,
        indicators: ["Ischemic events risk", "Systemic inflammation", "Vascular stiffening"]
      },
      vulnerability: {
        demographic: "Slum populations and high-density zones",
        riskFactor: "Restricted air flow in high-density areas trapping PM."
      },
      longTerm: "Significant impact on overall life expectancy due to cumulative particulate load."
    }
  }
};

export const defaultCity = "Delhi";
