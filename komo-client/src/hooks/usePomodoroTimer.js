import { useCallback, useEffect, useRef, useState } from 'react';
import { readStoredValue, writeStoredValue } from '../utils/persistence';

const DURATIONS_KEY = 'komo:v1:timer-durations';
const BREAK_MODE_KEY = 'komo:v1:break-mode';
const DEFAULT_DURATIONS = { focus: 25 * 60, break: 5 * 60, short: 2 * 60 };
const MAX_DURATION_SECONDS = 999 * 60 + 59;
const isValidDurations = (value) => value && ['focus', 'break', 'short'].every(
  (key) => Number.isInteger(value[key]) && value[key] >= 1 && value[key] <= MAX_DURATION_SECONDS,
);
const isValidBreakMode = (value) => value === 'break' || value === 'short';

export function usePomodoroTimer() {
  const [durations, setDurations] = useState(() => readStoredValue(DURATIONS_KEY, isValidDurations, DEFAULT_DURATIONS));
  const [breakMode, setBreakMode] = useState(() => readStoredValue(BREAK_MODE_KEY, isValidBreakMode, 'break'));
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(() => durations.focus);
  const [isActive, setIsActive] = useState(false);
  const [chimeEnabled, setChimeEnabled] = useState(() => {
    try {
      return window.localStorage.getItem('komo-chime-enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const timerRef = useRef(null);
  const chimeEnabledRef = useRef(chimeEnabled);
  const audioContextRef = useRef(null);
  const modeRef = useRef(mode);
  const durationsRef = useRef(durations);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    durationsRef.current = durations;
    writeStoredValue(DURATIONS_KEY, durations);
  }, [durations]);

  useEffect(() => {
    writeStoredValue(BREAK_MODE_KEY, breakMode);
  }, [breakMode]);

  useEffect(() => {
    chimeEnabledRef.current = chimeEnabled;
    try {
      window.localStorage.setItem('komo-chime-enabled', String(chimeEnabled));
    } catch {
      // Storage may be unavailable; the in-memory setting still works.
    }
  }, [chimeEnabled]);

  const switchMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'break' || newMode === 'short') setBreakMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsActive(false);
  };

  const updateDuration = (key, value) => {
    const totalSeconds = Math.min(MAX_DURATION_SECONDS, Math.max(1, Math.floor(Number(value) || 1)));
    const newDurations = { ...durations, [key]: totalSeconds };
    setDurations(newDurations);

    if (mode === key) {
      setTimeLeft(totalSeconds);
    }
  };

  const playCompletionChime = useCallback(() => {
    if (!chimeEnabledRef.current) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === 'suspended') context.resume();

    const now = context.currentTime;
    [659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.18;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.95);
    });
  }, []);

  const handleTimerComplete = useCallback(() => {
    playCompletionChime();
    const currentMode = modeRef.current;
    const nextMode = currentMode === 'focus' ? breakMode : 'focus';

    console.log(currentMode === 'focus' ? 'FOCUS COMPLETE > INITIATING BREAK' : 'BREAK COMPLETE > RE-ENGAGING FOCUS');
    setMode(nextMode);
    setIsActive(true);

    return durationsRef.current[nextMode];
  }, [breakMode, playCompletionChime]);

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return handleTimerComplete();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, handleTimerComplete]);

  const toggleTimer = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current ||= new AudioContextClass();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    }
    setIsActive((prev) => !prev);
  };
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
  };

  return {
    durations,
    breakMode,
    mode,
    timeLeft,
    isActive,
    chimeEnabled,
    toggleChime: () => setChimeEnabled((enabled) => !enabled),
    switchMode,
    updateDuration,
    toggleTimer,
    resetTimer,
    setIsActive,
  };
}
