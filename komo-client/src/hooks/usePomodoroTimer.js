import { useCallback, useEffect, useRef, useState } from 'react';

export function usePomodoroTimer() {
  const [durations, setDurations] = useState({ focus: 25, break: 5, short: 2 });
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
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
  }, [durations]);

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
    setTimeLeft(durations[newMode] * 60);
    setIsActive(false);
  };

  const updateDuration = (key, value) => {
    const val = parseInt(value, 10) || 1;
    const newDurations = { ...durations, [key]: val };
    setDurations(newDurations);

    if (mode === key && !isActive) {
      setTimeLeft(val * 60);
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
    const nextMode = currentMode === 'focus' ? 'break' : 'focus';

    console.log(currentMode === 'focus' ? 'FOCUS COMPLETE > INITIATING BREAK' : 'BREAK COMPLETE > RE-ENGAGING FOCUS');
    setMode(nextMode);
    setIsActive(true);

    return durationsRef.current[nextMode] * 60;
  }, [playCompletionChime]);

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
    setTimeLeft(durations[mode] * 60);
  };

  return {
    durations,
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
