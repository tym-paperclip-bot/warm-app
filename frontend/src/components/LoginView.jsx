import React from 'react';
import { GoogleGlyph } from './Icons.jsx';

export function LoginView() {
  const [loading, setLoading] = React.useState(false);

  const onLogin = () => {
    setLoading(true);
    window.location.href = '/auth/login';
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '88px 28px 38px', background: 'var(--paper)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 20, letterSpacing: '0.01em', textTransform: 'uppercase' }}>Warm/Up</span>
        <span className="wu-mono" style={{ fontSize: 10, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>v1.0 · beta</span>
      </div>

      <div style={{ marginTop: 'auto', marginBottom: 44 }}>
        <div className="wu-eyebrow" style={{ marginBottom: 18 }}>Climbing warm-up</div>
        <div className="wu-display" style={{ fontSize: 60, lineHeight: 0.92 }}>
          Warm up<br />smarter.
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--mute-2)', marginTop: 22, lineHeight: 1.45, maxWidth: 290, fontWeight: 500 }}>
          A swipe-through library of climbing warm-ups, built into sessions you can run anywhere.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button onClick={onLogin} disabled={loading} style={{
          width: '100%', height: 60, border: '1.5px solid var(--ink)', borderRadius: 18,
          background: 'var(--paper)', color: 'var(--ink)',
          cursor: loading ? 'default' : 'pointer',
          fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.005em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          transition: 'transform 0.12s ease',
        }}>
          {loading ? (
            <><span className="wu-spinner" /> Signing in…</>
          ) : (
            <><GoogleGlyph s={22} /> Continue with Google</>
          )}
        </button>
        <p style={{
          fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mute)',
          textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase',
          margin: 0, lineHeight: 1.6,
        }}>
          By continuing you agree to the<br />
          <span style={{ color: 'var(--ink)' }}>terms</span> &amp; <span style={{ color: 'var(--ink)' }}>privacy policy</span>
        </p>
      </div>
    </div>
  );
}
