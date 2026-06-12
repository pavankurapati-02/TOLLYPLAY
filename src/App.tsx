import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameMode, MovieEra, SessionResultDetails, GameSession } from './types/game';
import { generateMovieDatabase } from './data/movies';
import { useSound } from './hooks/useSound';
import HeadsSetGo from './components/HeadsSetGo';
import SwipeCharades from './components/SwipeCharades';
import { 
  Clapperboard, Smartphone, HelpCircle, Play, Sliders, Volume2, VolumeX, Flame, 
  Sparkles, Calendar, ChevronRight, CheckCircle, AlertTriangle, RotateCcw, Home, Sparkle, Award 
} from 'lucide-react';

export default function App() {
  const { playClick, playVictory } = useSound();

  // Load static databases
  const moviesDB = generateMovieDatabase();

  // Game Global States
  const [screen, setScreen] = useState<'splash' | 'home' | 'config_era' | 'config_difficulty' | 'config_timer' | 'gameplay' | 'results'>('splash');
  const [selectedMode, setSelectedMode] = useState<GameMode>('HEADS_SET_GO');
  const [selectedEra, setSelectedEra] = useState<MovieEra>('mixed');
  const [durationSeconds, setDurationSeconds] = useState<number>(90);

  // Audio & Feedback Settings state
  const [settings, setSettings] = useState<{
    soundEffects: boolean;
    hapticFeedback: boolean;
    vibration: boolean;
    tapSounds: boolean;
  }>({
    soundEffects: true,
    hapticFeedback: true,
    vibration: true,
    tapSounds: true,
  });

  const [soundMuted, setSoundMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Score stats & high scores
  const [highScores, setHighScores] = useState<{ [key in GameMode]: number }>({
    HEADS_SET_GO: 0,
    SWIPE_CHARADES: 0
  });

  // Current session results
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);

  // Play custom subtle click under dynamic tapSounds context
  const playTapClick = () => {
    if (settings.tapSounds && !soundMuted) {
      playClick();
    }
  };

  // Trigger splash screen timeout on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen('home');
    }, 1800);

    // Load local high scores
    try {
      const saved = localStorage.getItem('tollyplay_highscores');
      if (saved) {
        setHighScores(JSON.parse(saved));
      } else {
        // Seed some fun starting records
        const starting = { HEADS_SET_GO: 12, SWIPE_CHARADES: 15 };
        localStorage.setItem('tollyplay_highscores', JSON.stringify(starting));
        setHighScores(starting);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }

    // Load local configurations
    try {
      const savedSettings = localStorage.getItem('tollyplay_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      const savedMute = localStorage.getItem('tollyplay_muted');
      if (savedMute) {
        setSoundMuted(JSON.parse(savedMute) === true);
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage', e);
    }

    return () => clearTimeout(timer);
  }, []);

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      localStorage.setItem('tollyplay_settings', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    // Play tap sound on change if tap sounds is enabled
    if (key === 'tapSounds' ? value : settings.tapSounds) {
      playClick();
    }
  };

  const toggleSoundMute = () => {
    const nextVal = !soundMuted;
    setSoundMuted(nextVal);
    try {
      localStorage.setItem('tollyplay_muted', JSON.stringify(nextVal));
    } catch (e) {
      console.error(e);
    }
    if (settings.tapSounds && !nextVal) {
      playClick();
    }
  };

  const handleModeSelection = (mode: GameMode) => {
    playTapClick();
    setSelectedMode(mode);
    setScreen('config_era');
  };

  const handleEraSelection = (era: MovieEra) => {
    playTapClick();
    setSelectedEra(era);
    setScreen('config_timer');
  };

  const startGameSession = () => {
    playTapClick();
    setScreen('gameplay');
  };

  const handleGameEnd = (results: SessionResultDetails[], finalScore: number) => {
    // Generate session summary
    const newSession: GameSession = {
      sessionId: `${selectedMode}-${Date.now()}`,
      gameMode: selectedMode,
      era: selectedEra,
      durationSeconds,
      score: finalScore,
      results,
      timestamp: Date.now()
    };

    setCurrentSession(newSession);

    // Save and compare high score
    const prevHigh = highScores[selectedMode];
    if (finalScore > prevHigh) {
      const updated = { ...highScores, [selectedMode]: finalScore };
      setHighScores(updated);
      try {
        localStorage.setItem('tollyplay_highscores', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    setScreen('results');
  };

  const handleReplay = () => {
    playTapClick();
    startGameSession();
  };

  const resetToHome = () => {
    playTapClick();
    setScreen('home');
  };

  const getModeTitle = (mode: GameMode) => {
    switch (mode) {
      case 'HEADS_SET_GO': return 'Heads Set Go';
      case 'SWIPE_CHARADES': return 'Swipe Charades';
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0813] text-gray-100 flex flex-col justify-between select-none relative overflow-x-hidden antialiased">
      
      {/* Decorative vector layout glow spots */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] rounded-full bg-amber-900/10 blur-[100px] pointer-events-none" />

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-lg mx-auto relative z-10 px-4 py-8">

        <AnimatePresence mode="wait">

          {/* 1. SPLASH SCREEN */}
          {screen === 'splash' && (
            <motion.div
              key="splash-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center space-y-6"
              id="splash-view"
            >
              {/* Massive Glowing App Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full scale-110 animate-pulse" />
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-700 to-amber-500 p-0.5 shadow-2xl flex items-center justify-center animate-float">
                  <div className="w-full h-full bg-[#0c0813] rounded-[22px] flex items-center justify-center">
                    <Clapperboard className="w-12 h-12 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Title App Brand */}
              <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-white font-sans sm:text-5xl">
                  TOLLY<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">PLAY</span>
                </h1>
                <p className="text-purple-300 font-mono text-xs uppercase tracking-widest font-semibold">
                  Offline-First Tollywood Party Game
                </p>
              </div>

              {/* Custom retro progress indicator */}
              <div className="w-40 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-yellow-400 via-purple-500 to-orange-400 animate-[pulse_1.5s_infinite] w-[75%] rounded-full" />
              </div>

              <div className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">
                100% Offline • Built for Friends & Family
              </div>
            </motion.div>
          )}

          {/* 2. THE MAIN HOME SELECT DASHBOARD */}
          {screen === 'home' && (
            <motion.div
              key="home-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
              id="home-view"
            >
              {/* App Title Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight">
                    TOLLY<span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">PLAY</span>
                  </h1>
                  <p className="text-xs text-slate-400">The Ultimate Telugu Film Guessing Duel</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { playTapClick(); setIsSettingsOpen(true); }}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-yellow-400 hover:text-yellow-300 transition pointer-events-auto cursor-pointer"
                    title="Audio & Feedback Settings"
                    id="btn-settings-toggle"
                  >
                    <Sliders className="w-4 h-4 animate-pulse" />
                  </button>
                  <button 
                    onClick={toggleSoundMute}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-slate-400 hover:text-white transition pointer-events-auto cursor-pointer"
                    title={soundMuted ? 'Unmute game audio' : 'Mute game audio'}
                    id="btn-mute-toggle"
                  >
                    {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                  </button>
                </div>
              </div>



              {/* Selection cards representing the two game modes */}
              <div className="space-y-4">
                
                {/* Mode 1: Heads Set Go */}
                <button
                  onClick={() => handleModeSelection('HEADS_SET_GO')}
                  className="w-full text-left bg-slate-900/60 border border-slate-800 hover:border-yellow-500/40 hover:bg-slate-900/90 p-4.5 rounded-3xl flex items-center justify-between group transition duration-200 shadow-lg pointer-events-auto cursor-pointer"
                  id="card-mode-heads"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500/20 group-hover:scale-105 transition duration-200">
                      <Smartphone className="w-6 h-6 rotate-90" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Heads Set Go</span>
                        <span className="text-[9px] uppercase font-mono font-bold tracking-widest bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded text-yellow-400">Landscape</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 mr-4">Hold device horizontally so friends see the movie name. Drag-to-swipe cards to correct or skip.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition" />
                </button>

                {/* Mode 2: Swipe Charades */}
                <button
                  onClick={() => handleModeSelection('SWIPE_CHARADES')}
                  className="w-full text-left bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/90 p-4.5 rounded-3xl flex items-center justify-between group transition duration-200 shadow-lg pointer-events-auto cursor-pointer"
                  id="card-mode-charades"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-105 transition duration-200">
                      <Clapperboard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Swipe Charades</span>
                        <span className="text-[9px] uppercase font-mono font-bold tracking-widest bg-purple-400/10 border border-purple-400/20 px-1.5 py-0.5 rounded text-purple-300">Portrait</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 mr-4">You act out the movie in portrait orientation. Drag-to-swipe card deck right/left to score.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition" />
                </button>

              </div>

              {/* Bottom informational guidelines tag */}
              <div className="text-center font-mono text-[10px] text-slate-500 bg-slate-950/60 border border-slate-900/80 p-3 rounded-2xl tracking-wide">
                ⭐ PERFECT FOR GATHERINGS • ZERO SIGN-IN • OFFLINE FIRST
              </div>
            </motion.div>
          )}

          {/* 3. CATEGORY SELECTION SCREEN (MODES 1 & 2) */}
          {screen === 'config_era' && (
            <motion.div
              key="era-selection-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6"
              id="config-era-view"
            >
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold">Step 1 of 2</span>
                <h2 className="text-2xl font-bold text-white">Select Movie Era</h2>
                <p className="text-xs text-slate-400">Choose the pool of movies to shuffle</p>
              </div>

              {/* 2x2 Grid of Eras */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* 90’s Movies */}
                <button
                  onClick={() => handleEraSelection('90s')}
                  className="aspect-square bg-slate-905 border-2 border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-yellow-500/50 hover:bg-slate-900/60 transition group text-left pointer-events-auto cursor-pointer"
                  id="era-90s"
                >
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-105 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-yellow-400 transition text-base">90s Cinema</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">Shiva, Gang Leader, Gharana Mogudu, Annamayya...</p>
                  </div>
                </button>

                {/* 2000’s Movies */}
                <button
                  onClick={() => handleEraSelection('2000s')}
                  className="aspect-square bg-slate-905 border-2 border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900/60 transition group text-left pointer-events-auto cursor-pointer"
                  id="era-2000s"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-purple-400 transition text-base">2000s Classics</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">Kushi, Indra, Murari, Okkadu, Pokiri, Bommarillu...</p>
                  </div>
                </button>

                {/* Latest Movies */}
                <button
                  onClick={() => handleEraSelection('latest')}
                  className="aspect-square bg-slate-905 border-2 border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-orange-500/50 hover:bg-slate-900/60 transition group text-left pointer-events-auto cursor-pointer"
                  id="era-latest"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-orange-400 transition text-base">Latest VFX Hits</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">Bahubali, Pushpa, RRR, HanuMan, Kalki AD...</p>
                  </div>
                </button>

                {/* Mixed Era */}
                <button
                  onClick={() => handleEraSelection('mixed')}
                  className="aspect-square bg-gradient-to-br from-slate-900 via-[#161026] to-slate-950 border-2 border-purple-900/30 rounded-3xl p-5 flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900/60 transition group text-left pointer-events-auto cursor-pointer"
                  id="era-mixed"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-105 transition">
                    <Sparkle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-purple-300 transition text-base">Mixed Shuffle</h3>
                    <p className="text-[11px] text-purple-300 font-medium mt-0.5 leading-snug line-clamp-2">All eras merged into one massive 600+ movie deck!</p>
                  </div>
                </button>

              </div>

              <div className="text-center pt-2">
                <button
                  onClick={resetToHome}
                  className="text-xs text-slate-400 hover:text-slate-200 border border-slate-800/80 px-4 py-2 bg-slate-900/60 rounded-xl transition pointer-events-auto cursor-pointer"
                >
                  Back to Modes
                </button>
              </div>
            </motion.div>
          )}

          {/* 5. TIMER SELECTION SCREEN */}
          {screen === 'config_timer' && (
            <motion.div
              key="timer-selection-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
              id="config-timer-view"
            >
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold">Step 2 of 2</span>
                <h2 className="text-2xl font-bold text-white">Select Game Duration</h2>
                <p className="text-xs text-slate-400">Choose custom battle time countdown length</p>
              </div>

              {/* Slider Controller */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Duration:</span>
                  <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {durationSeconds} <span className="text-xs font-medium text-slate-400">seconds</span>
                  </span>
                </div>

                <input 
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={durationSeconds}
                  onChange={(e) => { playTapClick(); setDurationSeconds(parseInt(e.target.value)); }}
                  className="w-full accent-yellow-400 bg-slate-800 h-2 rounded-lg cursor-pointer pointer-events-auto"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>30 sec</span>
                  <span>90s (Default)</span>
                  <span>180s</span>
                  <span>300s</span>
                </div>
              </div>

              {/* Huge Glow CTA Start Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={startGameSession}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600 hover:from-yellow-300 hover:via-orange-400 hover:to-purple-500 text-slate-950 hover:scale-[1.01] active:scale-[0.99] font-black text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/20 transition duration-200 flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
                  id="btn-start-game"
                >
                  <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                  <span>START TOLLYPLAY BATTLE</span>
                </button>

                <button
                  onClick={() => {
                    playTapClick();
                    if (selectedMode === 'TRANSIFY') {
                      setScreen('config_difficulty');
                    } else {
                      setScreen('config_era');
                    }
                  }}
                  className="w-full text-xs text-slate-400 hover:text-slate-200 transition text-center py-2 underline cursor-pointer"
                >
                  Change Mode Parameters
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. GAMEPLAY ZONE */}
          {screen === 'gameplay' && (
            <motion.div
              key="gameplay-arena"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 w-full h-full bg-[#0c0813]"
            >
              {selectedMode === 'HEADS_SET_GO' && (
                <HeadsSetGo
                  movies={moviesDB}
                  selectedEra={selectedEra}
                  durationSeconds={durationSeconds}
                  onGameEnd={handleGameEnd}
                  onHomeClick={resetToHome}
                />
              )}

              {selectedMode === 'SWIPE_CHARADES' && (
                <SwipeCharades
                  movies={moviesDB}
                  selectedEra={selectedEra}
                  durationSeconds={durationSeconds}
                  onGameEnd={handleGameEnd}
                  onHomeClick={resetToHome}
                />
              )}
            </motion.div>
          )}

          {/* 7. DETAILED RESULTS SCREEN & SUMMARY FEEDBACK */}
          {screen === 'results' && currentSession && (
            <motion.div
              key="results-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
              id="results-view"
            >
              <div className="space-y-6 text-center" id="clean-results-display">
                <div className="space-y-1">
                  <h2 className="text-xl uppercase font-mono tracking-widest text-slate-400">Final Score</h2>
                  <div className="text-7xl font-black text-yellow-400 font-mono tracking-tight my-2">
                    {currentSession.score}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  {/* Correct Movies Column */}
                  <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-2xl p-4 flex flex-col h-56">
                    <h3 className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold mb-3 flex items-center gap-1.5 border-b border-emerald-900/40 pb-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Correct ({currentSession.results.filter(r => r.status === 'correct').length})</span>
                    </h3>
                    <div className="overflow-y-auto divide-y divide-emerald-950/40 flex-1 pr-1 text-sm text-slate-200 space-y-1.5 scrollbar">
                      {currentSession.results.filter(r => r.status === 'correct').map((res, idx) => (
                        <div key={idx} className="py-1 saturate-[0.85] font-semibold truncate">
                          {res.itemName}
                        </div>
                      ))}
                      {currentSession.results.filter(r => r.status === 'correct').length === 0 && (
                        <div className="text-xs text-slate-600 italic py-8 text-center">None</div>
                      )}
                    </div>
                  </div>

                  {/* Skipped Movies Column */}
                  <div className="bg-amber-950/30 border border-amber-900/40 rounded-2xl p-4 flex flex-col h-56">
                    <h3 className="text-xs uppercase font-mono tracking-wider text-amber-500 font-bold mb-3 flex items-center gap-1.5 border-b border-amber-900/40 pb-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Skipped ({currentSession.results.filter(r => r.status === 'skip').length})</span>
                    </h3>
                    <div className="overflow-y-auto divide-y divide-amber-950/40 flex-1 pr-1 text-sm text-slate-300 space-y-1.5 scrollbar">
                      {currentSession.results.filter(r => r.status === 'skip').map((res, idx) => (
                        <div key={idx} className="py-1 truncate">
                          {res.itemName}
                        </div>
                      ))}
                      {currentSession.results.filter(r => r.status === 'skip').length === 0 && (
                        <div className="text-xs text-slate-600 italic py-8 text-center">None</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                  <button
                    onClick={resetToHome}
                    className="py-3 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-bold hover:bg-slate-800 transition text-sm flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer"
                    id="btn-results-home"
                  >
                    <Home className="w-4 h-4" />
                    <span>Main Menu</span>
                  </button>

                  <button
                    onClick={handleReplay}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white font-bold transition text-sm flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer"
                    id="btn-results-replay"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Dynamic Settings Dialog Overlay Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { playTapClick(); setIsSettingsOpen(false); }}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-in"
            />

            {/* Glowing settings tray panel */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-sm bg-[#130d22] border-2 border-purple-500/25 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden z-10"
              id="settings-modal-panel"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

              {/* Title Header */}
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <Sliders className="w-5 h-5 text-yellow-500" />
                  <span>Feedback & Sounds</span>
                </h2>
                <p className="text-xs text-slate-400">Settings are saved automatically</p>
              </div>

              {/* Toggles Container */}
              <div className="space-y-4">
                {/* 1. Sound Effects Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-slate-100 block text-left">Sound Effects</span>
                    <span className="text-[10px] text-slate-400 block font-medium text-left">Ding, skip, and result tunes</span>
                  </div>
                  <button
                    onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                    className={`relative w-12 h-6.5 rounded-full transition duration-200 focus:outline-none cursor-pointer shrink-0 ${
                      settings.soundEffects ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20' : 'bg-slate-800'
                    }`}
                    id="toggle-sound-effects"
                  >
                    <span
                      className={`absolute top-1 left-1 bg-[#130d22] w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                        settings.soundEffects ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Haptic Feedback Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-slate-100 block text-left">Haptic Feedback</span>
                    <span className="text-[10px] text-slate-400 block font-medium text-left">Fine micro-vibrations on swipes</span>
                  </div>
                  <button
                    onClick={() => updateSetting('hapticFeedback', !settings.hapticFeedback)}
                    className={`relative w-12 h-6.5 rounded-full transition duration-200 focus:outline-none cursor-pointer shrink-0 ${
                      settings.hapticFeedback ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20' : 'bg-slate-800'
                    }`}
                    id="toggle-haptic-feedback"
                  >
                    <span
                      className={`absolute top-1 left-1 bg-[#130d22] w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                        settings.hapticFeedback ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Vibration Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-slate-100 block text-left">Vibration</span>
                    <span className="text-[10px] text-slate-400 block font-medium text-left">Device shakes on round completions</span>
                  </div>
                  <button
                    onClick={() => updateSetting('vibration', !settings.vibration)}
                    className={`relative w-12 h-6.5 rounded-full transition duration-200 focus:outline-none cursor-pointer shrink-0 ${
                      settings.vibration ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/20' : 'bg-slate-800'
                    }`}
                    id="toggle-vibration"
                  >
                    <span
                      className={`absolute top-1 left-1 bg-[#130d22] w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                        settings.vibration ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Tap Sounds Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-slate-100 block text-left">Tap Sounds</span>
                    <span className="text-[10px] text-slate-400 block font-medium text-left">Subtle click clicks on taps</span>
                  </div>
                  <button
                    onClick={() => updateSetting('tapSounds', !settings.tapSounds)}
                    className={`relative w-12 h-6.5 rounded-full transition duration-200 focus:outline-none cursor-pointer shrink-0 ${
                      settings.tapSounds ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20' : 'bg-slate-800'
                    }`}
                    id="toggle-tap-sounds"
                  >
                    <span
                      className={`absolute top-1 left-1 bg-[#130d22] w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                        settings.tapSounds ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Close CTA Button */}
              <button
                onClick={() => { playTapClick(); setIsSettingsOpen(false); }}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition active:scale-[0.99] pointer-events-auto cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-close-settings"
              >
                <span>Save & Close</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
