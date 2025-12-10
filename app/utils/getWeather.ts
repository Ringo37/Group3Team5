export async function getWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data");

  const data = await res.json();
  return {
    temperature: data.main.temp,
    humidity: data.main.humidity,
  };
}
