import { motion as Motion, useReducedMotion } from 'framer-motion';
import { THEME } from '../constants/theme';

export function NoteWidget({ visible, isActive, autoDim, isPinned, noteAlign, onTogglePinned, onSetNoteAlign }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: isActive && autoDim && !isPinned ? 0.1 : 1, y: 0 }}
      whileHover={{ opacity: 1 }}
      style={{
        position: 'absolute',
        top: '65%',
        left: '50%',
        x: '-50%',
        y: '-50%',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'grab',
        borderRadius: '0.6rem',
        backgroundColor: '#00000069',
        backdropFilter: 'blur(10px)',
        height: '1.5rem',
      }}
    >
      {visible.intent && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', width: '100%', justifyContent: 'center', position: 'relative' }}>
          <button
            type="button"
            onClick={onTogglePinned}
            title={isPinned ? 'Unpin (Enable Dimming)' : 'Pin (Disable Dimming)'}
            aria-label={isPinned ? 'Unpin note widget' : 'Pin note widget'}
            style={{
              position: 'absolute',
              left: -10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isPinned ? '#fff' : '#5f5f5f',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z" />
            </svg>
          </button>

          <div style={{ display: 'flex', gap: '8px', opacity: 0.5 }}>
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                type="button"
                aria-label={`Align note ${align}`}
                onClick={() => onSetNoteAlign(align)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: noteAlign === align ? '#ffffff4f' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                {align === 'left' && <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>}
                {align === 'center' && <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" /></svg>}
                {align === 'right' && <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" transform="scale(-1, 1) translate(-24, 0)" /></svg>}
              </button>
            ))}
          </div>
        </div>
      )}

      {visible.intent && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <textarea
            className="note-input"
            rows="5"
            cols="40"
            aria-label="Focus note"
            placeholder="> note anything..."
            style={{
              background: '#ffffff38',
              borderRadius: '1rem',
              border: 'none',
              color: 'rgb(255, 255, 255)',
              width: '30rem',
              height: '8rem',
              fontFamily: THEME.fontMono,
              letterSpacing: '1.5px',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'none',
              padding: '1rem',
              textAlign: noteAlign,
            }}
          />
        </div>
      )}
    </Motion.div>
  );
}
