import React from 'react';
import { appReducer, makeInitialState } from './reducer.js';
import { api } from './api.js';
import { LoginView } from './components/LoginView.jsx';
import { BrowsePager } from './components/BrowsePager.jsx';
import { PlayerView } from './components/PlayerView.jsx';
import { SettingsView } from './components/SettingsView.jsx';
import { GenerateSheet } from './components/GenerateSheet.jsx';
import { SavePicker } from './components/SavePicker.jsx';

function LoadingScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', gap: 14 }}>
      <span style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.01em' }}>Warm/Up</span>
      <span className="wu-spinner" />
    </div>
  );
}

export default function App() {
  const [state, dispatch] = React.useReducer(appReducer, undefined, makeInitialState);

  React.useEffect(() => {
    api.getMe()
      .then(data => {
        dispatch({ type: 'signIn', email: data.email });
        return Promise.all([api.getExercises(), api.getSessions()]);
      })
      .then(([exercises, sessions]) => {
        dispatch({ type: 'dataLoaded', exercises, sessions });
      })
      .catch(err => {
        if (err.status === 401) {
          dispatch({ type: 'authRequired' });
        } else {
          // Unexpected error — still show login
          dispatch({ type: 'authRequired' });
        }
      });
  }, []);

  return (
    <div className="wu-app-wrap">
      <div className="wu-root">
        {state.loading && <LoadingScreen />}

        {!state.loading && !state.signedIn && <LoginView />}

        {!state.loading && state.signedIn && (
          <>
            {state.view === 'player' && <PlayerView state={state} dispatch={dispatch} />}
            {state.view === 'settings' && <SettingsView state={state} dispatch={dispatch} />}
            {state.view === 'browse' && <BrowsePager state={state} dispatch={dispatch} />}
            <GenerateSheet open={state.sheet === 'generate'} state={state} dispatch={dispatch} />
            <SavePicker open={state.sheet === 'save'} state={state} dispatch={dispatch} />
          </>
        )}
      </div>
      <div style={{
        position: 'absolute', bottom: 'calc(4px + env(safe-area-inset-bottom))',
        left: 0, right: 0, textAlign: 'center',
        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em',
        color: 'rgba(0,0,0,0.18)', pointerEvents: 'none', userSelect: 'none',
      }}>© Designed by TK</div>
    </div>
  );
}
