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
  onClose,
  onToggleVisible,
  onToggleAutoDim,
  onUpdateDuration,
  onManualInputChange,
  onManualSubmit,
  onForceRefresh,
  onSelectVideo,
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
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          <Motion.div
            initial={shouldReduceMotion ? false : { scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { scale: 0.95, y: 20 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            style={{ width: '92%', maxWidth: '1200px', height: '109rem', marginTop: '40rem', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6rem 0rem 0rem 0rem', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: THEME.fontUi, fontWeight: 200, letterSpacing: '6px', fontSize: '12px', color: '#666' }}>KOMO // SETTINGS</h2>
              <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: THEME.fontMono, fontSize: '12px' }}> OPEN / CLOSE [ESC]</button>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: '#666', marginBottom: '10px', letterSpacing: '1px' }}>CONFIGURATION</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" className={`config-btn ${visible.timer ? 'active' : ''}`} onClick={() => onToggleVisible('timer')}>TIMER</button>
                <button type="button" className={`config-btn ${visible.dock ? 'active' : ''}`} onClick={() => onToggleVisible('dock')}>CONTROLS</button>
                <button type="button" className={`config-btn ${visible.volume ? 'active' : ''}`} onClick={() => onToggleVisible('volume')}>VOLUME</button>
                <button type="button" className={`config-btn ${visible.intent ? 'active' : ''}`} onClick={() => onToggleVisible('intent')}>NOTE</button>
                <div style={{ width: '1px', background: '#333', margin: '0 5px' }} />
                <button type="button" className={`config-btn ${autoDim ? 'active' : ''}`} onClick={onToggleAutoDim}>WIDGET DIMMING</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '2rem' }}>
              {[
                ['focus', 'FOCUS DURATION (MIN)'],
                ['break', 'BREAK DURATION (MIN)'],
                ['short', 'SHORT BREAK (MIN)'],
              ].map(([key, label]) => (
                <div key={key} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '6px', padding: '15px' }}>
                  <div style={{ fontSize: '10px', fontFamily: THEME.fontMono, color: '#666', marginBottom: '8px' }}>{label}</div>
                  <input
                    type="number"
                    aria-label={label}
                    value={durations[key]}
                    onChange={(e) => onUpdateDuration(key, e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: THEME.alabaster, fontFamily: THEME.fontMono, fontSize: '18px', width: '100%', outline: 'none' }}
                  />
                </div>
              ))}
            </div>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '15px' }}>
              <div style={{ fontFamily: THEME.fontMono, fontSize: '10px', color: statusMsg.includes('ERROR') ? THEME.signal : (statusMsg.includes('UPDATED') || statusMsg.includes('LOCKED') ? THEME.active : '#444'), textTransform: 'uppercase', letterSpacing: '1px' }}>{statusMsg}</div>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1rem 1rem 10rem 1rem', overflowY: 'hidden', overflowX: 'hidden', flex: 1 }}>
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
