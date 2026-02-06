import React, { useState, useEffect, useRef } from 'react';
import { GeminiInsight } from '../types';
import { Sparkles, Shirt, Music, Activity, Terminal, Cpu } from 'lucide-react';

interface GeminiAssistantProps {
  insight: GeminiInsight | null;
  loading: boolean;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ insight, loading }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCards, setShowCards] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);


  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);


  useEffect(() => {
    if (insight?.narrative) {
      setDisplayedText('');
      setShowCards(false);
      let i = 0;
      const text = insight.narrative;


      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);

          setTimeout(() => setShowCards(true), 400);
        }
      }, 30);

      return () => clearInterval(typeInterval);
    }
  }, [insight]);

  if (loading) {
    return (
      <div className="mt-8 p-6 w-full max-w-2xl border-l-2 border-white/20 bg-gradient-to-r from-white/5 to-transparent animate-pulse rounded-[2rem]">
        <div className="flex items-center gap-2 mb-4 opacity-50">
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] font-mono tracking-widest uppercase">ANALYZING_ATMOSPHERIC_DATA...</span>
        </div>
        <div className="h-4 bg-white/10 w-3/4 mb-2 rounded-sm"></div>
        <div className="h-4 bg-white/10 w-1/2 rounded-sm"></div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="mt-12 w-full max-w-3xl group z-10 relative">

      <div className="flex items-center gap-3 mb-4 opacity-70">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-200 uppercase">AETHERIA_INTELLIGENCE</span>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
      </div>


      <div className="relative min-h-[60px] mb-8">
        <p className="text-lg md:text-xl text-white/95 font-light leading-relaxed font-serif tracking-wide">
          {displayedText}
          <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} text-cyan-400 font-bold ml-1 transition-opacity duration-100`}>_</span>
        </p>
      </div>


      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-1000 ease-out ${showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>


        <div className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/5 p-5 rounded-[2rem] hover:bg-white/10 transition-all hover:scale-[1.02] group/card">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/card:opacity-30 transition-opacity"><Shirt className="w-8 h-8 text-white" /></div>
          <h4 className="text-[9px] font-mono text-indigo-300 uppercase tracking-widest mb-2">SUIT_PROTOCOL</h4>
          <p className="text-xs text-white/80 font-light leading-relaxed">{insight.outfit}</p>
        </div>


        <div className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/5 p-5 rounded-[2rem] hover:bg-white/10 transition-all hover:scale-[1.02] group/card">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/card:opacity-30 transition-opacity"><Activity className="w-8 h-8 text-white" /></div>
          <h4 className="text-[9px] font-mono text-emerald-300 uppercase tracking-widest mb-2">ACTION_VECTOR</h4>
          <p className="text-xs text-white/80 font-light leading-relaxed">{insight.activity}</p>
        </div>


        <div className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/5 p-5 rounded-[2rem] hover:bg-white/10 transition-all hover:scale-[1.02] group/card">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/card:opacity-30 transition-opacity"><Music className="w-8 h-8 text-white" /></div>
          <h4 className="text-[9px] font-mono text-rose-300 uppercase tracking-widest mb-2">SONIC_AMBIENCE</h4>
          <p className="text-xs text-white/80 font-light leading-relaxed">{insight.music}</p>
        </div>

      </div>
    </div>
  );
};

export default GeminiAssistant;