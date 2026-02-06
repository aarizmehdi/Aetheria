import React, { useRef, useEffect } from 'react';
import { WeatherCondition } from '../types';

interface WeatherCanvasProps {
  condition: WeatherCondition;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  type: 'rain' | 'snow';
}

const WeatherCanvas: React.FC<WeatherCanvasProps> = ({ condition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const initParticles = () => {
      particles = [];
      const isRain = [WeatherCondition.Rain, WeatherCondition.Thunderstorm, WeatherCondition.Drizzle].includes(condition);
      const isSnow = condition === WeatherCondition.Snow;

      if (!isRain && !isSnow) return;

      const count = isRain ? 400 : 150;

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: Math.random() * (isRain ? 15 : 2) + (isRain ? 20 : 1),
          size: Math.random() * (isRain ? 2 : 3) + 1,
          alpha: Math.random() * 0.4 + 0.1,
          type: isRain ? 'rain' : 'snow'
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.fillStyle = p.type === 'snow' ? '#ffffff' : '#a5b4fc';
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();

        if (p.type === 'snow') {

          ctx.shadowBlur = 4;
          ctx.shadowColor = 'white';
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        } else {

          ctx.shadowBlur = 0;
          ctx.rect(p.x, p.y, 1, p.size * 5);
        }
        ctx.fill();

        p.y += p.vy;
        p.x += p.vx;


        if (p.type === 'snow') p.x += Math.sin(p.y * 0.02) * 0.5;


        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });


      if (condition === WeatherCondition.Thunderstorm) {
        if (Math.random() > 0.99) {
          ctx.fillStyle = 'white';
          ctx.globalAlpha = Math.random() * 0.3 + 0.1;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    initParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-1 pointer-events-none mix-blend-screen" />;
};

export default WeatherCanvas;