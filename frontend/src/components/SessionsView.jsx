import React from 'react';
import { Icon } from './Icons.jsx';
import { api } from '../api.js';

const ghostBtn = {
  padding: '0 14px', height: 36, border: '1.5px solid var(--ink)', borderRadius: 10,
  background: 'transparent', cursor: 'pointer',
  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
};
const solidBtn = {
  padding: '0 14px', height: 36, border: 'none', borderRadius: 10,
  background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer',
  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

// ─── Session row with long-press actions ────────────────
function SessionRow({ session, onStart, onEdit, onDelete }) {
  const [active, setActive] = React.useState(false);
  const timerRef = React.useRef(null);
  const pressRef = React.useRef({ fired: false, x: 0, y: 0 });

  const cancelTimer = () => clearTimeout(timerRef.current);

  const onPointerDown = e => {
    if (e.target.closest('button')) return;
    pressRef.current = { fired: false, x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      pressRef.current.fired = true;
      setActive(true);
    }, 450);
  };
  const onPointerMove = e => {
    const p = pressRef.current;
    if (Math.abs(e.clientX - p.x) > 8 || Math.abs(e.clientY - p.y) > 8) cancelTimer();
  };
  const onClick = () => {
    if (pressRef.current.fired) return;
    if (active) { setActive(false); return; }
    onStart();
  };

  return (
    <div
      className={'wu-row wu-session-row' + (active ? ' wu-session-row--active' : '')}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={cancelTimer}
      onPointerCancel={cancelTimer}
      onClick={onClick}
    >
      <div>
        <div className="t1">{session.name}</div>
        <div className="t2">{session.exerciseIds.length} exercises · {session.created_at}</div>
      </div>
      {active ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn} onClick={e => { e.stopPropagation(); setActive(false); onEdit(); }}>Edit</button>
          <button style={{ ...ghostBtn, borderColor: 'var(--accent)', color: 'var(--accent)' }}
            onClick={e => { e.stopPropagation(); setActive(false); onDelete(); }}>Delete</button>
        </div>
      ) : (
        <button style={solidBtn} onClick={e => { e.stopPropagation(); onStart(); }}>
          <Icon.Play s={12} c="#fff" /> Start
        </button>
      )}
    </div>
  );
}

// ─── Edit session sheet ─────────────────────────────────
function EditSessionSheet({ open, state, dispatch }) {
  const session = state.sessions.find(s => s.id === state.editingSessionId);
  const [name, setName] = React.useState('');
  const [exerciseIds, setExerciseIds] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [draggingIdx, setDraggingIdx] = React.useState(null);
  const dragRef = React.useRef({ active: false, idx: -1, startY: 0, itemH: 0 });

  React.useEffect(() => {
    if (open && session) {
      setName(session.name);
      setExerciseIds([...session.exerciseIds]);
    }
  }, [open, session?.id]);

  if (!session) {
    return <div className={'wu-sheet-backdrop' + (open ? ' open' : '')} onClick={() => dispatch({ type: 'closeSheets' })} />;
  }

  const exercises = exerciseIds.map(id => state.exercises.find(e => e.id === id)).filter(Boolean);

  const removeAt = idx => setExerciseIds(prev => prev.filter((_, i) => i !== idx));

  const onGripDown = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    const itemEl = e.currentTarget.closest('.wu-edit-item');
    const h = (itemEl?.getBoundingClientRect().height ?? 60) + 6;
    dragRef.current = { active: true, idx, startY: e.clientY, itemH: h };
    setDraggingIdx(idx);
  };

  const onDragMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    e.preventDefault();
    const steps = Math.round((e.clientY - d.startY) / d.itemH);
    if (steps === 0) return;
    const newIdx = Math.max(0, Math.min(exercises.length - 1, d.idx + steps));
    if (newIdx === d.idx) return;
    setExerciseIds(prev => {
      const next = [...prev];
      const [item] = next.splice(d.idx, 1);
      next.splice(newIdx, 0, item);
      return next;
    });
    d.startY += steps * d.itemH;
    d.idx = newIdx;
    setDraggingIdx(newIdx);
  };

  const onDragUp = () => {
    dragRef.current.active = false;
    setDraggingIdx(null);
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      const nameChanged = name.trim() && name.trim() !== session.name;
      const idsChanged = JSON.stringify(exerciseIds) !== JSON.stringify(session.exerciseIds);
      if (nameChanged || idsChanged) {
        const update = {};
        if (nameChanged) update.name = name.trim();
        if (idsChanged) update.exerciseIds = exerciseIds;
        const updated = await api.updateSession(session.id, update);
        dispatch({ type: 'sessionUpdated', session: updated });
      }
    } finally {
      setSaving(false);
      dispatch({ type: 'closeSheets' });
    }
  };

  return (
    <>
      <div className={'wu-sheet-backdrop' + (open ? ' open' : '')} onClick={handleDone} />
      <div
        className={'wu-sheet tall' + (open ? ' open' : '')}
        onPointerMove={onDragMove}
        onPointerUp={onDragUp}
        onPointerCancel={onDragUp}
      >
        <div className="wu-sheet-grab" />
        <div className="wu-eyebrow" style={{ marginBottom: 4 }}>Edit session</div>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="wu-edit-name"
          placeholder="Session name"
        />

        <div className="wu-mono" style={{ fontSize: 10, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
          {exercises.length} exercises · drag to reorder
        </div>

        <div className="wu-edit-list">
          {exercises.map((ex, i) => (
            <div key={ex.id} className={'wu-edit-item' + (draggingIdx === i ? ' dragging' : '')}>
              <div
                className="wu-edit-item-grip"
                onPointerDown={e => onGripDown(e, i)}
              >
                <Icon.Grip s={14} c="var(--mute)" />
                <span className="wu-mono" style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, lineHeight: 1.15, color: 'var(--ink)' }}>{ex.name}</div>
                <div className="wu-mono" style={{ fontSize: 9, color: 'var(--mute)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
                  {ex.body_part} · {ex.equipment || 'No kit'}
                </div>
              </div>
              <button className="wu-edit-icon danger" onClick={() => removeAt(i)} title="Remove">
                <Icon.Trash s={14} />
              </button>
            </div>
          ))}
          {exercises.length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--mute)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              No exercises left
            </div>
          )}
        </div>

        <button onClick={handleDone} disabled={saving} style={{
          width: '100%', height: 54, marginTop: 18, border: 'none', borderRadius: 16,
          background: 'var(--ink)', color: 'var(--paper)', cursor: saving ? 'default' : 'pointer',
          fontFamily: 'var(--display)', fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase',
          opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving…' : 'Done'}
        </button>
      </div>
    </>
  );
}

export function SessionsView({ state, dispatch, inPager }) {
  const handleSave = async e => {
    e.stopPropagation();
    if (!state.buildingSession.length) return;
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    try {
      const session = await api.createSession(state.buildingSession, `Session — ${date}`);
      dispatch({ type: 'sessionSaved', session });
    } catch {
      // unsaved session stays in state
    }
  };

  const handleDelete = async id => {
    try {
      await api.deleteSession(id);
      dispatch({ type: 'sessionDeleted', id });
    } catch {
      // keep in state if delete fails
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'max(20px, env(safe-area-inset-top)) 22px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="wu-eyebrow" style={{ marginBottom: 6 }}>Library</div>
          <div className="wu-display" style={{ fontSize: 44 }}>Sessions</div>
          <div className="wu-mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 10 }}>
            {state.sessions.length} saved{state.buildingSession.length ? ` · ${state.buildingSession.length} in progress` : ''}
          </div>
          <div className="wu-mono" style={{ fontSize: 9, color: 'var(--mute-2)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 6 }}>
            Hold a session to edit or delete
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'goto', view: 'settings' })} data-no-swipe="true" style={{
          width: 40, height: 40, borderRadius: 999, border: '1.5px solid var(--ink)',
          background: 'var(--paper)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
        }} title="Settings">
          <Icon.Gear s={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }} className="wu-noscroll">
        {state.buildingSession.length > 0 && (
          <div className="wu-row" onClick={() => dispatch({ type: 'startBuilding' })} style={{ background: '#FFF6F1', borderBottom: '1px solid var(--line)' }}>
            <div>
              <div className="t1">Unsaved session</div>
              <div className="t2"><span style={{ color: 'var(--accent)' }}>●</span> {state.buildingSession.length} exercises · ready</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} style={ghostBtn} data-no-swipe="true">Save</button>
              <button onClick={e => { e.stopPropagation(); dispatch({ type: 'startBuilding' }); }} style={solidBtn} data-no-swipe="true">
                <Icon.Play s={12} c="#fff" /> Start
              </button>
            </div>
          </div>
        )}

        {state.sessions.map(s => (
          <SessionRow
            key={s.id}
            session={s}
            onStart={() => dispatch({ type: 'startSession', sessionId: s.id })}
            onEdit={() => dispatch({ type: 'openEditSession', id: s.id })}
            onDelete={() => handleDelete(s.id)}
          />
        ))}

        {state.sessions.length === 0 && state.buildingSession.length === 0 && (
          <div style={{ padding: '48px 22px', textAlign: 'center' }}>
            <div className="wu-eyebrow" style={{ marginBottom: 8 }}>No sessions yet</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>
              Save exercises while browsing, or generate a warm-up to get started.
            </div>
          </div>
        )}
      </div>

      {inPager ? (
        <div style={{ padding: '14px 22px 38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mute)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Swipe back to exercise <Icon.Chevron dir="right" s={10} />
        </div>
      ) : (
        <div style={{ padding: '12px 22px 38px', borderTop: '1px solid var(--line)' }}>
          <button onClick={() => dispatch({ type: 'goto', view: 'browse' })} style={{
            width: '100%', height: 50, border: '1.5px solid var(--ink)', background: 'var(--paper)',
            borderRadius: 14, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>← Back to browse</button>
        </div>
      )}

      {/* Generate warm-up FAB */}
      <div className="wu-bar-single wide">
        <button className="wu-bar-cta wide" onClick={() => dispatch({ type: 'openGenerate' })} data-no-swipe="true">
          <span className="dot" />
          <span>Generate warm-up</span>
          {state.buildingSession.length > 0 && <span className="badge">{state.buildingSession.length}</span>}
        </button>
      </div>

      <EditSessionSheet
        open={state.sheet === 'editSession'}
        state={state}
        dispatch={dispatch}
      />
    </div>
  );
}
