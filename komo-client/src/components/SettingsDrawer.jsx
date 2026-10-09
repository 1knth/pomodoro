import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { THEME } from '../constants/theme';

export function SettingsDrawer({
  open,
  visible,
  autoDim,
  durations,
  manualInput,
  statusMsg,
  loading,
  videos,
  currentVid,
  volume,
  mode,
  selectedBreakMode,
  isActive,
  chimeEnabled,
  onClose,
  onToggleVisible,
  onToggleAutoDim,
  onUpdateDuration,
  onSwitchMode,
  onManualInputChange,
  onManualSubmit,
  onForceRefresh,
  onSelectVideo,
  onVolumeChange,
  onToggleTimer,
  onResetTimer,
  onToggleChime,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [durationDrafts, setDurationDrafts] = useState(() => Object.fromEntries(
    Object.entries(durations).map(([key, total]) => [key, {
      minutes: String(Math.floor(total / 60)),
      seconds: String(total % 60),
    }]),
  ));


  const updateDurationPart = (key, part, value) => {
    setDurationDrafts((current) => ({
      ...current,
      [key]: { ...current[key], [part]: value },
    }));
  };

  const handleDurationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const normalizeDuration = (key) => {
    const draft = durationDrafts[key];
    const requestedMinutes = Number(draft.minutes);
    const minutes = Math.min(999, Math.max(0, Math.floor(Number.isFinite(requestedMinutes) ? requestedMinutes : 0)));
    const requestedSeconds = Number(draft.seconds);
    const seconds = Math.min(59, Math.max(0, Math.floor(Number.isFinite(requestedSeconds) ? requestedSeconds : 0)));
    const totalSeconds = Math.max(1, minutes * 60 + seconds);
    const normalizedMinutes = Math.floor(totalSeconds / 60);
    const normalizedSeconds = totalSeconds % 60;
    setDurationDrafts((current) => ({ ...current, [key]: { minutes: String(normalizedMinutes), seconds: String(normalizedSeconds) } }));
    onUpdateDuration(key, totalSeconds);
  };

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(5, 5, 6, 0.56)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: 'clamp(16px, 4vw, 48px)',
            boxSizing: 'border-box',
          }}
        >
          <Motion.div
            className="settings-page"
            initial={shouldReduceMotion ? false : { scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { scale: 0.95, y: 20 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            style={{ width: 'min(1200px, 100%)', maxHeight: 'calc(100vh - clamp(32px, 8vw, 96px))', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box', paddingRight: '4px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
              <h2 style={{ fontFamily: THEME.fontUi, fontWeight: 200, letterSpacing: 'clamp(3px, 1vw, 6px)', fontSize: '12px', color: '#666', margin: 0 }}>KOMO // SETTINGS</h2>
              <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: THEME.fontMono, fontSize: '12px' }}> OPEN / CLOSE [ESC]</button>
            </div>

            <style>{`.settings-box { width: 100%; box-sizing: border-box; } .break-settings-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; gap: clamp(12px, 1.5vw, 16px); margin-bottom: 1.5rem; } @media (max-width: 640px) { .break-settings-layout { grid-template-columns: 1fr; } }`}</style>
            <div className="break-settings-layout">
              <div style={{ display: 'grid', justifyItems: 'start', gap: 'clamp(12px, 1.5vw, 16px)' }}>
              <section className="settings-box" aria-label="Break mode and widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', alignItems: 'start', gap: 'clamp(16px, 2vw, 24px)', padding: 'clamp(14px, 2vw, 20px)', background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '8px' }}>
                <section style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: '#888', marginBottom: '12px', letterSpacing: '1px', minHeight: '12px' }}>WIDGETS & BEHAVIOR</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                    <button type="button" className={`config-btn ${visible.timer ? 'active' : ''}`} aria-pressed={visible.timer} onClick={() => onToggleVisible('timer')}>TIMER</button>
                    <button type="button" className={`config-btn ${visible.dock ? 'active' : ''}`} aria-pressed={visible.dock} onClick={() => onToggleVisible('dock')}>CONTROLS</button>
                    <button type="button" className={`config-btn ${visible.intent ? 'active' : ''}`} aria-pressed={visible.intent} onClick={() => onToggleVisible('intent')}>NOTE</button>
                    <button type="button" className={`config-btn ${autoDim ? 'active' : ''}`} aria-pressed={autoDim} onClick={onToggleAutoDim}>WIDGET DIMMING</button>
                  </div>
                </section>
                <section aria-label="Break mode" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: THEME.fontMono, color: '#888', fontSize: '10px', letterSpacing: '1px', marginBottom: '12px', minHeight: '12px' }}>SELECTED BREAK MODE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button type="button" className={`config-btn ${selectedBreakMode === 'break' ? 'active' : ''}`} aria-pressed={selectedBreakMode === 'break'} onClick={() => onSwitchMode('break')}>REGULAR</button>
                    <button type="button" className={`config-btn ${selectedBreakMode === 'short' ? 'active' : ''}`} aria-pressed={selectedBreakMode === 'short'} onClick={() => onSwitchMode('short')}>SHORT</button>
                  </div>
                </section>
              </section>
              <section className="settings-box" aria-label="Sound" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', alignItems: 'start', gap: 'clamp(16px, 2vw, 24px)', padding: 'clamp(14px, 2vw, 20px)', background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '8px' }}>
                <section style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: '#888', marginBottom: '12px', letterSpacing: '1px', minHeight: '12px' }}>SOUND</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0, opacity: 0.7 }}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
                    <input type="range" min="0" max="100" step="1" value={volume} onChange={onVolumeChange} aria-label="Volume" style={{ flex: 1, minWidth: 0, background: '#fff8ed5c', borderRadius: '1.5rem', opacity: '0.8' }} />
                    <div style={{ width: '34px', flexShrink: 0, textAlign: 'right', fontFamily: THEME.fontMono, fontSize: '11px', color: '#888' }}>{volume}%</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${THEME.border}` }}>
                    <span style={{ color: '#aaa', fontFamily: THEME.fontMono }}>completion chime</span>
                    <button type="button" className={`config-btn ${chimeEnabled ? 'active' : ''}`} onClick={onToggleChime} aria-pressed={chimeEnabled} style={{ minWidth: '76px', minHeight: '32px', padding: '6px 10px', background: chimeEnabled ? THEME.alabaster : 'rgba(255,255,255,0.015)', color: chimeEnabled ? THEME.obsidian : '#999' }}>{chimeEnabled ? 'ON' : 'OFF'}</button>
                  </div>
                </section>
              </section>
              </div>
              <section aria-label="Timer durations" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {[
                ['focus', 'Focus'],
                ['break', 'Break'],
                ['short', 'Short break'],
              ].map(([key, label]) => (
                <div key={key} style={{ minWidth: 0, display: 'grid', gridTemplateColumns: '1fr', gap: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '6px', padding: '10px' }}>
                  <span style={{ fontFamily: THEME.fontMono, color: '#aaa', fontSize: '12px' }}>{label}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', alignItems: 'end', gap: '6px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '4px', minWidth: 0, color: '#777', fontSize: '10px', fontFamily: THEME.fontMono }}>
                      MIN
                      <input type="number" min="0" max="999" step="any" aria-label={`${label} minutes`} value={durationDrafts[key]?.minutes ?? ''} onChange={(e) => updateDurationPart(key, 'minutes', e.target.value)} onKeyDown={handleDurationKeyDown} onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; normalizeDuration(key); }} onFocus={(e) => { e.currentTarget.style.borderColor = THEME.alabaster; }} style={{ boxSizing: 'border-box', width: '100%', minWidth: 0, padding: '6px 7px', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.border}`, borderRadius: '4px', color: THEME.alabaster, fontFamily: THEME.fontMono, fontSize: '13px', outline: 'none' }} />
                    </label>
                    <span aria-hidden="true" style={{ color: '#666', fontFamily: THEME.fontMono }}>:</span>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '4px', minWidth: 0, color: '#777', fontSize: '10px', fontFamily: THEME.fontMono }}>
                      SEC
                      <input type="number" min="0" max="59" step="any" aria-label={`${label} seconds`} value={durationDrafts[key]?.seconds ?? ''} onChange={(e) => updateDurationPart(key, 'seconds', e.target.value)} onKeyDown={handleDurationKeyDown} onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; normalizeDuration(key); }} onFocus={(e) => { e.currentTarget.style.borderColor = THEME.alabaster; }} style={{ boxSizing: 'border-box', width: '100%', minWidth: 0, padding: '6px 7px', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.border}`, borderRadius: '4px', color: THEME.alabaster, fontFamily: THEME.fontMono, fontSize: '13px', outline: 'none' }} />
                    </label>
                  </div>
                </div>
              ))}
              </section>
            </div>

            {!visible.dock && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <button type="button" className="config-btn" onClick={onResetTimer}>RESTART TIME</button>
                <button type="button" className={`config-btn ${isActive ? 'active' : ''}`} onClick={onToggleTimer}>
                  {isActive ? (mode === 'focus' ? 'PAUSE FLOW' : 'PAUSE BREAK') : (mode === 'focus' ? 'START FLOW' : 'START BREAK')}
                </button>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'flex' }}>
              <input
                type="text"
                aria-label="YouTube video URL"
                placeholder=">> paste youtube url -> hit enter"
                value={manualInput}
                onChange={(e) => onManualInputChange(e.target.value)}
                onKeyDown={onManualSubmit}
                style={{ flex: '1 1 180px', minWidth: 0, background: 'transparent', border: 'none', color: THEME.alabaster, fontFamily: THEME.fontMono, fontSize: '13px', outline: 'none' }}
              />
              <button
                type="button"
                aria-label="Enter YouTube video URL"
                onClick={() => onManualSubmit({ key: 'Enter' })}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0, background: THEME.alabaster, border: '1px solid ' + THEME.alabaster, borderRadius: '4px', color: THEME.obsidian, cursor: 'pointer', padding: '8px 12px', fontFamily: THEME.fontMono, fontSize: '12px', fontWeight: 600 }}
              >
                Enter
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 5v7a4 4 0 0 0 4 4h7" />
                  <path d="m14 12 4 4-4 4" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '15px' }}>
              <div style={{ fontFamily: THEME.fontMono, fontSize: '10px', color: statusMsg.includes('ERROR') ? THEME.signal : (statusMsg.includes('UPDATED') || statusMsg.includes('LOCKED') ? THEME.active : '#444'), textTransform: 'uppercase', letterSpacing: '1px', overflowWrap: 'anywhere' }}>{statusMsg}</div>
              <button
                type="button"
                onClick={onForceRefresh}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: `1px solid ${loading ? '#333' : '#666'}`,
                  color: loading ? '#333' : '#888',
                  padding: '8px 20px',
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: THEME.fontMono,
                  fontSize: '10px',
                  letterSpacing: '1px',
                  transition: 'border-color 0.2s, color 0.2s, opacity 0.2s',
                  borderRadius: '4px',
                }}
              >
                {loading ? 'SCANNING SATELLITES...' : 'REFRESH FEED'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 'clamp(0.75rem, 2vw, 1.5rem)', padding: '1rem 0 2rem 0', overflow: 'visible' }}>
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => onSelectVideo(vid.id)}
                  style={{
                    aspectRatio: '16/9',
                    background: '#000',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    border: currentVid === vid.id ? '1px solid #fff' : '1px solid #222',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = '#666';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = currentVid === vid.id ? '#fff' : '#222';
                  }}
                >
                  <img src={vid.thumb} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(0,0,0,1), transparent)', fontSize: '1rem', fontFamily: THEME.fontUi, color: '#e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vid.title}</div>
                </div>
              ))}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
