# Aetheria - Immersive Weather Visualization

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Author](https://img.shields.io/badge/Author-Aariz_Mehdi-purple.svg)

**Aetheria** is a hyper-advanced weather dashboard that redefines how users interact with meteorological data. By combining WebGL planetary rendering, procedural audio synthesis, and intelligent forecasting, Aetheria transforms simple data points into a visceral, cinematic experience.

## 🌟 Key Features

*   **Real-Time 3D Planetary Rendering**: A highly optimized Three.js engine renders a physically based Earth with accurate atmospheric scattering, dynamic cloud layers, and real-time lighting based on local time.
*   **Procedural Audio Engine**: A custom `AudioContext` implementation generates weather sounds (rain, wind, thunder) in real-time using pink noise algorithms and bandpass filters, eliminating the need for external asset loading.
*   **Fluid Physics**: Custom canvas particle systems simulate rain, snow, and thunderstorms with physics-based movement and wind interaction.
*   **Intelligent Insights**: Integrated analysis provides narrative descriptions, outfit recommendations, and activity suggestions based on complex weather patterns.
*   **Global Search & Geocoding**: Instant city lookup with sub-millisecond latency animations.

## 🛠️ Technology Stack

*   **Frontend**: React 19, TypeScript
*   **3D Engine**: Three.js (WebGL)
*   **Animation**: GSAP (GreenSock Animation Platform)
*   **Styling**: Tailwind CSS
*   **Data**: Open-Meteo API
*   **Icons**: Lucide React

## 🚀 Installation & Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/aariz-mehdi/aetheria.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 🔋 Performance Optimization

This application implements aggressive performance techniques:
*   **Visibility Awareness**: The 3D render loop automatically pauses when the tab is inactive to preserve battery life on mobile devices.
*   **Garbage Collection**: Strict recursive disposal of WebGL geometries and textures prevents memory leaks during page navigation.
*   **Adaptive Quality**: Pixel ratio capping ensures smooth framerates on high-DPI (Retina) displays.

## 👤 Author

**Aariz Mehdi**
*   Full Stack Engineer & UI/UX Specialist
*   Focus: Creative Coding, WebGL, Interactive Experiences

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*© 2025 Aariz Mehdi. All Rights Reserved.*