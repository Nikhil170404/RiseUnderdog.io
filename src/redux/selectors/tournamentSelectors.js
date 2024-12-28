import { createSelector } from 'reselect';

// Selector to access the tournaments slice of the state
const selectTournamentsState = (state) => state.tournaments || {};

// Ensure the selector returns the same reference if the input state hasn't changed
export const selectTournaments = createSelector(
  [selectTournamentsState],
  (tournamentsState) => {
    // Directly return the tournaments array, which should be a stable reference
    return tournamentsState.tournaments || [];
  }
);

export const selectError = createSelector(
  [selectTournamentsState],
  (tournamentsState) => {
    // Directly return the error, which should be a stable reference
    return tournamentsState.error || null;
  }
);
