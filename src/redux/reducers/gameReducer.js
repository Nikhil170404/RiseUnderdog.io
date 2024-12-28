import {
  FETCH_GAMES_REQUEST,
  FETCH_GAMES_SUCCESS,
  FETCH_GAMES_FAIL,
  ADD_GAME_SUCCESS,
  UPDATE_GAME_SUCCESS,
  DELETE_GAME_SUCCESS,
  GAME_ERROR,
} from '../actions/gameActions';

const initialState = {
  games: [],
  loading: false,
  error: null,
};

const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GAMES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_GAMES_SUCCESS:
      return {
        ...state,
        loading: false,
        games: action.payload,
        error: null,
      };

    case FETCH_GAMES_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_GAME_SUCCESS:
      return {
        ...state,
        games: [...state.games, action.payload],
        error: null,
      };

    case UPDATE_GAME_SUCCESS:
      return {
        ...state,
        games: state.games.map((game) =>
          game.id === action.payload.id ? action.payload : game
        ),
        error: null,
      };

    case DELETE_GAME_SUCCESS:
      return {
        ...state,
        games: state.games.filter((game) => game.id !== action.payload),
        error: null,
      };

    case GAME_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default gameReducer;
