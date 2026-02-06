import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { WeatherData, GeminiInsight } from '../types';

export const generateWeatherInsight = async (weather: WeatherData): Promise<GeminiInsight> => {
  // ✅ FIX #1: Use correct Vite environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Debug logging
  console.log("🔑 API Key present:", apiKey ? "YES ✅" : "NO ❌");
  console.log("🔑 API Key length:", apiKey?.length || 0);

  if (!apiKey) {
    console.error("❌ GEMINI API KEY MISSING!");
    console.error("Make sure you have a .env file with VITE_GEMINI_API_KEY");
    return {
      outfit: "Wear layers. (API Key missing in .env file)",
      narrative: "The weather is changing. Configure your API key to unlock AI insights.",
      activity: "Check your .env file and add VITE_GEMINI_API_KEY",
      music: "Silence"
    };
  }

  try {
    // ✅ FIX #2: Correct SDK initialization
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ FIX #3: Use stable model name (Experimental 2.0 might be restricted)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            narrative: {
              type: SchemaType.STRING,
              description: "A poetic, artistic narrative about the weather feeling"
            },
            outfit: {
              type: SchemaType.STRING,
              description: "Specific fashionable outfit advice"
            },
            activity: {
              type: SchemaType.STRING,
              description: "Creative activity suggestion for this weather"
            },
            music: {
              type: SchemaType.STRING,
              description: "Music genre or vibe that matches the atmosphere"
            }
          },
          required: ["narrative", "outfit", "activity", "music"]
        }
      }
    });

    const prompt = `You are a poetic weather narrator and lifestyle advisor. 
    
Current weather in ${weather.location}:
- Condition: ${weather.condition}
- Temperature: ${weather.temp}°C
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h
- Time of Day: ${weather.isDay ? 'Day' : 'Night'}

Create a beautiful, artistic response with:

1. NARRATIVE: Write 2 evocative, poetic sentences that capture the FEELING and MOOD of this weather. Use vivid imagery, metaphors, and sensory details. Make it beautiful and memorable.

2. OUTFIT: Suggest a specific, fashionable outfit perfect for this weather. Include actual clothing items (e.g., "charcoal wool overcoat with cashmere turtleneck").

3. ACTIVITY: Recommend one creative, specific activity that matches this weather perfectly (e.g., "visit a cozy bookstore café and read poetry by the window").

4. MUSIC: Suggest a specific music genre or vibe that complements the atmospheric mood (e.g., "lo-fi jazz with rain sounds" or "ethereal ambient with piano").

Be creative, poetic, and inspiring! Make each response unique and tailored to this specific weather condition.`;

    console.log("🚀 Sending request to Gemini...");

    // ✅ FIX #4: Correct API call
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response text from Gemini");
    }

    console.log("✅ Gemini Response received:", text);

    const parsedResponse = JSON.parse(text) as GeminiInsight;
    console.log("🤖 AI Insight Generated:", parsedResponse);

    return parsedResponse;

  } catch (error: any) {
    console.error("❌ Gemini API Error:", error);
    console.error("Error message:", error?.message);
    console.error("Error details:", error?.response?.data || error);

    // Provide fallback with weather-specific content
    return {
      outfit: `Layer appropriately for ${weather.temp}°C - ${weather.temp > 20 ? 'light breathable fabrics' : 'warm insulated layers'}.`,
      narrative: `The ${weather.condition.toLowerCase()} weather paints the sky with its unique character, ${weather.isDay ? 'as daylight illuminates' : 'while night embraces'} the atmosphere.`,
      activity: weather.condition === 'Rain'
        ? "Brew your favorite tea and watch the rain from a cozy window spot."
        : weather.condition === 'Clear'
          ? "Take a refreshing walk and observe the changing light."
          : "Find comfort in the atmospheric mood of the day.",
      music: weather.condition === 'Rain'
        ? "Ambient rain sounds with soft piano"
        : weather.condition === 'Clear'
          ? "Uplifting indie folk"
          : "Atmospheric soundscapes"
    };
  }
};