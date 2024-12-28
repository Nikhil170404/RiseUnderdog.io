import { db, doc, getDoc, updateDoc } from '../../firebase';

// Action types
export const FETCH_WALLET_REQUEST = 'FETCH_WALLET_REQUEST';
export const FETCH_WALLET_SUCCESS = 'FETCH_WALLET_SUCCESS';
export const FETCH_WALLET_FAILURE = 'FETCH_WALLET_FAILURE';
export const UPDATE_WALLET_REQUEST = 'UPDATE_WALLET_REQUEST';
export const UPDATE_WALLET_SUCCESS = 'UPDATE_WALLET_SUCCESS';
export const UPDATE_WALLET_FAILURE = 'UPDATE_WALLET_FAILURE';

// Fetch wallet action
export const fetchWallet = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_WALLET_REQUEST });
  try {
    const user = getState().auth.user;
    if (!user) throw new Error('User not logged in');

    const walletRef = doc(db, 'wallets', user.uid);
    const walletDoc = await getDoc(walletRef);

    if (walletDoc.exists()) {
      const data = walletDoc.data();
      // Ensure balance is a number
      const balance = parseFloat(data.balance) || 0;
      dispatch({
        type: FETCH_WALLET_SUCCESS,
        payload: { balance }
      });
    } else {
      throw new Error('Wallet not found');
    }
  } catch (error) {
    dispatch({
      type: FETCH_WALLET_FAILURE,
      payload: error.message
    });
  }
};

// Update wallet action
export const updateWallet = (newBalance) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_WALLET_REQUEST });
  try {
    const user = getState().auth.user;
    if (!user) throw new Error('User not logged in');

    const walletRef = doc(db, 'wallets', user.uid);

    await updateDoc(walletRef, {
      balance: newBalance,
    });

    dispatch({
      type: UPDATE_WALLET_SUCCESS,
      payload: { balance: newBalance }
    });
  } catch (error) {
    dispatch({
      type: UPDATE_WALLET_FAILURE,
      payload: error.message
    });
  }
};
