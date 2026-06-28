import { useCallback, useEffect, useRef, useState } from 'react';

export function usePomodoroTimer() {
  const [durations, setDurations] = useState({ focus: 25, break: 5, short: 2 });
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

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

  const handleTimerComplete = useCallback(() => {
    if (mode === 'focus') {
      console.log('FOCUS COMPLETE > INITIATING BREAK');
      setMode('break');
      setTimeLeft(durations.break * 60);
      setIsActive(true);
    } else {
      console.log('BREAK COMPLETE > RE-ENGAGING FOCUS');
      setMode('focus');
      setTimeLeft(durations.focus * 60);
      setIsActive(true);
    }
  }, [mode, durations.break, durations.focus]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, handleTimerComplete]);

  const toggleTimer = () => setIsActive((prev) => !prev);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode] * 60);
  };

  return {
    durations,
    mode,
    timeLeft,
    isActive,
    switchMode,
    updateDuration,
    toggleTimer,
    resetTimer,
    setIsActive,
  };
}
