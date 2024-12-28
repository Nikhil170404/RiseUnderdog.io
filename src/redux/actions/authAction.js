import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  auth,
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc
} from '../../firebase';

// Action Types
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGOUT = 'LOGOUT';
export const SET_USER = 'SET_USER';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';

const ADMIN_EMAIL = 'admin@esports.com';

// Register user
export const register = (email, password, username) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });

    // Create user in Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with username
    await updateProfile(user, {
      displayName: username,
    });

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      username: username,
      displayName: username,
      role: email === ADMIN_EMAIL ? 'admin' : 'user',
      isAdmin: email === ADMIN_EMAIL,
      createdAt: new Date().toISOString(),
      photoURL: null,
      active: true,
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // Update auth state
    dispatch({
      type: REGISTER_SUCCESS,
      payload: userData,
    });

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  } catch (error) {
    let errorMessage = 'Registration failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters.';
        break;
      default:
        errorMessage = error.message;
    }

    dispatch({
      type: REGISTER_FAIL,
      payload: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    // Sign in with Firebase Auth
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data() || {};

    // Check if user is admin
    const isAdmin = email === ADMIN_EMAIL;

    const userWithRole = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin,
      ...userData,
    };

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userWithRole));

    dispatch({
      type: LOGIN_SUCCESS,
      payload: userWithRole,
    });

  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
      payload: error.message,
    });
    throw error;
  }
};

// Logout user
export const logout = () => async (dispatch) => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
    dispatch({ type: LOGOUT });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Set user
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

// Update user profile
export const updateUserProfile = (userData) => ({
  type: UPDATE_PROFILE,
  payload: userData,
});

// Google Sign In
export const signInWithGoogle = () => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const { user } = await signInWithPopup(auth, provider);

    // Create/update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) {
      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.email.split('@')[0],
        displayName: user.displayName,
        role: 'user',
        isAdmin: false,
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL,
        active: true,
      };

      await setDoc(userRef, userData);
    }

    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: userData?.role || 'user',
        ...userData,
      },
    });

    return user;
  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
      payload: error.message,
    });
    throw error;
  }
};

// Check username availability
export const checkUsernameAvailability = async (username) => {
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username:', error);
    throw new Error('Error checking username availability');
  }
};

// Action to purchase a game
export const purchaseGame = (gameName) => async (dispatch, getState) => {
  dispatch({ type: 'PURCHASE_GAME_REQUEST' });
  try {
    const state = getState();
    const user = state.auth.user;

    if (!user) throw new Error('User not logged in');

    const userPurchasesRef = doc(db, 'userPurchases', user.uid);
    const userPurchasesDoc = await getDoc(userPurchasesRef);
    const currentPurchases = userPurchasesDoc.exists() ? userPurchasesDoc.data().purchases || [] : [];

    if (currentPurchases.includes(gameName)) {
      throw new Error('Game already purchased');
    }

    await updateGameParticipants(gameName);

    await updateDoc(userPurchasesRef, {
      purchases: [...currentPurchases, gameName]
    });

    dispatch({ type: 'PURCHASE_GAME_SUCCESS', payload: { gameName } });
  } catch (error) {
    dispatch({ type: 'PURCHASE_GAME_FAILURE', payload: error.message });
    console.error('Game purchase failed:', error.message);
  }
};

// Function to update game participants
const updateGameParticipants = async (gameName) => {
  const gameRef = doc(db, 'games', gameName);
  const gameDoc = await getDoc(gameRef);
  
  if (gameDoc.exists()) {
    const gameData = gameDoc.data();
    const updatedParticipants = gameData.participants - 1;
    
    if (updatedParticipants >= 0) {
      await updateDoc(gameRef, { participants: updatedParticipants });
    } else {
      throw new Error('No participants left for this game');
    }
  } else {
    throw new Error('Game not found');
  }
};

// Action to purchase a tournament
export const purchaseTournament = (tournamentId) => async (dispatch, getState) => {
  dispatch({ type: 'PURCHASE_TOURNAMENT_REQUEST' });
  try {
    const state = getState();
    const user = state.auth.user;

    if (!user) throw new Error('User not logged in');

    // Perform tournament purchase logic here

    dispatch({ type: 'PURCHASE_TOURNAMENT_SUCCESS', payload: tournamentId });
  } catch (error) {
    dispatch({ type: 'PURCHASE_TOURNAMENT_FAILURE', payload: error.message });
    console.error('Tournament purchase failed:', error.message);
  }
};

// Set user from localStorage
export const setUserFromLocalStorage = () => (dispatch) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    // Ensure isAdmin is set correctly
    user.isAdmin = user.email === ADMIN_EMAIL;
    dispatch({
      type: SET_USER,
      payload: user,
    });
  }
};
