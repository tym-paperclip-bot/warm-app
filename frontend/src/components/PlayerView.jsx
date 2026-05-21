import React from 'react';
import { Icon } from './Icons.jsx';
import { VideoPlayer, ProgressDots } from './Atoms.jsx';

export function PlayerView({ state, dispatch }) {
  const scrollRef = React.useRef(null);
  const [confirmExit, setConfirmExit] = React.useState(false);

  const exercises = state.playerIds
    .map(id => state.exercises.find(e => e.id === id))
    .filter(Boolean);
  const total = exercises.length;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = state.playerIdx * scrollRef.current.clientHeight;
    }
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      if (idx !== state.playerIdx) dispatch({ type: 'playerIdx', idx });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [state.playerIdx, dispatch]);

  const goTo = i => {
    scrollRef.current?.scrollTo({ top: i * scrollRef.current.clientHeight, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', top: 54, left: 16, right: 16, zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setConfirmExit(true)} style={{ width: 38, height: 38, borderRadius: 999, border: '1.5px solid var(--ink)', background: 'var(--paper)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon.Close s={16} />
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="wu-eyebrow" style={{ marginBottom: 2 }}>Warm-up</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {String(state.playerIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div ref={scrollRef} className="wu-scroll">
        {exercises.map((ex, i) => (
          <div key={ex.id} className="wu-page">
            <PlayerCard exercise={ex} idx={i} total={total} />
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 28, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '0 24px' }}>
        <ProgressDots total={total} current={state.playerIdx} />
        <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => goTo(Math.max(0, state.playerIdx - 1))} disabled={state.playerIdx === 0} style={navBtn(state.playerIdx === 0)}>
            <Icon.Chevron dir="up" s={14} />
          </button>
          {state.playerIdx === total - 1 ? (
            <button onClick={() => dispatch({ type: 'finishSession' })} style={{ flex: 1, maxWidth: 240, height: 50, border: 'none', borderRadius: 14, background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontFamily: 'var(--display)', fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon.Check s={16} c="#fff" /> Finish
            </button>
          ) : (
            <div style={{ flex: 1, maxWidth: 240, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mute)' }}>
              Swipe for next
            </div>
          )}
          <button onClick={() => goTo(Math.min(total - 1, state.playerIdx + 1))} disabled={state.playerIdx === total - 1} style={navBtn(state.playerIdx === total - 1)}>
            <Icon.Chevron dir="down" s={14} />
          </button>
        </div>
      </div>

      {/* Exit confirmation */}
      <div className={'wu-popup-backdrop' + (confirmExit ? ' open' : '')} onClick={() => setConfirmExit(false)} />
      <div className={'wu-popup' + (confirmExit ? ' open' : '')}>
        <div className="wu-eyebrow" style={{ marginBottom: 10 }}>End session</div>
        <div className="wu-display" style={{ fontSize: 26, lineHeight: 1.05, marginBottom: 10 }}>Exit warm-up?</div>
        <div className="wu-popup-body" style={{ paddingRight: 0, marginBottom: 22, color: 'var(--mute)' }}>
          You're on exercise {state.playerIdx + 1} of {total}. Progress won't be saved.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setConfirmExit(false)} style={{ flex: 1, height: 50, border: '1.5px solid var(--ink)', background: 'var(--paper)', borderRadius: 14, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>Keep going</button>
          <button onClick={() => { setConfirmExit(false); dispatch({ type: 'goto', view: 'sessions' }); }} style={{ flex: 1, height: 50, border: 'none', borderRadius: 14, background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Exit</button>
        </div>
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    width: 50, height: 50, borderRadius: 14, border: '1.5px solid var(--ink)', background: 'var(--paper)',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.25 : 1, display: 'grid', placeItems: 'center',
  };
}

function PlayerCard({ exercise, idx, total }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '120px 16px 170px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, borderRadius: 24, overflow: 'hidden', position: 'relative', background: 'var(--ink)' }}>
        <VideoPlayer exercise={exercise} dark />
        <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
          {String(idx + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </div>
      </div>
      <div style={{ paddingTop: 18 }}>
        <div className="wu-eyebrow" style={{ marginBottom: 8 }}>{exercise.body_part}</div>
        <div className="wu-display" style={{ fontSize: 32, lineHeight: 0.94 }}>{exercise.name}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {exercise.notes && <span className="wu-pill solid">{exercise.notes}</span>}
          {exercise.equipment && <span className="wu-pill muted">{exercise.equipment}</span>}
        </div>
      </div>
    </div>
  );
}
