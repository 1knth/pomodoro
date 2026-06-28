import { THEME } from '../constants/theme';

export function DockBtn({ children, onClick, active, icon, style, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={icon && title ? title : undefined}
      style={{
        background: active ? THEME.alabaster : 'transparent',
        color: active ? THEME.obsidian : THEME.alabaster,
        border: 'none',
        borderRadius: '99px',
        height: '44px',
        padding: icon ? '0 12px' : '0 24px',
        cursor: 'pointer',
        fontFamily: THEME.fontUi,
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.2s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
