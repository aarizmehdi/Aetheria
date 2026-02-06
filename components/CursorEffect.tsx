import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { WeatherCondition } from '../types';

interface CursorEffectProps {
  condition: WeatherCondition | null;
}

const CursorEffect: React.FC<CursorEffectProps> = ({ condition }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;


      if (cursorRef.current) {
        gsap.set(cursorRef.current, { x: clientX, y: clientY });
      }


      if (followerRef.current) {
        gsap.to(followerRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.6,
          ease: "power3.out"
        });
      }
    };


    window.addEventListener('mousemove', onMouseMove);


    const onMouseDown = () => {
      if (cursorRef.current) gsap.to(cursorRef.current, { scale: 0.8, duration: 0.1 });
      if (followerRef.current) gsap.to(followerRef.current, { scale: 1.5, opacity: 0.5, duration: 0.2 });
    };
    const onMouseUp = () => {
      if (cursorRef.current) gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
      if (followerRef.current) gsap.to(followerRef.current, { scale: 1, opacity: 1, duration: 0.2 });
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.style.cursor = 'auto';
    };
  }, []);



  let cursorClasses = "bg-white w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]";
  let followerClasses = "border border-white/30 w-10 h-10 rounded-full bg-white/5";

  if (condition) {
    switch (condition) {
      case WeatherCondition.Clear:

        cursorClasses = "bg-yellow-300 w-3 h-3 rounded-full shadow-[0_0_20px_rgba(253,224,71,0.9)]";
        followerClasses = "border border-yellow-400/40 w-12 h-12 rounded-full bg-yellow-400/5 shadow-[0_0_30px_rgba(253,224,71,0.2)]";
        break;

      case WeatherCondition.Rain:
      case WeatherCondition.Drizzle:


        cursorClasses = "bg-cyan-400 w-3 h-3 rounded-tl-[0] rounded-br-[50%] rounded-tr-[50%] rounded-bl-[50%] rotate-[-45deg] shadow-[0_0_15px_rgba(34,211,238,0.8)]";
        followerClasses = "border border-cyan-400/30 w-10 h-10 rounded-full bg-cyan-400/5";
        break;

      case WeatherCondition.Snow:

        cursorClasses = "bg-white w-2 h-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] blur-[0.5px]";
        followerClasses = "border border-white/40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-[1px]";
        break;

      case WeatherCondition.Thunderstorm:

        cursorClasses = "bg-purple-300 w-3 h-3 rounded-full shadow-[0_0_25px_rgba(216,180,254,1)] animate-pulse";
        followerClasses = "border-2 border-dashed border-purple-400/30 w-14 h-14 rounded-full bg-purple-500/5 animate-[spin_8s_linear_infinite]";
        break;

      case WeatherCondition.Cloudy:
      case WeatherCondition.Fog:

        cursorClasses = "bg-gray-200 w-6 h-6 rounded-full blur-[4px] opacity-60";
        followerClasses = "border border-gray-400/20 w-16 h-16 rounded-full bg-gray-400/5 scale-110";
        break;

      default:
        break;
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden mix-blend-screen">
      <div
        ref={cursorRef}
        className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${cursorClasses}`}
      />
      <div
        ref={followerRef}
        className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${followerClasses}`}
      />
    </div>
  );
};

export default CursorEffect; 
