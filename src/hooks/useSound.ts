import { useCallback, useRef } from 'react';

// Decoupled Helper to read latest settings directly from localStorage to prevent stale reactive closures
const getAudioState = () => {
  let soundEffects = true;
  let tapSounds = true;
  let muted = false;
  try {
    const savedSettings = localStorage.getItem('tollyplay_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      soundEffects = parsed.soundEffects ?? true;
      tapSounds = parsed.tapSounds ?? true;
    }
    const savedMute = localStorage.getItem('tollyplay_muted');
    if (savedMute) {
      muted = JSON.parse(savedMute) === true;
    }
  } catch (e) {
    console.warn('Could not read settings from localStorage', e);
  }
  return { soundEffects, tapSounds, muted };
};

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      // Handle browser prefixes
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    // Resume context if suspended (browser security policies)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playCorrect = useCallback(() => {
    try {
      const { soundEffects, muted } = getAudioState();
      if (muted || !soundEffects) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Sweet arpeggiated double-beep
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio failed to play', e);
    }
  }, [getAudioContext]);

  const playSkip = useCallback(() => {
    try {
      const { soundEffects, muted } = getAudioState();
      if (muted || !soundEffects) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(140, now + 0.15); // Drop frequency

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio failed to play', e);
    }
  }, [getAudioContext]);

  const playTick = useCallback(() => {
    try {
      const { soundEffects, muted } = getAudioState();
      if (muted || !soundEffects) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(900, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio failed to play', e);
    }
  }, [getAudioContext]);

  const playVictory = useCallback(() => {
    try {
      const { soundEffects, muted } = getAudioState();
      if (muted || !soundEffects) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Play C major triad fanfare
      playTone(261.63, now, 0.4); // C4
      playTone(329.63, now + 0.1, 0.4); // E4
      playTone(392.00, now + 0.2, 0.4); // G4
      playTone(523.25, now + 0.3, 0.6); // C5
    } catch (e) {
      console.warn('Audio failed to play', e);
    }
  }, [getAudioContext]);

  const playClick = useCallback(() => {
    try {
      const { tapSounds, muted } = getAudioState();
      if (muted || !tapSounds) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Audio failed to play', e);
    }
  }, [getAudioContext]);

  return {
    playCorrect,
    playSkip,
    playTick,
    playVictory,
    playClick,
  };
}
