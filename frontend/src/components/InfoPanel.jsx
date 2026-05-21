import { Icon } from './Icons.jsx';

export function InfoPanel({ exercise }) {
  if (!exercise) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '64px 26px 28px', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
        <span className="wu-eyebrow">Details</span>
        <span className="wu-mono" style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          EX/{String(exercise.id).padStart(3, '0')}
        </span>
      </div>

      <div className="wu-eyebrow" style={{ marginBottom: 10 }}>{exercise.body_part}</div>
      <div className="wu-display" style={{ fontSize: 38, marginBottom: 20 }}>{exercise.name}</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 30, flexWrap: 'wrap' }}>
        <span className="wu-pill">{exercise.body_part}</span>
        <span className="wu-pill muted">{exercise.equipment || 'No kit'}</span>
      </div>

      {exercise.notes && <InfoBlock label="Notes" value={exercise.notes} />}
      {exercise.notes && exercise.from && <div style={{ height: 28 }} />}
      {exercise.from && <InfoBlock label="From" value={exercise.from} />}

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mute)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        <Icon.Chevron dir="left" s={10} /> Swipe back to exercise
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div className="wu-eyebrow" style={{ marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 18, lineHeight: 1.4, color: 'var(--ink)', fontWeight: 500, letterSpacing: '-0.005em' }}>{value}</div>
    </div>
  );
}
