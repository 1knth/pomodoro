import { useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { THEME } from '../constants/theme';
import { formatTime } from '../utils/time';
import { DockBtn } from './DockBtn';

export function TimerHud({
  mode,
  breakMode,
  timeLeft,
  isActive,
  autoDim,
  currentTime,
  visible,
  isVideoPlaying,
  onSwitchMode,
  onToggleTimer,
  onResetTimer,
  onToggleVideoPlay,
  onOpenDrawer,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const clockPointerStartRef = useRef(null);

  const handleClockPointerDown = (event) => {
    clockPointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleClockPointerUp = (event) => {
    const start = clockPointerStartRef.current;
    clockPointerStartRef.current = null;

    if (!start) return;

    const dragDistance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (dragDistance <= 6) {
      onToggleTimer();
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: '24px',
          bottom: '24px',
          zIndex: 100,
          fontFamily: THEME.fontMono,
          fontSize: '0.9rem',
          color: '#ffffff43',
          letterSpacing: '2px',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {currentTime}
      </div>

      <Motion.div
      drag
      dragMomentum={false}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        opacity: isActive && autoDim && !isHovered ? 0.1 : 1,
        transition: 'opacity 0.25s ease-in-out',
        position: 'absolute',
        top: '37%',
        left: '50%',
        x: '-50%',
        y: '-50%',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'grab',
      }}
    >
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', zIndex: 101 }}>
        {['focus', 'break', 'short'].map((item) => (
          <button key={item} type="button" className={`mode-btn ${mode === item || (mode === 'focus' && breakMode === item) ? 'active' : ''}`} onClick={() => onSwitchMode(item)} style={{ fontSize: '12px' }}>
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      {visible.timer && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
          <div
            onPointerDown={handleClockPointerDown}
            onPointerUp={handleClockPointerUp}
            style={{
              fontFamily: THEME.fontMono,
              fontSize: 'clamp(80px, 12vw, 160px)',
              fontWeight: 200,
              lineHeight: 0.8,
              letterSpacing: '-0.05em',
              textShadow: '0 20px 50px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {visible.dock && (
        <div
          className="controls-hud"
          style={{
            display: 'flex',
            gap: '8px',
            background: THEME.glass,
            backdropFilter: 'blur(40px)',
            padding: '8px',
            borderRadius: '99px',
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            marginBottom: '0.5rem',
          }}
        >
          <DockBtn onClick={onResetTimer} icon title="Reset timer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
          </DockBtn>
          <DockBtn onClick={onToggleTimer} active={isActive} style={{ minWidth: '100px' }}>
            {isActive ? (mode === 'focus' ? 'PAUSE FLOW' : 'PAUSE BREAK') : (mode === 'focus' ? 'START FLOW' : 'START BREAK')}
          </DockBtn>
          <DockBtn onClick={onToggleVideoPlay} icon active={!isVideoPlaying} title="Toggle video playback">
            {isVideoPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </DockBtn>
          <DockBtn onClick={onOpenDrawer} icon title="Open settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z" /></svg>
          </DockBtn>
        </div>
      )}

      </Motion.div>
    </>
  );
}
