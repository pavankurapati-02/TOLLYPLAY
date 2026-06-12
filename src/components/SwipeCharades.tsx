import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie, SessionResultDetails, MovieEra } from '../types/game';
import { useSound } from '../hooks/useSound';
import { Smartphone, X, Pause, Play, Home } from 'lucide-react';
import { generateBalancedMixedQueue } from '../data/movies';

interface SwipeCharadesProps {
  movies: Movie[];
  selectedEra: MovieEra;
  durationSeconds: number;
  onGameEnd: (results: SessionResultDetails[], finalScore: number) => void;
  onHomeClick: () => void;
}

export default function SwipeCharades({
  movies,
  selectedEra,
  durationSeconds,
  onGameEnd,
  onHomeClick,
}: SwipeCharadesProps) {
  const { playCorrect, playSkip, playTick, playVictory, playClick } = useSound();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseConfirmType, setPauseConfirmType] = useState<'home' | 'exit' | null>(null);
  const [movieQueue, setMovieQueue] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [flash, setFlash] = useState<'green' | 'orange' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardExitX, setCardExitX] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);

  // References to keep callbacks current
  const resultsRef = useRef<SessionResultDetails[]>([]);
  const scoreRef = useRef(0);

  // Filter and Shuffle Queue
  useEffect(() => {
    let finalQueue: Movie[];
    if (selectedEra === 'mixed') {
      finalQueue = generateBalancedMixedQueue(movies);
    } else {
      const filtered = movies.filter((m) => m.era === selectedEra);
      finalQueue = [...filtered].sort(() => Math.random() - 0.5);
    }
    setMovieQueue(finalQueue);
    setCurrentIndex(0);
    resultsRef.current = [];
    scoreRef.current = 0;
  }, [movies, selectedEra]);

  // Attempt to soft-lock to native portrait mode
  useEffect(() => {
    try {
      if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
        (window.screen.orientation as any).lock('portrait').catch(() => {});
      }
    } catch (e) {
      console.warn('Orientation lock not supported/rejected:', e);
    }
    return () => {
      try {
        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      } catch (e) {}
    };
  }, []);

  // Track orientation changes
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main game timer (pauses when confirmation modal or pause modal is visible)
  useEffect(() => {
    if (showExitConfirm || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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
  }, [playTick, showExitConfirm, isPaused]);

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

  // End game handler
  const endGame = () => {
    playVictory();
    triggerVibrationFeedback('complete');
    onGameEnd(resultsRef.current, scoreRef.current);
  };

  // Process swipe / key choice
  const triggerDecision = (decision: 'correct' | 'skip') => {
    if (isTransitioning || isPaused) return;
    setIsTransitioning(true);

    const activeMovie = movieQueue[currentIndex];
    if (!activeMovie) return;

    // Apply flash feedback immediately
    setFlash(decision === 'correct' ? 'green' : 'orange');

    if (decision === 'correct') {
      playCorrect();
      triggerVibrationFeedback('correct');
      scoreRef.current += 1;
      resultsRef.current.push({
        itemName: activeMovie.title,
        secondaryInfo: activeMovie.era,
        status: 'correct',
      });
    } else {
      playSkip();
      triggerVibrationFeedback('skip');
      resultsRef.current.push({
        itemName: activeMovie.title,
        secondaryInfo: activeMovie.era,
        status: 'skip',
      });
    }

    // Delay 300ms for visual flash and card-slide exit
    setTimeout(() => {
      setFlash(null);
      setIsTransitioning(false);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= movieQueue.length) {
        endGame();
      }
    }, 300);
  };

  // Keyboard navigation for testing and desktop use
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning || isLandscape || isPaused) return;
      if (e.key === 'ArrowRight') {
        setCardExitX(600);
        triggerDecision('correct');
      } else if (e.key === 'ArrowLeft') {
        setCardExitX(-600);
        triggerDecision('skip');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTransitioning, isLandscape, movieQueue, isPaused]);

  // Translate seconds into mm:ss format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getTitleSizeClass = (title: string) => {
    const len = title.length;
    if (len > 30) return 'text-xl sm:text-2xl md:text-3xl font-black';
    if (len > 20) return 'text-2xl sm:text-3xl md:text-4xl font-black';
    if (len > 12) return 'text-3xl sm:text-4xl md:text-5xl font-black';
    return 'text-4xl sm:text-5xl md:text-6xl font-black';
  };

  const currentMovie = movieQueue[currentIndex];

  return (
    <div
      className="relative flex flex-col h-full w-full bg-[#0c0813] select-none text-white overflow-hidden items-center justify-between py-12"
      id="swipe-gameplay-root"
    >
      {/* 1. Header with Exit Button & Center Timer & Pause Button */}
      <div className="relative w-full px-6 flex items-center z-40 mt-4" id="gameplay-header">
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

      {/* 2. Main Gameplay Swipe Area */}
      <div
        className="relative flex-1 w-full flex items-center justify-center -mt-8"
        id="swipe-card-stage"
      >
        <AnimatePresence mode="wait">
          {currentMovie && !isTransitioning && (
            <motion.div
              key={currentMovie.id}
              drag={!isPaused ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1.1}
              onDrag={(e, info) => {
                if (isTransitioning || isPaused) return;
                // Flash bg hints conditionally based on drag direction
                if (info.offset.x > 60) {
                  setFlash('green');
                } else if (info.offset.x < -60) {
                  setFlash('orange');
                } else {
                  setFlash(null);
                }
              }}
              onDragEnd={(e, info) => {
                if (isTransitioning || isPaused) return;
                // Enforce minimum swipe distance: 120dp (pixels) AND minimum velocity: 300px/sec
                if (info.offset.x >= 120 && info.velocity.x >= 300) {
                  setCardExitX(600);
                  triggerDecision('correct');
                } else if (info.offset.x <= -120 && info.velocity.x <= -300) {
                  setCardExitX(-600);
                  triggerDecision('skip');
                } else {
                  setFlash(null);
                }
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: cardExitX,
                opacity: 0,
                scale: 0.9,
                transition: { duration: 0.25 },
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 156 }}
              className="w-[75vw] max-w-[420px] aspect-[10/11] flex items-center justify-center p-8 text-center select-none cursor-grab active:cursor-grabbing pointer-events-auto bg-slate-900 border-2 border-slate-800 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
              style={{ x: 0 }}
            >
              {/* Central Movie Title (Auto-scaling, high-contrast bold and centered) */}
              <div className="w-full text-center flex items-center justify-center select-none break-words uppercase px-2">
                <span
                  className={`${getTitleSizeClass(
                    currentMovie.title
                  )} leading-tight font-black tracking-wide text-white font-sans text-center uppercase break-words drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]`}
                >
                  {currentMovie.title}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Screen Flash and Feedback Indicators */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute inset-0 pointer-events-none z-30 transition-all ${
              flash === 'green'
                ? 'bg-emerald-500/25 ring-8 ring-emerald-500/30'
                : 'bg-orange-500/25 ring-8 ring-orange-500/30'
            }`}
          />
        )}
      </AnimatePresence>

      {/* 4. Soft Warning for Landscape Mode */}
      {isLandscape && (
        <div className="absolute inset-0 bg-[#0c0813]/98 z-55 flex flex-col items-center justify-center p-8 text-center">
          <Smartphone className="w-16 h-16 text-purple-400 animate-bounce mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Portrait Orientation Only</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Please turn your device back to Portrait alignment to keep acts, cues, and guesses perfectly center!
          </p>
        </div>
      )}

      {/* 5. Exit Game Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
      </ AnimatePresence>
    </div>
  );
}
