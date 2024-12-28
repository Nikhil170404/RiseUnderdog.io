// actions/tournamentActions.js

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
} from './types';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../firebase';

// Fetch tournaments
export const fetchTournaments = () => async (dispatch) => {
  dispatch({ type: FETCH_TOURNAMENTS_REQUEST });
  try {
    const querySnapshot = await getDocs(collection(firestore, 'tournaments'));
    const tournaments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    dispatch({ type: FETCH_TOURNAMENTS_SUCCESS, payload: tournaments });
  } catch (error) {
    dispatch({ type: FETCH_TOURNAMENTS_FAILURE, payload: error.message });
  }
};

// Add a new tournament
export const addTournament = (newTournament) => async (dispatch) => {
  try {
    const docRef = await addDoc(collection(firestore, 'tournaments'), newTournament);
    dispatch({ type: ADD_TOURNAMENT_SUCCESS, payload: { id: docRef.id, ...newTournament } });
  } catch (error) {
    dispatch({ type: ADD_TOURNAMENT_FAILURE, payload: error.message });
  }
};

// Delete a tournament
export const deleteTournament = (id) => async (dispatch) => {
  try {
    await deleteDoc(doc(firestore, 'tournaments', id));
    dispatch({ type: DELETE_TOURNAMENT_SUCCESS, payload: id });
  } catch (error) {
    dispatch({ type: DELETE_TOURNAMENT_FAILURE, payload: error.message });
  }
};

// Update a tournament
export const updateTournament = (id, updatedData) => async (dispatch) => {
  try {
    await updateDoc(doc(firestore, 'tournaments', id), updatedData);
    dispatch({ type: UPDATE_TOURNAMENT_SUCCESS, payload: { id, ...updatedData } });
  } catch (error) {
    dispatch({ type: UPDATE_TOURNAMENT_FAILURE, payload: error.message });
  }
};

// Join a tournament
export const joinTournament = (tournamentId, userId) => async (dispatch) => {
  try {
    const tournamentRef = doc(firestore, 'tournaments', tournamentId);
    await updateDoc(tournamentRef, {
      participants: arrayUnion(userId)
    });
    dispatch({ type: JOIN_TOURNAMENT_SUCCESS, payload: { tournamentId, userId } });
  } catch (error) {
    dispatch({ type: JOIN_TOURNAMENT_FAILURE, payload: error.message });
  }
};
