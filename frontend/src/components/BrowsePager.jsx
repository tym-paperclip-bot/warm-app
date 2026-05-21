import React from 'react';
import { Icon } from './Icons.jsx';
import { VideoPlayer } from './Atoms.jsx';
import { InfoPanel } from './InfoPanel.jsx';
import { SessionsView } from './SessionsView.jsx';

// ─── Exercise card ──────────────────────────────────────
function ExerciseCard({ exercise, idx }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '88px 18px 108px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, borderRadius: 22, overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
        <VideoPlayer exercise={exercise} />
      </div>
      <div style={{ paddingTop: 18 }}>
        <div className="wu-eyebrow" style={{ marginBottom: 8 }}>
          {String(idx + 1).padStart(2, '0')} · {exercise.body_part}
        </div>
        <div className="wu-display" style={{ fontSize: 38, color: 'var(--ink)' }}>{exercise.name}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          <span className="wu-pill">{exercise.body_part}</span>
          <span className="wu-pill muted">{exercise.equipment || 'No kit'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom save FAB (Browse) ───────────────────────────
function BrowseBottomBar({ onSave, onLongPress, savedToCurrent, savedToAny }) {
  const longPressTimer = React.useRef(null);
  const longPressFired = React.useRef(false);

  const handlePointerDown = e => {
    e.stopPropagation();
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => { longPressFired.current = true; onLongPress(); }, 450);
  };
  const handlePointerUp = e => {
    e.stopPropagation();
    clearTimeout(longPressTimer.current);
    if (!longPressFired.current) onSave();
  };
  const handleCancel = () => clearTimeout(longPressTimer.current);

  return (
    <div className="wu-bar-single">
      <button
        className={'wu-bar-save large' + (savedToCurrent ? ' active' : '')}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handleCancel}
        onPointerCancel={handleCancel}
        data-no-swipe="true"
        title="Tap to save · long press to pick session"
      >
        {savedToCurrent ? <Icon.Check s={24} /> : <Icon.Plus s={24} />}
        {savedToAny && !savedToCurrent && <span className="wu-rail-dot" />}
      </button>
    </div>
  );
}

// ─── Browse view (middle pager page) ───────────────────
function BrowseView({ state, dispatch }) {
  const scrollRef = React.useRef(null);
  const exercises = state.exercises;

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      if (idx !== state.browseIdx) dispatch({ type: 'browseIdx', idx });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [state.browseIdx, dispatch]);

  const currentEx = exercises[state.browseIdx] || exercises[0] || null;

  if (exercises.length === 0) {
    return (
      <>
        <div className="wu-header">
          <span className="logo">Warm/Up</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 40px', textAlign: 'center' }}>
          <div className="wu-eyebrow">No exercises yet</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>
            Add exercises in the admin panel at <span style={{ color: 'var(--ink)', fontFamily: 'var(--mono)', fontSize: 12 }}>/admin</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="wu-header">
        <span className="logo">Warm/Up</span>
        <span style={{ color: 'var(--mute)' }}>all · {exercises.length}</span>
      </div>
      <div ref={scrollRef} className="wu-scroll">
        {exercises.map((ex, i) => (
          <div key={ex.id} className="wu-page">
            <ExerciseCard idx={i} exercise={ex} />
          </div>
        ))}
      </div>
      <BrowseBottomBar
        savedToCurrent={currentEx ? state.buildingSession.includes(currentEx.id) : false}
        savedToAny={currentEx ? state.sessions.some(s => s.exerciseIds.includes(currentEx.id)) : false}
        onSave={() => currentEx && dispatch({ type: 'toggleBuild', id: currentEx.id })}
        onLongPress={() => currentEx && dispatch({ type: 'openSavePicker', id: currentEx.id })}
      />
    </>
  );
}

// ─── Horizontal pager ───────────────────────────────────
export function BrowsePager({ state, dispatch }) {
  const containerRef = React.useRef(null);
  const drag = React.useRef({ active: false, startX: 0, startY: 0, axis: null, width: 0, dx: 0 });
  const [dragX, setDragX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  const pageIdx = state.pagerIdx ?? 1;
  const setPageIdx = idx => dispatch({ type: 'pagerIdx', idx });

  const currentEx = state.exercises[state.browseIdx] || state.exercises[0] || null;

  const onPointerDown = e => {
    if (e.target.closest('[data-no-swipe], input, button, iframe')) return;
    drag.current = {
      active: true, startX: e.clientX, startY: e.clientY,
      axis: null, width: containerRef.current.getBoundingClientRect().width, dx: 0,
    };
  };
  const onPointerMove = e => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (!drag.current.axis) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        drag.current.axis = 'x'; setDragging(true);
      } else if (Math.abs(dy) > 8) {
        drag.current.axis = 'y';
      }
    }
    if (drag.current.axis === 'x') {
      let limited = dx;
      if (pageIdx === 0 && dx > 0) limited = dx * 0.3;
      if (pageIdx === 2 && dx < 0) limited = dx * 0.3;
      drag.current.dx = limited;
      setDragX(limited);
    }
  };
  const onPointerUp = () => {
    if (drag.current.axis === 'x') {
      const threshold = drag.current.width * 0.2;
      let next = pageIdx;
      if (drag.current.dx < -threshold && pageIdx < 2) next = pageIdx + 1;
      else if (drag.current.dx > threshold && pageIdx > 0) next = pageIdx - 1;
      setPageIdx(next);
    }
    setDragX(0); setDragging(false);
    drag.current.active = false; drag.current.axis = null;
  };

  const baseX = -pageIdx * 33.333;
  const w = drag.current.width || 1;
  const dragPct = (dragX / w) * 33.333;
  const totalX = baseX + dragPct;

  return (
    <div
      ref={containerRef}
      className="wu-pager"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className={'wu-pager-track' + (dragging ? ' dragging' : '')} style={{ transform: `translateX(${totalX}%)` }}>
        <div className="wu-pager-page">
          <SessionsView state={state} dispatch={dispatch} inPager />
        </div>
        <div className="wu-pager-page">
          <BrowseView state={state} dispatch={dispatch} />
        </div>
        <div className="wu-pager-page">
          <InfoPanel exercise={currentEx} />
        </div>
      </div>

      {pageIdx === 1 && !dragging && (
        <>
          <div className="wu-edge-hint left"><span className="dot" /> Sessions</div>
          <div className="wu-edge-hint right">Info <span className="dot" /></div>
        </>
      )}
    </div>
  );
}
