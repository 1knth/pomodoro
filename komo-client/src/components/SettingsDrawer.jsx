import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
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
  isActive,
  chimeEnabled,
  onClose,
  onToggleVisible,
  onToggleAutoDim,
  onUpdateDuration,
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
              <section style={{ minWidth: 0, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '6px', padding: '16px' }}>
                <div style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: '#888', marginBottom: '14px', letterSpacing: '1px' }}>WIDGETS & BEHAVIOR</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                  <button type="button" className={`config-btn ${visible.timer ? 'active' : ''}`} aria-pressed={visible.timer} onClick={() => onToggleVisible('timer')}>TIMER</button>
                  <button type="button" className={`config-btn ${visible.dock ? 'active' : ''}`} aria-pressed={visible.dock} onClick={() => onToggleVisible('dock')}>CONTROLS</button>
                  <button type="button" className={`config-btn ${visible.intent ? 'active' : ''}`} aria-pressed={visible.intent} onClick={() => onToggleVisible('intent')}>NOTE</button>
                  <button type="button" className={`config-btn ${autoDim ? 'active' : ''}`} aria-pressed={autoDim} onClick={onToggleAutoDim}>WIDGET DIMMING</button>
                </div>
              </section>

              <section style={{ minWidth: 0, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '6px', padding: '16px' }}>
                <div style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: '#888', marginBottom: '14px', letterSpacing: '1px' }}>SOUND</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0, opacity: 0.7 }}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
                  <input type="range" min="0" max="100" step="1" value={volume} onChange={onVolumeChange} aria-label="Volume" style={{ flex: 1, minWidth: 0, background: '#fff8ed5c', borderRadius: '1.5rem', opacity: '0.8' }} />
                  <div style={{ width: '34px', flexShrink: 0, textAlign: 'right', fontFamily: THEME.fontMono, fontSize: '11px', color: '#888' }}>{volume}%</div>
                </div>
                <button type="button" className={`config-btn ${chimeEnabled ? 'active' : ''}`} onClick={onToggleChime} aria-pressed={chimeEnabled} style={{ marginTop: '14px' }}>
                  CHIME {chimeEnabled ? 'ON' : 'OFF'}
                </button>
              </section>
            </div>

            <div aria-label="Timer durations" style={{ width: 'min(340px, 100%)', display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '1.5rem', fontSize: '16px', textTransform: 'lowercase' }}>
              {[
                ['focus', 'FOCUS DURATION (MIN)'],
                ['break', 'BREAK DURATION (MIN)'],
                ['short', 'SHORT BREAK (MIN)'],
              ].map(([key, label]) => (
                <label key={key} style={{ minWidth: 0, display: 'grid', gridTemplateColumns: '1fr minmax(6ch, 25%)', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '6px', padding: '8px 10px', cursor: 'text' }}>
                  <span style={{ fontFamily: THEME.fontMono, color: '#888' }}>{label}</span>
                  <input type="number" min="1" max="999" step="1" aria-label={label} value={durations[key]} onChange={(e) => onUpdateDuration(key, e.target.value)} style={{ boxSizing: 'border-box', width: '100%', minWidth: 0, padding: '5px 8px', textAlign: 'right', background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.border}`, borderRadius: '4px', color: THEME.alabaster, fontFamily: THEME.fontMono, fontSize: 'inherit', outline: 'none', cursor: 'text' }} onFocus={(e) => { e.currentTarget.style.borderColor = THEME.alabaster; }} onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; }} />
                </label>
              ))}
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
                style={{ flex: 1, background: 'transparent', border: 'none', color: THEME.alabaster, fontFamily: THEME.fontMono, fontSize: '13px', outline: 'none' }}
              />
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
