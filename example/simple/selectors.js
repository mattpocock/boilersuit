import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

/**
 * Direct selector to the adminManageAssessments state domain
 */
export const selectAdminManageAssessmentsDomain = state => state.get('adminManageAssessments');
// @suit-start

/** Get Tweets Selectors */

export const makeSelectGetTweets = () =>
  createSelector(selectSimpleDomain, (substate) =>
    // this ternary checks if the domain is immutable, and parses it correctly
    fromJS(substate.toJS ? substate.get('getTweets') : substate.getTweets),
  );

export const makeSelectGetTweetsIsLoading = () =>
  createSelector(makeSelectGetTweets(), (substate) =>
    substate.get('isLoading'),
  );

export const makeSelectGetTweetsHasSucceeded = () =>
  createSelector(makeSelectGetTweets(), (substate) =>
    substate.get('hasSucceeded'),
  );

export const makeSelectGetTweetsHasError = () =>
  createSelector(makeSelectGetTweets(), (substate) =>
    substate.get('hasError'),
  );

export const makeSelectGetTweetsErrorMessage = () =>
  createSelector(makeSelectGetTweets(), (substate) =>
    substate.get('errorMessage'),
  );

export const makeSelectGetTweetsData = () =>
  createSelector(makeSelectGetTweets(), (substate) =>
    substate.get('data'),
  );

/** Get Todos Selectors */

export const makeSelectGetTodos = () =>
  createSelector(selectSimpleDomain, (substate) =>
    // this ternary checks if the domain is immutable, and parses it correctly
    fromJS(substate.toJS ? substate.get('getTodos') : substate.getTodos),
  );

export const makeSelectGetTodosIsLoading = () =>
  createSelector(makeSelectGetTodos(), (substate) =>
    substate.get('isLoading'),
  );

export const makeSelectGetTodosHasSucceeded = () =>
  createSelector(makeSelectGetTodos(), (substate) =>
    substate.get('hasSucceeded'),
  );

export const makeSelectGetTodosHasError = () =>
  createSelector(makeSelectGetTodos(), (substate) =>
    substate.get('hasError'),
  );

export const makeSelectGetTodosErrorMessage = () =>
  createSelector(makeSelectGetTodos(), (substate) =>
    substate.get('errorMessage'),
  );

export const makeSelectGetTodosData = () =>
  createSelector(makeSelectGetTodos(), (substate) =>
    substate.get('data'),
  );

// @suit-end
