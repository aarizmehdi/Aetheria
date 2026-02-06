import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Droplets, Wind, Sun, MapPin, Search, X, Loader2, Navigation, Volume2, VolumeX, Minimize2 } from 'lucide-react';
import gsap from 'gsap';
import { getWeatherData, getMockCoordinates, searchCities, reverseGeocode } from './services/weatherService';
import { generateWeatherInsight } from './services/geminiService';
import { audioService } from './services/audioService';
import { WeatherData, WeatherCondition, GeminiInsight, GeoSearchResult } from './types';
import ThreeGlobe from './components/ThreeGlobe';
import WeatherCanvas from './components/WeatherCanvas';
import GeminiAssistant from './components/GeminiAssistant';


const LoadingScreen: React.FC<{ loading: boolean }> = ({ loading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => { if (containerRef.current) containerRef.current.style.display = 'none'; }
      });
    }
  }, [loading]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black animate-pulse"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 border-t-[1px] border-l-[1px] border-cyan-400 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(34,211,238,0.5)]"></div>
        <h1 className="text-4xl md:text-6xl font-thin tracking-[0.3em] text-white/90">AETHERIA</h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="h-[1px] w-8 bg-cyan-500/50"></div>
          <p className="text-cyan-400/60 text-[10px] font-mono tracking-[0.4em] uppercase">System Initializing</p>
          <div className="h-[1px] w-8 bg-cyan-500/50"></div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [insight, setInsight] = useState<GeminiInsight | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [globeReady, setGlobeReady] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(true);
  const [muted, setMuted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const model = "gemini-1.5-flash";
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      if (!globeReady) {
        setGlobeReady(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [globeReady]);

  const isAppLoading = dataLoading || !globeReady;

  useEffect(() => { handleLocateMe(); }, []);
  const handleGlobeLoad = () => setGlobeReady(true);


  useEffect(() => {
    const enableAudio = async () => {
      if (!audioInitialized) {
        await audioService.init();
        setAudioInitialized(true);
        setMuted(false);
        if (weather) audioService.playWeatherSound(weather.condition);
      }
    };
    window.addEventListener('click', enableAudio);
    return () => { window.removeEventListener('click', enableAudio); };
  }, [audioInitialized, weather]);

  const fetchWeather = async (lat?: number, lng?: number, name?: string) => {
    setDataLoading(true);
    setAiLoading(true);
    setSearchOpen(false);
    try {
      const coords = (lat && lng) ? { lat, lng, name } : getMockCoordinates();
      if (!coords.name && lat && lng) coords.name = await reverseGeocode(lat, lng);
      const data = await getWeatherData(coords);
      setWeather(data);
      setDataLoading(false);

      if (audioInitialized && !muted) audioService.playWeatherSound(data.condition);

      const aiData = await generateWeatherInsight(data);
      setInsight(aiData);
      setAiLoading(false);
    } catch (err) {
      console.error(err);
      setDataLoading(false);
      setAiLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { fetchWeather(position.coords.latitude, position.coords.longitude); },
        () => { fetchWeather(); },
        { enableHighAccuracy: true }
      );
    } else { fetchWeather(); }
  };

  useEffect(() => {
    if (!isAppLoading) {
      gsap.fromTo(".animate-reveal", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2 });
    }
  }, [isAppLoading]);


  const toggleMute = async () => {
    if (!audioInitialized) { await audioService.init(); setAudioInitialized(true); setMuted(false); if (weather) audioService.playWeatherSound(weather.condition); }
    else { setMuted(!muted); audioService.toggleMute(!muted); }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.length < 2) { setSuggestions([]); return; }
    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      const results = await searchCities(value);
      setSuggestions(results);
      setIsSearching(false);
    }, 400);
  };
  const handleSuggestionClick = (place: GeoSearchResult) => {
    const cityName = place.name;
    const region = place.admin1 ? `, ${place.admin1}` : '';
    const country = place.country ? `, ${place.country}` : '';
    fetchWeather(place.latitude, place.longitude, `${cityName}${region}${country}`);
  };
  useEffect(() => { if (searchOpen && searchInputRef.current) searchInputRef.current.focus(); }, [searchOpen]);

  const getGradient = (condition: WeatherCondition | undefined, isDay: boolean) => {
    if (!isDay) return 'from-[#0f172a] via-[#1e293b] to-[#020617]';
    switch (condition) {
      case WeatherCondition.Clear: return 'from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a]';
      case WeatherCondition.Cloudy: return 'from-[#475569] via-[#334155] to-[#0f172a]';
      case WeatherCondition.Rain: return 'from-[#1e3a8a] via-[#172554] to-[#020617]';
      case WeatherCondition.Snow: return 'from-[#60a5fa] via-[#3b82f6] to-[#1e3a8a]';
      default: return 'from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a]';
    }
  };

  return (
    <div className={`relative w-full text-white bg-black font-sans selection:bg-transparent ${weather ? 'min-h-screen overflow-y-auto md:h-screen md:overflow-hidden' : 'h-[100dvh] overflow-hidden'}`}>
      <LoadingScreen loading={isAppLoading} />

      <div className={`fixed inset-0 bg-gradient-to-b ${weather ? getGradient(weather.condition, weather.isDay) : 'from-black to-black'} z-0 transition-all duration-[2000ms] ease-in-out opacity-100`} />


      {weather && <ThreeGlobe condition={weather.condition} lat={weather.lat} lng={weather.lng} isDay={weather.isDay} onLoad={handleGlobeLoad} />}
      {weather && <WeatherCanvas condition={weather.condition} />}


      <div className="fixed inset-x-0 bottom-0 h-[40vh] md:h-[65vh] bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-0"></div>


      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-2xl flex items-start justify-center pt-32 px-6 animate-fadeIn transition-all">
          <div className="w-full max-w-2xl relative flex flex-col items-center">
            <button onClick={() => setSearchOpen(false)} className="absolute -top-20 right-0 text-white/50 hover:text-white transition-colors p-4 rounded-full border border-white/10 bg-white/5"><X className="w-6 h-6" /></button>
            <input ref={searchInputRef} type="text" value={searchQuery} onChange={handleSearchChange} placeholder="LOCATE_COORDINATES..." className="w-full bg-transparent border-b border-white/20 text-3xl font-mono text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 py-6 transition-all text-center uppercase tracking-widest" />
            {isSearching && <Loader2 className="mt-8 animate-spin text-cyan-400 w-8 h-8" />}
            <div className="w-full mt-8 max-h-[50vh] overflow-y-auto no-scrollbar space-y-2">
              {suggestions.map((place) => (
                <button key={place.id} onClick={() => handleSuggestionClick(place)} className="w-full text-left p-6 border-b border-white/10 hover:bg-white/5 transition-all flex justify-between items-center group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xl font-light text-white/90 tracking-wide">{place.name}</span>
                    <span className="text-xs font-mono text-white/40 mt-1 uppercase">{place.country} {place.admin1 && `/ ${place.admin1}`}</span>
                  </div>
                  <span className="text-cyan-400/0 group-hover:text-cyan-400/100 transition-all transform translate-x-4 group-hover:translate-x-0"><Navigation className="w-5 h-5" /></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      {weather && !isAppLoading && (
        <main className="relative z-10 w-full min-h-screen flex flex-col justify-between p-6 md:p-8 pointer-events-none pb-12 md:pb-8">


          <div className="flex justify-between items-start pointer-events-auto animate-reveal w-full pb-4">
            <div className="flex flex-col">
              <span className="text-4xl md:text-5xl font-thin tracking-tighter text-white/90 font-sans">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-white/40 uppercase">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={toggleMute} className="w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-lg hover:bg-white/10 hover:scale-105 transition-all pointer-events-auto cursor-pointer flex items-center justify-center shadow-xl">
                {muted ? <VolumeX className="w-5 h-5 text-white/50" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
              </button>
              <button onClick={handleLocateMe} className="w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-lg hover:bg-white/10 hover:scale-105 transition-all pointer-events-auto cursor-pointer flex items-center justify-center shadow-xl">
                <Navigation className="w-5 h-5 text-white/90" />
              </button>
              <button onClick={() => setSearchOpen(true)} className="w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-lg hover:bg-white/10 hover:scale-105 transition-all pointer-events-auto cursor-pointer flex items-center justify-center shadow-xl active:scale-95">
                <Search className="w-5 h-5 text-white/90" />
              </button>
            </div>
          </div>


          <div className="flex-grow"></div>


          <div className="flex flex-col lg:flex-row items-end gap-8 lg:gap-6 pointer-events-auto w-full mt-auto">


            <div className="flex flex-col w-full lg:flex-[1.618] animate-reveal">


              <div className="flex items-center gap-3 mb-2 text-white/60">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono tracking-[0.3em] uppercase border-b border-white/10 pb-1">{weather.location}</span>
                <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-sm">{weather.lat.toFixed(2)}N / {weather.lng.toFixed(2)}W</span>
              </div>


              <div className="relative -ml-2">
                <h1 className="text-[5rem] md:text-[9rem] lg:text-[12rem] font-thin leading-[0.8] tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] font-sans">
                  {weather.temp}°
                </h1>
              </div>

              <h2 className="text-4xl md:text-5xl font-light text-white/90 mt-2 drop-shadow-lg tracking-wide">{weather.condition}</h2>
              <p className="text-lg text-white/60 mt-4 font-light max-w-xl border-l border-cyan-500/30 pl-4">
                {weather.description}
              </p>


              <div className="mb-12 md:mb-0 w-full">
                <GeminiAssistant insight={insight} loading={aiLoading} />
              </div>
            </div>


            <div className="flex flex-col gap-5 w-full lg:flex-1 animate-reveal justify-end">


              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col hover:bg-white/10 transition-colors shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-white/40" />
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Wind</span>
                  </div>
                  <span className="text-2xl font-mono font-light text-white">{weather.windSpeed}<span className="text-xs ml-1 text-white/30">km/h</span></span>
                </div>
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col hover:bg-white/10 transition-colors shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-white/40" />
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Humid</span>
                  </div>
                  <span className="text-2xl font-mono font-light text-white">{weather.humidity}<span className="text-xs ml-1 text-white/30">%</span></span>
                </div>
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col hover:bg-white/10 transition-colors shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-white/40" />
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">UV</span>
                  </div>
                  <span className="text-2xl font-mono font-light text-white">{weather.uvIndex}<span className="text-xs ml-1 text-white/30">IDX</span></span>
                </div>
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col hover:bg-white/10 transition-colors shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Minimize2 className="w-4 h-4 text-white/40" />
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Press</span>
                  </div>
                  <span className="text-2xl font-mono font-light text-white">{weather.pressure}<span className="text-xs ml-1 text-white/30">hPa</span></span>
                </div>
              </div>


              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 w-full">
                {weather.forecast.slice(0, 4).map((day, idx) => (
                  <div key={idx} className="flex-1 min-w-[60px] flex flex-col items-center justify-center p-3 rounded-[2rem] bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all cursor-default group shadow-lg">
                    <span className="text-[9px] font-mono font-bold text-white/30 mb-2 uppercase tracking-wider group-hover:text-white/60 transition-colors">{day.day}</span>
                    {day.condition === WeatherCondition.Clear ? <Sun className="w-5 h-5 text-yellow-300 mb-1 opacity-80" /> :
                      day.condition === WeatherCondition.Rain ? <Cloud className="w-5 h-5 text-cyan-400 mb-1 opacity-80" /> :
                        <Cloud className="w-5 h-5 text-white/60 mb-1 opacity-80" />}
                    <span className="text-sm font-mono text-white/90">{day.high}°</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;