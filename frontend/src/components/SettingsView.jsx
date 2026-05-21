import React from 'react';
import { Stepper } from './Atoms.jsx';

export function SettingsView({ state, dispatch }) {
  const [defCount, setDefCount] = React.useState(6);
  const [haptics, setHaptics] = React.useState(true);
  const [autoplay, setAutoplay] = React.useState(true);
  const [confirmSignOut, setConfirmSignOut] = React.useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '70px 22px 22px' }}>
        <div className="wu-eyebrow" style={{ marginBottom: 6 }}>Preferences</div>
        <div className="wu-display" style={{ fontSize: 44 }}>Settings</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="wu-noscroll">
        <Section label="Defaults">
          <Row label="Default exercise count"><Stepper value={defCount} onChange={setDefCount} min={1} max={50} /></Row>
        </Section>

        <Section label="Playback">
          <Toggle label="Auto-play video" value={autoplay} onChange={setAutoplay} />
          <Toggle label="Haptic feedback" value={haptics} onChange={setHaptics} />
        </Section>

        <Section label="Account">
          <Row label="Signed in as"><span className="val">{state.email}</span></Row>
        </Section>

        <Section label="About">
          <Row label="Version"><span className="val">1.0.0 · beta</span></Row>
          <Row label="Exercises in library"><span className="val">{state.exercises.length} entries</span></Row>
        </Section>

        <div style={{ padding: '12px 22px 18px' }}>
          <button onClick={() => setConfirmSignOut(true)} style={{
            width: '100%', padding: '14px 16px', border: '1.5px solid var(--ink)', background: 'var(--paper)',
            borderRadius: 14, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)',
          }}>Sign out</button>
        </div>
      </div>

      {/* Sign-out confirmation */}
      <div className={'wu-popup-backdrop' + (confirmSignOut ? ' open' : '')} onClick={() => setConfirmSignOut(false)} />
      <div className={'wu-popup' + (confirmSignOut ? ' open' : '')}>
        <div className="wu-eyebrow" style={{ marginBottom: 10 }}>Account</div>
        <div className="wu-display" style={{ fontSize: 26, lineHeight: 1.05, marginBottom: 10 }}>Sign out?</div>
        <div className="wu-popup-body" style={{ paddingRight: 0, marginBottom: 22, color: 'var(--mute)' }}>
          You'll be signed out as <span style={{ color: 'var(--ink)' }}>{state.email}</span>. Saved sessions stay on your account.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setConfirmSignOut(false)} style={{ flex: 1, height: 50, border: '1.5px solid var(--ink)', background: 'var(--paper)', borderRadius: 14, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>Cancel</button>
          <button onClick={() => { setConfirmSignOut(false); dispatch({ type: 'signOut' }); }} style={{ flex: 1, height: 50, border: 'none', borderRadius: 14, background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Sign out</button>
        </div>
      </div>

      <div style={{ padding: '12px 22px 38px', borderTop: '1px solid var(--line)' }}>
        <button onClick={() => dispatch({ type: 'goto', view: 'sessions' })} style={{
          width: '100%', height: 50, border: '1.5px solid var(--ink)', background: 'var(--paper)',
          borderRadius: 14, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>← Back to sessions</button>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div className="wu-eyebrow" style={{ padding: '4px 22px 8px' }}>{label}</div>
      <div style={{ borderTop: '1px solid var(--line)' }}>{children}</div>
    </div>
  );
}
function Row({ label, children }) {
  return <div className="wu-set-row"><div className="lab">{label}</div>{children}</div>;
}
function Toggle({ label, value, onChange }) {
  return (
    <div className="wu-set-row">
      <div className="lab">{label}</div>
      <button onClick={() => onChange(!value)} style={{ width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', background: value ? 'var(--ink)' : 'var(--line-2)', position: 'relative', padding: 0, transition: 'background 0.18s ease' }}>
        <span style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: '#fff', transition: 'left 0.18s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}
