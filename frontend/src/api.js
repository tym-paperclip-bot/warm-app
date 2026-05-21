function normalizeExercise(ex) {
  return {
    id: ex.id,
    name: ex.name,
    body_part: ex.body_part.name,
    body_part_id: ex.body_part.id,
    equipment: ex.equipment?.name ?? null,
    equipment_id: ex.equipment?.id ?? null,
    video_url: ex.video_url,
    video_provider: ex.video_provider,
    notes: ex.notes,
    timestamp: ex.timestamp,
    from: ex.from_who,
  };
}

function normalizeSession(s) {
  return {
    id: s.id,
    name: s.name || `Session #${s.id}`,
    created_at: (s.created_at || '').slice(0, 10),
    exerciseIds: s.exercise_ids ?? s.exercises?.map(e => e.id) ?? [],
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`${options.method || 'GET'} ${path} → ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  async getMe() {
    return apiFetch('/auth/me');
  },

  async getExercises() {
    const data = await apiFetch('/exercises');
    return data.map(normalizeExercise);
  },

  async getSessions() {
    const data = await apiFetch('/sessions');
    return data.map(normalizeSession);
  },

  async createSession(exerciseIds, name) {
    const data = await apiFetch('/sessions', {
      method: 'POST',
      body: JSON.stringify({ exercise_ids: exerciseIds, name }),
    });
    return normalizeSession(data);
  },

  async updateSession(id, { name, exerciseIds } = {}) {
    const body = {};
    if (name !== undefined) body.name = name;
    if (exerciseIds !== undefined) body.exercise_ids = exerciseIds;
    const data = await apiFetch(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return normalizeSession(data);
  },

  async deleteSession(id) {
    await apiFetch(`/sessions/${id}`, { method: 'DELETE' });
  },
};
