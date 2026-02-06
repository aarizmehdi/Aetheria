<div align="center">
  <img src="./public/favicon.svg" alt="Aetheria Logo" width="120" />
  <h1 style="font-size: 3rem; letter-spacing: 0.2em; text-transform: uppercase;">A E T H E R I A</h1>
  <p style="font-size: 1.2rem; margin-top: -10px; opacity: 0.8;">The Future of Atmospheric Visualization</p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#technology">Technology</a> •
    <a href="#compatibility">Compatibility</a> •
    <a href="#installation">Installation</a>
  </p>
</div>

---

## 🌌 Overview

**Aetheria Forecast** is not just a weather app; it is a **sensory experience**. By merging high-fidelity WebGL planetary rendering, procedurally generated audio, and generative AI, Aetheria transforms raw meteorological data into a living, breathing digital organism. It is designed for those who demand more than just numbers—those who want to **feel** the atmosphere.

## 💎 Premium Features

### 1. 🌍 Hyper-Real 3D Globe
A physically based rendering engine powered by **Three.js**.
-   **Real-Time Lighting**: The sun's position is calculated accurately based on the user's local time.
-   **Atmospheric Scattering**: Custom shaders simulate the Rayleigh and Mie scattering of light through the atmosphere.
-   **Interactive Navigation**: Spin, zoom, and explore the planet with fluid momentum-based controls.

### 2. 🧠 Aetheria Intelligence (AI Assistant)
Powered by **Google Gemini Pro**, Aetheria doesn't just tell you the temperature; it acts as your personal atmospheric concierge.
-   **Narrative Engine**: Generates poetic, context-aware descriptions of the current vibe (e.g., *"The sky is a vast, unblemished canvas of infinite blue."*).
-   **Stylist**: Suggests specific, high-fashion text-wear outfits suitable for the weather.
-   **Curator**: Recommends music genres and activities that perfectly match the atmospheric mood.
-   **"Alive" Interaction**: UI cards levitate, rotate, and glow neon upon interaction.

### 3. 🔊 Procedural Audio Core
A custom-built `AudioContext` engine that generates soundscapes in real-time.
-   **Pink Noise Synthesis**: Rain and wind sounds are synthesized mathematically, not played from static files.
-   **Dynamic Filtering**: Audio frequencies shift based on wind speed and precipitation intensity.
-   **Immersive**: The soundscape evolves as the weather changes.

### 4. 🌩️ Physics-Based Particle System
-   **HTML5 Canvas Integration**: Millions of particles simulate rain, snow, and fog.
-   **Wind Physics**: Precipitation angles react dynamically to real-time wind speed data.
-   **Performance**: Highly optimized for 60FPS on modern devices.

---

## 📱 Device Compatibility

Aetheria is built with a **"Fluid-Adaptive"** architecture that ensures a premium experience across all form factors.

| Device | Optimized Experience |
| :--- | :--- |
| **Desktop 🖥️** | **Command Center Mode**: No scrolling. Full-screen 3D globe. High-density data grid. Mouse hover interactions enabled. |
| **Tablet 📱** | **Hybrid Mode**: Touch-optimized controls. Adaptive layout scaling (133% view). Smooth gyroscope-like feel. |
| **Mobile 📲** | **Explorer Mode**: Vertical kinetic scrolling. Haptic-style tap interactions. Minimized UI for maximum immersion. Battery-saver friendly. |

---

## 🛠️ Technology Stack

*   **Core**: React 19, TypeScript
*   **Visuals**: Three.js (WebGL), GSAP (Animation), Tailwind CSS
*   **Data**: Open-Meteo API (Global Weather Data)
*   **Intelligence**: Google Gemini AI (Generative Context)
*   **Icons**: Lucide React (Customized)

---

## 🚀 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/aarizmehdi/aetheria.git
    cd aetheria
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Experience**
    ```bash
    npm run dev
    ```
    *The application will launch at `http://localhost:5173`*

---

<div align="center">
  <p style="opacity: 0.6; font-size: 0.8rem;">
    Designed & Engineered by <strong>Aariz Mehdi</strong>
    <br/>
    Creative Coding • WebGL • Interactive Systems
  </p>
</div>
