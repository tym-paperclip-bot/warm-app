export function appReducer(state, action) {
  switch (action.type) {
    case 'authRequired':
      return { ...state, loading: false, signedIn: false };
    case 'signIn':
      return { ...state, signedIn: true, email: action.email, loading: false };
    case 'signOut':
      return { ...makeInitialState(), loading: false, signedIn: false };
    case 'dataLoaded':
      return { ...state, exercises: action.exercises, sessions: action.sessions, loading: false };
    case 'sessionsReloaded':
      return { ...state, sessions: action.sessions };

    case 'goto':
      if (action.view === 'sessions') return { ...state, view: 'browse', pagerIdx: 0, sheet: null };
      if (action.view === 'browse') return { ...state, view: 'browse', pagerIdx: 1, sheet: null };
      return { ...state, view: action.view, sheet: null };
    case 'pagerIdx':
      return { ...state, pagerIdx: action.idx };
    case 'browseIdx':
      if (state.browseIdx === action.idx) return state;
      return { ...state, browseIdx: action.idx };
    case 'playerIdx':
      return { ...state, playerIdx: action.idx };

    case 'openGenerate':
      return { ...state, sheet: 'generate' };
    case 'openSavePicker':
      return { ...state, sheet: 'save', pickerExerciseId: action.id };
    case 'closeSheets':
      return { ...state, sheet: null };

    case 'toggleBuild': {
      const has = state.buildingSession.includes(action.id);
      return {
        ...state,
        buildingSession: has
          ? state.buildingSession.filter(id => id !== action.id)
          : [...state.buildingSession, action.id],
      };
    }
    case 'addToBuilding': {
      const has = state.buildingSession.includes(action.id);
      return {
        ...state, sheet: null,
        buildingSession: has ? state.buildingSession : [...state.buildingSession, action.id],
      };
    }
    case 'addToSession': {
      const next = state.sessions.map(s => {
        if (s.id !== action.sessionId) return s;
        if (s.exerciseIds.includes(action.exerciseId)) return s;
        return { ...s, exerciseIds: [...s.exerciseIds, action.exerciseId] };
      });
      return { ...state, sessions: next, sheet: null };
    }
    case 'sessionSaved': {
      return {
        ...state,
        sessions: [action.session, ...state.sessions],
        buildingSession: [],
      };
    }
    case 'sessionUpdated': {
      return {
        ...state,
        sessions: state.sessions.map(s => s.id === action.session.id ? action.session : s),
      };
    }
    case 'sessionDeleted': {
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.id),
        editingSessionId: state.editingSessionId === action.id ? null : state.editingSessionId,
        sheet: state.editingSessionId === action.id ? null : state.sheet,
      };
    }
    case 'openEditSession':
      return { ...state, sheet: 'editSession', editingSessionId: action.id };
    case 'startBuilding':
      if (!state.buildingSession.length) return state;
      return { ...state, view: 'player', playerIds: state.buildingSession, playerIdx: 0, sheet: null };
    case 'startSession': {
      const s = state.sessions.find(x => x.id === action.sessionId);
      if (!s) return state;
      return { ...state, view: 'player', playerIds: s.exerciseIds, playerIdx: 0, sheet: null };
    }
    case 'startGenerated':
      return { ...state, view: 'player', playerIds: action.ids, playerIdx: 0, sheet: null };
    case 'finishSession':
      return { ...state, view: 'browse', pagerIdx: 0, playerIds: [], playerIdx: 0 };

    default:
      return state;
  }
}

export function makeInitialState() {
  return {
    loading: true,
    signedIn: false,
    email: '',
    view: 'browse',
    sheet: null,
    pagerIdx: 1,
    browseIdx: 0,
    playerIds: [],
    playerIdx: 0,
    pickerExerciseId: null,
    editingSessionId: null,
    buildingSession: [],
    exercises: [],
    sessions: [],
  };
}
