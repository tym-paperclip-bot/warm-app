import React from 'react';
import { Icon } from './Icons.jsx';

// ─── YouTube helpers ────────────────────────────────────
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([^&]+)/,           // watch?v=ID
    /youtu\.be\/([^?&]+)/,     // youtu.be/ID
    /youtube\.com\/embed\/([^?&]+)/, // embed/ID
    /youtube\.com\/shorts\/([^?&]+)/, // shorts/ID
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseTimestamp(ts) {
  if (!ts) return 0;
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

// ─── Video player (YouTube embed or placeholder) ────────
export function VideoPlayer({ exercise, dark = false }) {
  const videoId = exercise?.video_url ? extractYouTubeId(exercise.video_url) : null;

  if (videoId) {
    const start = parseTimestamp(exercise.timestamp);
    const params = new URLSearchParams({
      autoplay: 1, loop: 1, playlist: videoId, mute: 1,
      controls: 0, modestbranding: 1, rel: 0,
      ...(start ? { start } : {}),
    });
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?${params}`}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; encrypted-media"
        allowFullScreen
        loading="lazy"
        title={exercise.name}
      />
    );
  }

  return <MediaPlaceholder exercise={exercise} dark={dark} />;
}

// ─── Striped placeholder (used when no video URL) ───────
export function MediaPlaceholder({ exercise, dark = false, badge }) {
  const id = exercise ? String(exercise.id).padStart(3, '0') : '---';
  return (
    <div className={'wu-media' + (dark ? ' dark' : '')}>
      <div className="wu-media-meta">
        <span>EX/{id}</span>
        <span>{exercise?.equipment ? exercise.equipment.toUpperCase() : 'NO KIT'}</span>
      </div>
      <div className="wu-media-play">
        <div className="wu-media-play-icon">
          <Icon.Play s={14} />
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>
          {exercise?.name?.toLowerCase() || 'exercise'}
        </div>
      </div>
      {badge && (
        <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: dark ? 'rgba(255,255,255,0.55)' : 'var(--mute)', textTransform: 'uppercase' }}>
          {badge}
        </div>
      )}
    </div>
  );
}

// ─── Progress dots ──────────────────────────────────────
export function ProgressDots({ total, current }) {
  return (
    <div className="wu-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={'wu-dot ' + (i === current ? 'active' : i < current ? 'done' : '')} />
      ))}
    </div>
  );
}

// ─── Count slider (3–50) ────────────────────────────────
export function CountSlider({ value, onChange, min = 3, max = 50 }) {
  const pct = ((value - min) / (max - min)) * 100;
  const ticks = [];
  for (let n = min; n <= max; n += 5) ticks.push(n);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return (
    <div className="wu-slider">
      <div className="wu-slider-readout">
        <div className="wu-slider-num">{String(value).padStart(2, '0')}</div>
        <div className="wu-slider-unit">Exercises</div>
      </div>
      <div className="wu-slider-track-wrap">
        <div className="wu-slider-track">
          <div className="wu-slider-fill" style={{ width: pct + '%' }} />
          <div className="wu-slider-ticks">
            {ticks.map(n => (
              <div key={n} className={'wu-slider-tick' + (n <= value ? ' passed' : '')} />
            ))}
          </div>
        </div>
        <input
          type="range" min={min} max={max} step={1} value={value}
          onChange={e => onChange(parseInt(e.target.value, 10))}
          className="wu-slider-input" aria-label="Number of exercises"
        />
        <div className="wu-slider-thumb" style={{ left: pct + '%' }} />
      </div>
      <div className="wu-slider-scale">
        <span>{min} min</span><span>{max} max</span>
      </div>
    </div>
  );
}

// ─── +/− stepper ────────────────────────────────────────
export function Stepper({ value, onChange, min = 1, max = 99 }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const repeatRef = React.useRef(null);
  const startRepeat = fn => {
    fn();
    repeatRef.current = setTimeout(function tick() { fn(); repeatRef.current = setTimeout(tick, 60); }, 380);
  };
  const stopRepeat = () => clearTimeout(repeatRef.current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--soft)', borderRadius: 999, padding: 3 }}>
      <button onClick={dec} onPointerDown={() => startRepeat(dec)} onPointerUp={stopRepeat} onPointerLeave={stopRepeat} onPointerCancel={stopRepeat} disabled={value <= min} style={stepBtn(value <= min)} aria-label="Decrease">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14" /></svg>
      </button>
      <div style={{ minWidth: 30, textAlign: 'center', fontFamily: 'var(--display)', fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <button onClick={inc} onPointerDown={() => startRepeat(inc)} onPointerUp={stopRepeat} onPointerLeave={stopRepeat} onPointerCancel={stopRepeat} disabled={value >= max} style={stepBtn(value >= max)} aria-label="Increase">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  );
}

function stepBtn(disabled) {
  return {
    width: 32, height: 32, borderRadius: 999, border: 'none',
    background: 'var(--paper)', color: 'var(--ink)',
    cursor: disabled ? 'default' : 'pointer',
    display: 'grid', placeItems: 'center',
    opacity: disabled ? 0.35 : 1,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  };
}
