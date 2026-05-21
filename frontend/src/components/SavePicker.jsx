import { Icon } from './Icons.jsx';

export function SavePicker({ open, state, dispatch }) {
  const ex = state.exercises.find(e => e.id === state.pickerExerciseId);
  if (!ex) return null;

  return (
    <>
      <div className={'wu-sheet-backdrop' + (open ? ' open' : '')} onClick={() => dispatch({ type: 'closeSheets' })} />
      <div className={'wu-sheet' + (open ? ' open' : '')}>
        <div className="wu-sheet-grab" />
        <div className="wu-eyebrow" style={{ marginBottom: 4 }}>Save to session</div>
        <div className="wu-display" style={{ fontSize: 24, marginBottom: 4 }}>{ex.name}</div>
        <div className="wu-mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>
          Pick a session
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => dispatch({ type: 'addToBuilding', id: ex.id })} style={pickerRow(true)}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 17 }}>Unsaved session</div>
              <div className="wu-mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mute)', marginTop: 2 }}>
                {state.buildingSession.length} exercises · in progress
              </div>
            </div>
            <Icon.Plus s={18} />
          </button>
          {state.sessions.map(s => {
            const has = s.exerciseIds.includes(ex.id);
            return (
              <button key={s.id} onClick={() => dispatch({ type: 'addToSession', sessionId: s.id, exerciseId: ex.id })} style={pickerRow(false)}>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 17 }}>{s.name}</div>
                  <div className="wu-mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mute)', marginTop: 2 }}>
                    {s.exerciseIds.length} exercises · {s.created_at}
                  </div>
                </div>
                {has ? <Icon.Check s={18} /> : <Icon.Plus s={18} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function pickerRow(emphasis) {
  return {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px',
    border: emphasis ? '1.5px solid var(--ink)' : '1px solid var(--line)',
    borderRadius: 14, background: 'var(--paper)', textAlign: 'left', cursor: 'pointer',
  };
}
