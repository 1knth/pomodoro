import { THEME } from '../constants/theme';

export function AppGlobalStyles() {
  return (
    <style>{`
      input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer; }
      input[type=range]:focus { outline: none; }
      input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 2px; cursor: pointer; background: rgba(255,255,255,0.2); border-radius: 1px; }
      input[type=range]::-webkit-slider-thumb { height: 10px; width: 10px; border-radius: 50%; background: ${THEME.alabaster}; cursor: pointer; -webkit-appearance: none; margin-top: -4px; box-shadow: 0 0 10px rgba(255,255,255,0.5); }

      .mode-btn { font-size: 10px; opacity: 0.5; transition: 0.2s; cursor: pointer; background: transparent; border: none; color: ${THEME.alabaster}; font-family: ${THEME.fontMono}; letter-spacing: 1px; }
      .mode-btn:hover, .mode-btn.active { opacity: 1; text-decoration: underline; }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      input[type=number] { -moz-appearance: textfield; }

      .config-btn {
        padding: 6px 12px; border: 1px solid #333; background: transparent;
        color: #666; font-family: ${THEME.fontMono}; font-size: 10px; cursor: pointer;
        transition: all 0.2s; border-radius: 4px;
      }
      .config-btn.active { border-color: ${THEME.alabaster}; color: ${THEME.alabaster}; background: rgba(255,255,255,0.05); }
      .config-btn:hover { border-color: #666; color: #888; }

      .note-input {
        text-align: left;
        padding: 1rem;
      }

      .note-input::placeholder {
        text-align: center;
      }

    `}</style>
  );
}
