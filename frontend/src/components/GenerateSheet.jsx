import React from 'react';
import { Icon } from './Icons.jsx';
import { CountSlider } from './Atoms.jsx';

const EQUIPMENT_LIST = ['All', 'None', 'Band', 'Theraband', 'Hangboard', 'Mat', 'Wall'];

// Client-side warm-up generator — one per body part, then fill to count
function generateIds(exercises, count, equipFilter) {
  let pool;
  if (equipFilter.includes('All')) {
    pool = exercises;
  } else {
    pool = exercises.filter(ex => {
      if (equipFilter.includes('None') && !ex.equipment) return true;
      return equipFilter.some(ef => ex.equipment === ef);
    });
  }
  if (!pool.length) return [];

  const byPart = {};
  pool.forEach(ex => { (byPart[ex.body_part] = byPart[ex.body_part] || []).push(ex); });
  Object.values(byPart).forEach(arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  });

  const result = [];
  const parts = Object.values(byPart);
  let round = 0;
  while (result.length < count) {
    let added = false;
    for (const partExs of parts) {
      if (result.length >= count) break;
      if (round < partExs.length) { result.push(partExs[round]); added = true; }
    }
    round++;
    if (!added) break;
  }
  return result.map(e => e.id);
}

export function GenerateSheet({ open, state, dispatch }) {
  const [count, setCount] = React.useState(6);
  const [equip, setEquip] = React.useState(['All']);

  const toggleEquip = eq => {
    setEquip(prev => {
      if (eq === 'All') return ['All'];
      const without = prev.filter(x => x !== 'All' && x !== eq);
      const next = prev.includes(eq) ? without : [...without, eq];
      return next.length === 0 ? ['All'] : next;
    });
  };

  const matchCount = equip.includes('All')
    ? state.exercises.length
    : state.exercises.filter(ex => {
        if (equip.includes('None') && !ex.equipment) return true;
        return equip.some(ef => ex.equipment === ef);
      }).length;

  const equipLabel = equip.includes('All') ? 'any kit' : `${equip.length} selected`;

  const onGenerate = () => {
    const ids = generateIds(state.exercises, count, equip);
    if (!ids.length) return;
    dispatch({ type: 'startGenerated', ids });
  };

  return (
    <>
      <div className={'wu-sheet-backdrop' + (open ? ' open' : '')} onClick={() => dispatch({ type: 'closeSheets' })} />
      <div className={'wu-sheet' + (open ? ' open' : '')}>
        <div className="wu-sheet-grab" />
        <div className="wu-eyebrow" style={{ marginBottom: 4 }}>Generate</div>
        <div className="wu-display" style={{ fontSize: 30, marginBottom: 18 }}>New warm-up</div>

        <div className="wu-eyebrow" style={{ marginBottom: 6 }}>How many exercises</div>
        <div style={{ marginBottom: 22 }}>
          <CountSlider value={count} onChange={setCount} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="wu-eyebrow">Equipment available</div>
          <div className="wu-mono" style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {equipLabel} · {matchCount} match
          </div>
        </div>
        <div className="wu-chips" style={{ marginBottom: 26 }}>
          {EQUIPMENT_LIST.map(eq => {
            const selected = equip.includes(eq);
            return (
              <button key={eq} className={'wu-chip' + (selected ? ' selected' : '')} onClick={() => toggleEquip(eq)}>
                {selected && eq !== 'All' && (
                  <span style={{ display: 'inline-flex', marginRight: 4, verticalAlign: '-2px' }}>
                    <Icon.Check s={12} c="currentColor" />
                  </span>
                )}
                {eq}
              </button>
            );
          })}
        </div>

        <button onClick={onGenerate} disabled={matchCount === 0} style={{
          width: '100%', height: 58, border: 'none', borderRadius: 16,
          background: 'var(--ink)', color: 'var(--paper)',
          cursor: matchCount === 0 ? 'not-allowed' : 'pointer',
          opacity: matchCount === 0 ? 0.4 : 1,
          fontFamily: 'var(--display)', fontSize: 17, letterSpacing: '0.02em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)' }} />
          Generate &amp; start
        </button>
        <button onClick={() => dispatch({ type: 'closeSheets' })} style={{
          width: '100%', height: 44, marginTop: 8, border: 'none', background: 'transparent',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--mute)', cursor: 'pointer',
        }}>Cancel</button>
      </div>
    </>
  );
}
