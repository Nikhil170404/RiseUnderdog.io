import { db, collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from '../../firebase';

// Action Types
export const FETCH_GAMES_REQUEST = 'FETCH_GAMES_REQUEST';
export const FETCH_GAMES_SUCCESS = 'FETCH_GAMES_SUCCESS';
export const FETCH_GAMES_FAIL = 'FETCH_GAMES_FAIL';
export const ADD_GAME_SUCCESS = 'ADD_GAME_SUCCESS';
export const UPDATE_GAME_SUCCESS = 'UPDATE_GAME_SUCCESS';
export const DELETE_GAME_SUCCESS = 'DELETE_GAME_SUCCESS';
export const GAME_ERROR = 'GAME_ERROR';

// Fetch all games
export const fetchGames = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_GAMES_REQUEST });

    const gamesRef = collection(db, 'games');
    const querySnapshot = await getDocs(gamesRef);
    
    const games = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    dispatch({
      type: FETCH_GAMES_SUCCESS,
      payload: games,
    });
  } catch (error) {
    dispatch({
      type: FETCH_GAMES_FAIL,
      payload: error.message,
    });
  }
};

// Add a new game
export const addGame = (gameData) => async (dispatch) => {
  try {
    const gamesRef = collection(db, 'games');
    const docRef = await addDoc(gamesRef, {
      ...gameData,
      createdAt: new Date(),
      active: true,
    });

    dispatch({
      type: ADD_GAME_SUCCESS,
      payload: {
        id: docRef.id,
        ...gameData,
      },
    });
  } catch (error) {
    dispatch({
      type: GAME_ERROR,
      payload: error.message,
    });
    throw error;
  }
};

// Update a game
export const updateGame = (gameId, gameData) => async (dispatch) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      ...gameData,
      updatedAt: new Date(),
    });

    dispatch({
      type: UPDATE_GAME_SUCCESS,
      payload: {
        id: gameId,
        ...gameData,
      },
    });
  } catch (error) {
    dispatch({
      type: GAME_ERROR,
      payload: error.message,
    });
    throw error;
  }
};

// Delete a game
export const deleteGame = (gameId) => async (dispatch) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    await deleteDoc(gameRef);

    dispatch({
      type: DELETE_GAME_SUCCESS,
      payload: gameId,
    });
  } catch (error) {
    dispatch({
      type: GAME_ERROR,
      payload: error.message,
    });
    throw error;
  }
};
