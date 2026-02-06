import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeatherData, GeminiInsight } from '../types';

const MODELS_TO_TRY = [
  "gemini-3-pro-preview"
];

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

const capitalize = (str: string): string => {
  if (!str) return str;
  const upperCount = str.replace(/[^A-Z]/g, "").length;
  const isShouting = upperCount > str.length / 2;
  if (isShouting) return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatResponse = (insight: GeminiInsight): GeminiInsight => {
  return {
    narrative: capitalize(insight.narrative),
    outfit: capitalize(insight.outfit),
    activity: capitalize(insight.activity),
    music: capitalize(insight.music)
  };
};

export const generateWeatherInsight = async (weather: WeatherData): Promise<GeminiInsight> => {
  const getLocalInsight = () => {
    let conditionKey = 'Clear';
    const cond = weather.condition.toLowerCase();

    if (cond.includes('cloud') || cond.includes('overcast')) conditionKey = 'Cloudy';
    else if (cond.includes('rain')) conditionKey = 'Rain';
    else if (cond.includes('snow')) conditionKey = 'Snow';
    else if (cond.includes('thunder') || cond.includes('storm')) conditionKey = 'Thunderstorm';
    else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haxe')) conditionKey = 'Fog';
    else if (cond.includes('drizzle')) conditionKey = 'Drizzle';

    const narratives = MOCK_NARRATIVES[conditionKey as keyof typeof MOCK_NARRATIVES] || MOCK_NARRATIVES.Clear;
    const narrative = narratives[Math.floor(Math.random() * narratives.length)];
    const activity = MOCK_ACTIVITIES[conditionKey as keyof typeof MOCK_ACTIVITIES] || "Explore the unknown.";
    const music = MOCK_MUSIC[conditionKey as keyof typeof MOCK_MUSIC] || "Silence";
    const outfit = MOCK_OUTFITS[conditionKey as keyof typeof MOCK_OUTFITS] || "Prepare for anything.";

    return formatResponse({
      narrative,
      outfit,
      activity,
      music
    });
  };

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return new Promise(resolve => setTimeout(() => resolve(getLocalInsight()), 800));
  }

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

      IMPORTANT: Ensure no spelling errors and perfect grammar.
    `;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text) as GeminiInsight;
        return formatResponse(parsed);

      } catch (innerError: any) {
      }
    }
    throw new Error("All models failed");

  } catch (error) {
    return getLocalInsight();
  }
}; 
