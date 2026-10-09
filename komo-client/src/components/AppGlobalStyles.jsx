import { THEME } from '../constants/theme';

export function AppGlobalStyles() {
  return (
    <style>{`
      ::selection { background: #777; color: #fff; }
      ::-moz-selection { background: #777; color: #fff; }

      button:focus:not(:focus-visible) { outline: none; }
      button:focus-visible { outline: 2px solid ${THEME.active}; outline-offset: 3px; }
      html[data-input-modality="pointer"] button:focus-visible { outline: none; }
      .controls-hud button:not(:disabled) { transition: background-color 160ms ease; }
      .controls-hud button:not(:disabled):hover { background-color: #555 !important; }
      .controls-hud button:not(:disabled).active:hover { background-color: ${THEME.alabaster} !important; }
      .controls-hud button:focus:not(:focus-visible) { outline: none; }
      .controls-hud button:active:not(:disabled) { filter: none; transform: none; }


      input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer; }
      input[type=range]:focus { outline: none; }
      input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 2px; cursor: pointer; background: rgba(255,255,255,0.2); border-radius: 1px; }
      input[type=range]::-webkit-slider-thumb { height: 10px; width: 10px; border-radius: 50%; background: ${THEME.alabaster}; cursor: pointer; -webkit-appearance: none; margin-top: -4px; box-shadow: 0 0 10px rgba(255,255,255,0.5); }

      .settings-page { font-size: 12px; }
      .settings-page, .settings-page * { text-transform: lowercase !important; }
      .settings-page :is(button, input, label, span, div, h2) { font-size: 12px !important; }

      .mode-btn { font-size: 10px; opacity: 0.5; transition: opacity 0.2s ease, filter 160ms ease, transform 160ms ease; cursor: pointer; background: transparent; border: none; color: ${THEME.alabaster}; font-family: ${THEME.fontMono}; letter-spacing: 1px; }
      .mode-btn:hover, .mode-btn.active { opacity: 1; text-decoration: underline; }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      input[type=number] { -moz-appearance: textfield; }

      .config-btn {
        min-height: 38px; padding: 8px 12px; border: 1px solid #3a3a3c; background: rgba(255,255,255,0.015);
        color: #999; font-family: ${THEME.fontMono}; font-size: 10px; letter-spacing: 0.04em; cursor: pointer;
        transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
        border-radius: 4px;
      }
      .config-btn.active { border-color: ${THEME.alabaster}; color: ${THEME.alabaster}; background: rgba(255,255,255,0.08); }
      .config-btn:hover:not(:disabled) { border-color: #888; color: ${THEME.alabaster}; background: rgba(255,255,255,0.06); }
      .config-btn.active:hover:not(:disabled) { border-color: ${THEME.alabaster}; background: rgba(255,255,255,0.12); }
      .config-btn:active:not(:disabled) { transform: translateY(1px); }
      .config-btn:focus-visible { outline: 2px solid ${THEME.active}; outline-offset: 3px; }
      .config-btn:disabled { cursor: not-allowed; opacity: 0.45; }

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
