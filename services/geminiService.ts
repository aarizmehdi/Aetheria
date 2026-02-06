import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeatherData, GeminiInsight } from '../types';

const MOCK_NARRATIVES = {
  Clear: ["The sky is a vast, unblemished canvas of infinite blue.", "Sunlight pierces through, illuminating the world in high definition."],
  Cloudy: ["A blanket of soft grey diffusion wraps the horizon.", "The world is soft, quiet, and wrapped in cotton clouds."],
  Rain: ["Rhythm of the falling sky creates a melancholic symphony.", "Nature's tears cleanse the concrete jungle."],
  Snow: ["Silence falls with the snow, hushing the busy world.", "A pristine layer of white transforms the familiar into the unknown."],
  Thunderstorm: ["The atmosphere crackles with raw, electric energy.", "Nature displays its power in flashes of brilliance and sound."],
  Fog: ["The world dissolves into a mysterious, hazy dream.", "Visibility fades, turning the familiar into a ghostly silhouette."],
  Drizzle: ["A gentle mist kisses the earth.", "Soft droplets create a texture on the air."]
};

const MOCK_ACTIVITIES = {
  Clear: "Perfect for high-altitude photography or a rooftop sunset session.",
  Cloudy: "Ideal for visiting a brutalist architecture museum or deep work.",
  Rain: "Find a jazz bar with a view of the wet streets.",
  Snow: "Capture the silence in an audio field recording.",
  Thunderstorm: "Watch the show from a safe, glass-walled vantage point.",
  Fog: "Cinematic walk through an empty park.",
  Drizzle: "A brisk walk with a waterproof trench coat."
};

const MOCK_MUSIC = {
  Clear: "Synthwave / Solar Punk",
  Cloudy: "Lo-Fi / Ambient",
  Rain: "Dark Jazz / Noir",
  Snow: "Neoclassical / Piano",
  Thunderstorm: "Industrial / Bass",
  Fog: "Drone / Ethereal",
  Drizzle: "Indie / Acoustic"
};

const MOCK_OUTFITS = {
  Clear: "Sunglasses mandatory. Light fabrics, sharp lines.",
  Cloudy: "Monochrome layers. Texture over color.",
  Rain: "Technical waterproof shell. Gore-Tex boots.",
  Snow: "Heavy wool overcoat. Thermal layers. Scarf.",
  Thunderstorm: "Stay inside. If out, full tech-wear protection.",
  Fog: "High collar coat. Mystery vibes.",
  Drizzle: "Water-resistant windbreaker."
};

export const generateWeatherInsight = async (weather: WeatherData): Promise<GeminiInsight> => {

  const getLocalInsight = () => {
    const narratives = MOCK_NARRATIVES[weather.condition as keyof typeof MOCK_NARRATIVES] || MOCK_NARRATIVES.Clear;
    const narrative = narratives[Math.floor(Math.random() * narratives.length)];
    const activity = MOCK_ACTIVITIES[weather.condition as keyof typeof MOCK_ACTIVITIES] || "Explore the unknown.";
    const music = MOCK_MUSIC[weather.condition as keyof typeof MOCK_MUSIC] || "Silence";
    const outfit = MOCK_OUTFITS[weather.condition as keyof typeof MOCK_OUTFITS] || "Prepare for anything.";

    return {
      narrative,
      outfit,
      activity,
      music
    };
  };

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    console.log("Aetheria: Running on Local Intelligence (No API Key or Placeholder detected)");
    return new Promise(resolve => setTimeout(() => resolve(getLocalInsight()), 800));
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Current weather in ${weather.location}:
      Condition: ${weather.condition}
      Temperature: ${weather.temp}°C
      Humidity: ${weather.humidity}%
      Wind: ${weather.windSpeed} km/h
      
      Provide a JSON object with:
      1. 'narrative': A short, artistic, poetic narrative describing the feeling of this weather (max 2 sentences).
      2. 'outfit': Specific, fashionable outfit advice.
      3. 'activity': A distinct, creative activity suggestion suitable for this specific weather.
      4. 'music': A genre or specific vibe of music that fits the atmosphere.
      
      Output strictly JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText) as GeminiInsight;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getLocalInsight();
  }
};