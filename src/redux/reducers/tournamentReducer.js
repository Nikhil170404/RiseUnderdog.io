// reducers/tournamentReducer.js

import {
  FETCH_TOURNAMENTS_REQUEST,
  FETCH_TOURNAMENTS_SUCCESS,
  FETCH_TOURNAMENTS_FAILURE,
  ADD_TOURNAMENT_SUCCESS,
  ADD_TOURNAMENT_FAILURE,
  DELETE_TOURNAMENT_SUCCESS,
  DELETE_TOURNAMENT_FAILURE,
  UPDATE_TOURNAMENT_SUCCESS,
  UPDATE_TOURNAMENT_FAILURE,
  JOIN_TOURNAMENT_SUCCESS,
  JOIN_TOURNAMENT_FAILURE
} from '../actions/types';

const initialState = {
  tournaments: [],
  loading: false,
  error: null,
};

const tournamentReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TOURNAMENTS_REQUEST:
      return { ...state, loading: true };
    case FETCH_TOURNAMENTS_SUCCESS:
      return { ...state, loading: false, tournaments: action.payload };
    case FETCH_TOURNAMENTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ADD_TOURNAMENT_SUCCESS:
      return { ...state, tournaments: [...state.tournaments, action.payload] };
    case ADD_TOURNAMENT_FAILURE:
      return { ...state, error: action.payload };
    case DELETE_TOURNAMENT_SUCCESS:
      return { ...state, tournaments: state.tournaments.filter(t => t.id !== action.payload) };
    case DELETE_TOURNAMENT_FAILURE:
      return { ...state, error: action.payload };
    case UPDATE_TOURNAMENT_SUCCESS:
      return {
        ...state,
        tournaments: state.tournaments.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case UPDATE_TOURNAMENT_FAILURE:
      return { ...state, error: action.payload };
    case JOIN_TOURNAMENT_SUCCESS:
      return {
        ...state,
        tournaments: state.tournaments.map(t =>
          t.id === action.payload.tournamentId
            ? { ...t, participants: [...t.participants, action.payload.userId] }
            : t
        ),
      };
    case JOIN_TOURNAMENT_FAILURE:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default tournamentReducer;
