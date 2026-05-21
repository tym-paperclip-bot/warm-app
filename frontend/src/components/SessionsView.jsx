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

// Pencil icon (not in the shared set)
function PencilIcon({ s = 16, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// Trash icon
function TrashIcon({ s = 16, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

// Edit sheet — rename + delete
function EditSessionSheet({ session, onClose, onRenamed, onDeleted }) {
  const [name, setName] = React.useState(session.name);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    // Focus input when sheet opens
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  const handleSave = async () => {
    if (!name.trim() || name.trim() === session.name) { onClose(); return; }
    setSaving(true);
    try {
      const updated = await api.renameSession(session.id, name.trim());
      onRenamed(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.deleteSession(session.id);
      onDeleted(session.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="wu-sheet-backdrop open" onClick={onClose} />
      <div className="wu-sheet open">
        <div className="wu-sheet-grab" />
        <div className="wu-eyebrow" style={{ marginBottom: 4 }}>Edit session</div>
        <div className="wu-display" style={{ fontSize: 26, marginBottom: 20 }}>{session.name}</div>

        <div style={{ marginBottom: 20 }}>
          <div className="wu-eyebrow" style={{ marginBottom: 8 }}>Name</div>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{
              width: '100%', height: 52, padding: '0 16px',
              border: '1.5px solid var(--ink)', borderRadius: 14,
              fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 500,
              background: 'var(--paper)', color: 'var(--ink)', outline: 'none',
            }}
          />
        </div>

        <button onClick={handleSave} disabled={saving || !name.trim()} style={{
          width: '100%', height: 52, border: 'none', borderRadius: 14,
          background: 'var(--ink)', color: 'var(--paper)', cursor: saving ? 'default' : 'pointer',
          opacity: (!name.trim() || saving) ? 0.5 : 1,
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10,
        }}>
          {saving ? 'Saving…' : 'Save name'}
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} style={{
            width: '100%', height: 52, border: '1.5px solid var(--line-2)', borderRadius: 14,
            background: 'var(--paper)', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mute)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <TrashIcon s={14} c="var(--mute)" /> Delete session
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ ...ghostBtn, flex: 1, height: 52, borderRadius: 14 }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={saving} style={{
              flex: 1, height: 52, border: 'none', borderRadius: 14,
              background: '#CC2200', color: '#fff', cursor: saving ? 'default' : 'pointer',
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <TrashIcon s={14} c="#fff" /> Delete
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function SessionsView({ state, dispatch, inPager }) {
  const [editingSession, setEditingSession] = React.useState(null);

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

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '64px 22px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="wu-eyebrow" style={{ marginBottom: 6 }}>Library</div>
          <div className="wu-display" style={{ fontSize: 44 }}>Sessions</div>
          <div className="wu-mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 10 }}>
            {state.sessions.length} saved{state.buildingSession.length ? ` · ${state.buildingSession.length} in progress` : ''}
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'goto', view: 'settings' })} data-no-swipe="true" style={{
          width: 40, height: 40, borderRadius: 999, border: '1.5px solid var(--ink)',
          background: 'var(--paper)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
        }} title="Settings">
          <Icon.Gear s={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="wu-noscroll">
        {state.buildingSession.length > 0 && (
          <div className="wu-row" onClick={() => dispatch({ type: 'startBuilding' })} style={{ background: '#FFF6F1' }}>
            <div>
              <div className="t1">Unsaved session</div>
              <div className="t2">
                <span style={{ color: 'var(--accent)' }}>●</span> {state.buildingSession.length} exercises · ready
              </div>
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
          <div key={s.id} className="wu-row" onClick={() => dispatch({ type: 'startSession', sessionId: s.id })}>
            <div style={{ minWidth: 0 }}>
              <div className="t1">{s.name}</div>
              <div className="t2">{s.exerciseIds.length} exercises · {s.created_at}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                style={{ ...ghostBtn, padding: '0 12px' }}
                data-no-swipe="true"
                onClick={e => { e.stopPropagation(); setEditingSession(s); }}
                title="Edit"
              >
                <PencilIcon s={14} />
              </button>
              <button style={solidBtn} data-no-swipe="true" onClick={e => { e.stopPropagation(); dispatch({ type: 'startSession', sessionId: s.id }); }}>
                <Icon.Play s={12} c="#fff" /> Start
              </button>
            </div>
          </div>
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

      {editingSession && (
        <EditSessionSheet
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onRenamed={updated => { dispatch({ type: 'sessionRenamed', session: updated }); setEditingSession(null); }}
          onDeleted={id => { dispatch({ type: 'sessionDeleted', id }); setEditingSession(null); }}
        />
      )}
    </div>
  );
}
