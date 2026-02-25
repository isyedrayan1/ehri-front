
import { citiesData, CityRiskData } from "@/data/mock-data";

export async function fetchCityRisk(cityName: string): Promise<CityRiskData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = citiesData[cityName];
      if (data) {
        resolve(data);
      } else {
        reject(new Error("Data unavailable for this city."));
      }
    }, 800);
  });
}
