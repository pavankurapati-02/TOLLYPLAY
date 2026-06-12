import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie, SessionResultDetails, MovieEra } from '../types/game';
import { useSound } from '../hooks/useSound';
import { X, Pause, Play, Home } from 'lucide-react';
import { generateBalancedMixedQueue } from '../data/movies';

interface HeadsSetGoProps {
  movies: Movie[];
  selectedEra: MovieEra;
  durationSeconds: number;
  onGameEnd: (results: SessionResultDetails[], finalScore: number) => void;
  onHomeClick: () => void;
}

export default function HeadsSetGo({
  movies,
  selectedEra,
  durationSeconds,
  onGameEnd,
  onHomeClick
}: HeadsSetGoProps) {
  const { playCorrect, playSkip, playTick, playVictory, playClick } = useSound();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseConfirmType, setPauseConfirmType] = useState<'home' | 'exit' | null>(null);

  // Movie queue and index tracking
  const [movieQueue, setMovieQueue] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [results, setResults] = useState<SessionResultDetails[]>([]);

  // States: 'countdown' | 'playing' | 'ended'
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'ended'>('countdown');
  const [startCountdown, setStartCountdown] = useState(3);

  // Portrait orientation and visual lock states
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );
  const [forceCssLandscape, setForceCssLandscape] = useState(false);

  // Transition & Swipe animation states
  const [flashBg, setFlashBg] = useState<'correct' | 'skip' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardExitX, setCardExitX] = useState(0);

  const scoreRef = useRef(0);
  const resultsRef = useRef<SessionResultDetails[]>([]);

  // Sync references to prevent stale closures in interval
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // Request Fullscreen and Lock Orientation
  const requestOrientationLock = async () => {
    try {
      const el = document.getElementById('heads-set-go-stage') || document.documentElement;
      if (el) {
        if (el.requestFullscreen) {
          await el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Fullscreen bypassed:', e);
    }

    try {
      if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
        await (window.screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch (err) {
      console.warn('Landscape orientation lock neglected:', err);
    }
  };

  // Track portrait vs landscape orientation
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Try landscape lock on mount
  useEffect(() => {
    requestOrientationLock();

    return () => {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitFullscreenElement) {
          (document as any).webkitExitFullscreen().catch(() => {});
        }
      } catch (e) {}

      try {
        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      } catch (e) {}
    };
  }, []);

  // Shuffle and set movie deck
  useEffect(() => {
    let finalQueue: Movie[];
    if (selectedEra === 'mixed') {
      finalQueue = generateBalancedMixedQueue(movies);
    } else {
      const filtered = movies.filter(m => m.era === selectedEra);
      finalQueue = [...filtered].sort(() => Math.random() - 0.5);
    }
    setMovieQueue(finalQueue);
    setCurrentIndex(0);
    setScore(0);
    setResults([]);
  }, [movies, selectedEra]);

  // 3s Match Start countdown timer
  useEffect(() => {
    if (gameState !== 'countdown') return;

    const interval = setInterval(() => {
      setStartCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('playing');
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Safe Vibration / Haptic Feedback Helper
  const triggerVibrationFeedback = (type: 'correct' | 'skip' | 'complete') => {
    try {
      const savedSettings = localStorage.getItem('tollyplay_settings');
      let hapticFeedback = true;
      let vibration = true;
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        hapticFeedback = parsed.parsed !== undefined ? parsed.hapticFeedback : (parsed.hapticFeedback ?? true);
        vibration = parsed.vibration ?? true;
      }
      
      // Vibration and Haptic Feedback must both be enabled in settings
      if (!hapticFeedback || !vibration) return;

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'correct') {
          // Correct Answer Feedback: Short success vibration (Duration: 50-80ms)
          navigator.vibrate(65);
        } else if (type === 'skip') {
          // Skip / Incorrect Feedback: Short vibration (Duration: 30-50ms)
          navigator.vibrate(40);
        } else if (type === 'complete') {
          // Timer Finished: Medium vibration (Duration: 150ms)
          navigator.vibrate(150);
        }
      }
    } catch (e) {
      console.warn('Vibration failed', e);
    }
  };

  // Game End handler
  const endGame = () => {
    setGameState('ended');
    playVictory();
    triggerVibrationFeedback('complete');
    onGameEnd(resultsRef.current, scoreRef.current);
  };

  // Play session timer (pauses when confirmation modal or pause modal is visible)
  useEffect(() => {
    if (gameState !== 'playing' || showExitConfirm || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        if (prev <= 11) {
          playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, playTick, showExitConfirm, isPaused]);

  // Swipe Action trigger (Correct or Skip)
  const triggerAction = (action: 'correct' | 'skip') => {
    if (isTransitioning || isPaused) return;
    setIsTransitioning(true);

    const activeMovie = movieQueue[currentIndex];
    if (!activeMovie) return;

    if (action === 'correct') {
      playCorrect();
      triggerVibrationFeedback('correct');
      setFlashBg('correct');
      setScore(prev => prev + 1);
      setResults(prev => [
        ...prev,
        {
          itemName: activeMovie.title,
          secondaryInfo: activeMovie.era,
          status: 'correct'
        }
      ]);
    } else {
      playSkip();
      triggerVibrationFeedback('skip');
      setFlashBg('skip');
      setResults(prev => [
        ...prev,
        {
          itemName: activeMovie.title,
          secondaryInfo: activeMovie.era,
          status: 'skip'
        }
      ]);
    }

    setTimeout(() => {
      setFlashBg(null);
      setIsTransitioning(false);
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      if (nextIdx >= movieQueue.length) {
        endGame();
      }
    }, 300);
  };

  // Keyboard navigation for testing and desktop ease
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || isTransitioning || isPaused) return;
      if (e.key === 'ArrowRight') {
        setCardExitX(800);
        triggerAction('correct');
      } else if (e.key === 'ArrowLeft') {
        setCardExitX(-800);
        triggerAction('skip');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentIndex, isTransitioning, movieQueue, isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Text scaling for landscape card
  const getTitleSizeClass = (titleStr: string) => {
    const len = titleStr.length;
    if (len > 30) return 'text-2xl sm:text-3xl md:text-4xl font-black';
    if (len > 20) return 'text-3xl sm:text-4xl md:text-5xl font-black';
    if (len > 12) return 'text-4xl sm:text-5xl md:text-6xl font-black';
    return 'text-5xl sm:text-6xl md:text-7xl font-black';
  };

  const currentMovie = movieQueue[currentIndex];

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden select-none bg-slate-950 ${
        forceCssLandscape && isPortrait 
          ? 'w-[100vh] h-[100vw] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 origin-center duration-300 transform' 
          : 'inset-0'
      }`} 
      id="heads-set-go-stage"
    >
      
      {/* 1. PORTRAIT ORIENTATION WARNING */}
      {isPortrait && !forceCssLandscape && gameState !== 'ended' && (
        <div 
          className="fixed inset-0 z-55 flex flex-col items-center justify-center bg-slate-950 p-6 text-center select-none"
          id="portrait-warning-overlay"
        >
          <div className="w-24 h-24 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 relative animate-[pulse_1.5s_infinite]">
            <svg 
              className="w-12 h-12 text-yellow-500 animate-[spin_5s_linear_infinite]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-slate-950 p-1.5 rounded-full text-xs font-black">
              🔄
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Rotate to Landscape Mode
          </h1>
          <p className="text-slate-300 text-sm max-w-sm leading-relaxed mb-6">
            Hold your phone horizontally and place it facing your friends!
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => {
                requestOrientationLock();
              }}
              className="w-full py-3 px-4 rounded-xl bg-yellow-500 text-slate-950 font-bold hover:bg-yellow-400 active:scale-95 transition text-sm flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
              id="portrait-btn-lock"
            >
              <span>Lock Screen & Start</span>
            </button>

            <button
              onClick={() => {
                setForceCssLandscape(true);
                requestOrientationLock();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
              id="portrait-btn-bypass"
            >
              <span>Rotation Stuck? Force CSS 90° View</span>
            </button>
            
            <button
              onClick={onHomeClick}
              className="w-full py-2 px-4 rounded-xl text-slate-400 text-xs font-medium hover:text-slate-300 active:scale-95 transition pointer-events-auto cursor-pointer"
              id="portrait-btn-exit"
            >
              Exit to Menu
            </button>
          </div>
        </div>
      )}

      {/* 2. MATCH START COUNTDOWN */}
      {gameState === 'countdown' && (
        <div className="flex flex-col items-center justify-center text-center space-y-4" id="match-countdown-card">
          <div className="text-slate-400 uppercase tracking-widest text-sm font-semibold">Get Ready!</div>
          <div className="w-32 h-32 rounded-full border-4 border-yellow-500/20 flex items-center justify-center bg-yellow-500/5 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
            <span className="text-7xl font-black text-yellow-400 tracking-tight animate-ping">
              {startCountdown}
            </span>
          </div>
          <div className="text-slate-300 font-medium text-xs px-6">
            Get ready to guess! Friends see the movie card, swipe to correct or skip!
          </div>
        </div>
      )}

      {/* 3. ACTIVE MINIMAL GAMEPLAY VIEW WITH SWIPE CARD */}
      {gameState === 'playing' && currentMovie && (
        <div 
          className="w-full h-full flex flex-col justify-between items-center py-6 relative" 
          id="active-heads-set-go"
        >
          {/* 1. Header with Exit Button & Center Timer & Pause Button */}
          <div className="relative w-full px-6 flex items-center z-40 mt-1" id="gameplay-header">
            {/* Left side Exit Button (small and unobtrusive) */}
            <div className="w-12 h-12 flex items-center justify-start">
              <button
                onClick={() => {
                  playClick();
                  setShowExitConfirm(true);
                }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-90 pointer-events-auto cursor-pointer"
                id="btn-exit-game-trigger"
                aria-label="Exit Game"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Timer */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center" id="timer-display-header">
              <span className="font-mono text-4xl font-black tracking-widest text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Right side Pause Button */}
            <div className="w-12 h-12 flex items-center justify-end">
              <button
                onClick={() => {
                  playClick();
                  setIsPaused(true);
                  setPauseConfirmType(null);
                }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-90 pointer-events-auto cursor-pointer"
                id="btn-pause-game-trigger"
                aria-label="Pause Game"
              >
                <Pause className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Swipe Card Area in center */}
          <div className="relative flex-1 w-full flex items-center justify-center -mt-4" id="heads-gameplay-stage">
            <AnimatePresence mode="wait">
              {!isTransitioning && (
                <motion.div
                  key={currentMovie.id}
                  drag={!isPaused ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1.1}
                  onDrag={(e, info) => {
                    if (isTransitioning || isPaused) return;
                    if (info.offset.x > 60) {
                      setFlashBg('correct');
                    } else if (info.offset.x < -60) {
                      setFlashBg('skip');
                    } else {
                      setFlashBg(null);
                    }
                  }}
                  onDragEnd={(e, info) => {
                    if (isTransitioning || isPaused) return;
                    // Minimum Swipe Distance is 120dp AND Minimum Velocity is 300px/sec
                    if (info.offset.x >= 120 && info.velocity.x >= 300) {
                      setCardExitX(800);
                      triggerAction('correct');
                    } else if (info.offset.x <= -120 && info.velocity.x <= -300) {
                      setCardExitX(-800);
                      triggerAction('skip');
                    } else {
                      setFlashBg(null);
                    }
                  }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{
                    x: cardExitX,
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.25 }
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 156 }}
                  className="w-[85vw] max-w-[620px] h-[55vh] flex items-center justify-center p-8 text-center select-none cursor-grab active:cursor-grabbing pointer-events-auto bg-slate-900 border-2 border-slate-800 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
                  style={{ x: 0 }}
                >
                  <div className="w-full text-center flex items-center justify-center select-none break-words uppercase px-2">
                    <span className={`${getTitleSizeClass(currentMovie.title)} leading-tight font-black tracking-wide text-white font-sans text-center uppercase break-words drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]`}>
                      {currentMovie.title}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Balanced spacer at bottom */}
          <div className="h-6 w-full pointer-events-none" />
        </div>
      )}

      {/* Screen Flash overlays */}
      <AnimatePresence>
        {flashBg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute inset-0 pointer-events-none z-30 transition-all ${
              flashBg === 'correct'
                ? 'bg-emerald-500/25 ring-8 ring-emerald-500/30'
                : 'bg-orange-500/25 ring-8 ring-orange-500/30'
            }`}
          />
        )}
      </AnimatePresence>

      {/* 5. Exit Game Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white">
            {/* Backdrop overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playClick();
                setShowExitConfirm(false);
              }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Glowing active confirmation box */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-sm bg-[#130d22] border-2 border-rose-500/25 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden z-10"
              id="exit-game-confirm-modal"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500" />

              {/* Title Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto my-1">
                  <X className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">Exit Game?</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your current game progress will be lost.
                </p>
              </div>

              {/* Buttons Row */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <button
                  onClick={() => {
                    playClick();
                    setShowExitConfirm(false);
                  }}
                  className="py-3 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-bold hover:bg-slate-800 transition text-sm pointer-events-auto cursor-pointer"
                  id="btn-exit-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    playClick();
                    onHomeClick();
                  }}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold transition text-sm pointer-events-auto cursor-pointer shadow-lg shadow-rose-600/20"
                  id="btn-exit-confirm"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Pause Game Overlay & Confirm Sub-modals */}
      <AnimatePresence>
        {isPaused && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white">
            {/* Backdrop overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Glowing Pause Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-sm bg-[#130d22] border-2 border-purple-500/20 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden z-10 text-center animate-glow"
              id="pause-game-overlay-card"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

              {pauseConfirmType === null ? (
                <>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto my-1">
                      <Pause className="w-5 h-5 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-orange-300 tracking-wider">
                      GAME PAUSED
                    </h3>
                    <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
                      Chillin' at {formatTime(timeLeft)}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    {/* Resume */}
                    <button
                      onClick={() => {
                        playClick();
                        setIsPaused(false);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 font-black tracking-wide text-sm active:scale-95 transition pointer-events-auto cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
                      id="btn-pause-resume"
                    >
                      <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>Resume</span>
                    </button>

                    {/* Home */}
                    <button
                      onClick={() => {
                        playClick();
                        setPauseConfirmType('home');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-sm active:scale-95 transition pointer-events-auto cursor-pointer flex items-center justify-center gap-2"
                      id="btn-pause-home"
                    >
                      <Home className="w-4 h-4 text-slate-400" />
                      <span>Home</span>
                    </button>

                    {/* Exit */}
                    <button
                      onClick={() => {
                        playClick();
                        setPauseConfirmType('exit');
                      }}
                      className="w-full py-3 px-4 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 text-xs font-semibold active:scale-95 transition pointer-events-auto cursor-pointer flex items-center justify-center gap-1.5"
                      id="btn-pause-exit"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Exit Game</span>
                    </button>
                  </div>
                </>
              ) : pauseConfirmType === 'home' ? (
                <>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto my-1">
                      <Home className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Return to Home?</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Current progress will be lost.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <button
                      onClick={() => {
                        playClick();
                        setPauseConfirmType(null);
                      }}
                      className="py-3 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-bold hover:bg-slate-800 transition text-sm pointer-events-auto cursor-pointer animate-fade-in"
                      id="btn-pause-confirm-home-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        onHomeClick();
                      }}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black transition text-sm pointer-events-auto cursor-pointer shadow-lg shadow-amber-500/25"
                      id="btn-pause-confirm-home-action"
                    >
                      Home
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto my-1">
                      <X className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Exit Game?</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Your current game progress will be lost.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <button
                      onClick={() => {
                        playClick();
                        setPauseConfirmType(null);
                      }}
                      className="py-3 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-bold hover:bg-slate-800 transition text-sm pointer-events-auto cursor-pointer"
                      id="btn-pause-confirm-exit-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        onHomeClick();
                      }}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold transition text-sm pointer-events-auto cursor-pointer shadow-lg shadow-rose-600/20"
                      id="btn-pause-confirm-exit-action"
                    >
                      Exit
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
