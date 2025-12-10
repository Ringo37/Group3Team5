export function getWeatherLabel(code: number): string {
  if (code === 0) return "SUNNY";
  if (code >= 1 && code <= 3) return "CLOUDY";
  if (code >= 45 && code <= 48) return "FOGGY";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "RAINY";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "SNOWY";
  if (code >= 95) return "THUNDERSTORM";
  return "SUNNY";
}

export async function fetchCurrentWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API Error");

  const data = await res.json();
  const current = data.current;

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    weather: getWeatherLabel(current.weather_code),
  };
}
