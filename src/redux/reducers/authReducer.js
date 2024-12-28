import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGOUT,
  SET_USER,
  UPDATE_PROFILE,
} from '../actions/authAction';

const storedUser = localStorage.getItem('user');
const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  loading: false,
  error: null,
  isAuthenticated: !!storedUser,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case LOGIN_FAIL:
    case REGISTER_FAIL:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };

    case LOGOUT:
      localStorage.removeItem('user');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };

    case SET_USER:
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload,
          loading: false,
        };
      } else {
        localStorage.removeItem('user');
        return {
          ...state,
          isAuthenticated: false,
          user: null,
          loading: false,
        };
      }

    case UPDATE_PROFILE:
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
      };

    default:
      return state;
  }
};

export default authReducer;
