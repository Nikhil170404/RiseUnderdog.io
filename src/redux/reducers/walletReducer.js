import {
  FETCH_WALLET_REQUEST,
  FETCH_WALLET_SUCCESS,
  FETCH_WALLET_FAILURE,
  UPDATE_WALLET_REQUEST,
  UPDATE_WALLET_SUCCESS,
  UPDATE_WALLET_FAILURE
} from '../actions/walletAction';

const initialState = {
  balance: 0,
  loading: false,
  error: null
};

const walletReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WALLET_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_WALLET_SUCCESS:
      return { ...state, loading: false, balance: action.payload.balance };
    case FETCH_WALLET_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_WALLET_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_WALLET_SUCCESS:
      return { ...state, loading: false, balance: action.payload.balance };
    case UPDATE_WALLET_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default walletReducer;
