/*
 *
 * AdminManageAssessments reducer
 *
 */

import { fromJS } from 'immutable';
import { combineReducers } from 'redux';
import {
  GET_ASSESSMENTS_STARTED,
  GET_ASSESSMENTS_FAILED,
  GET_ASSESSMENTS_SUCCEEDED,
  APPLY_FILTER,
  GET_ROUTES_STARTED,
  GET_ROUTES_FAILED,
  GET_ROUTES_SUCCEEDED,
  GET_TWEETS_STARTED, // @suit-line
  GET_TWEETS_SUCCEEDED, // @suit-line
  GET_TWEETS_FAILED, // @suit-line
  GET_TODOS_STARTED, // @suit-line
  GET_TODOS_SUCCEEDED, // @suit-line
  GET_TODOS_FAILED, // @suit-line
} from './constants';

const initialAssessmentsState = fromJS({
  isGetAssessmentsLoading: false,
  hasGetAssessmentsFailed: false,
  hasGetAssessmentsSucceeded: false,
  assessmentsList: [],
  getAssessmentsErrorMessage: '',
});

export const assessmentsReducer = (state = initialAssessmentsState, action) => {
  switch (action.type) {
    case GET_ASSESSMENTS_STARTED:
      return state.set('isGetAssessmentsLoading', true);
    case GET_ASSESSMENTS_FAILED:
      return state
        .set('isGetAssessmentsLoading', false)
        .set('hasGetAssessmentsFailed', true)
        .set('getAssessmentsErrorMessage', action.payload);
    case GET_ASSESSMENTS_SUCCEEDED:
      return state
        .set('isGetAssessmentsLoading', false)
        .set('hasGetAssessmentsSucceeded', true)
        .set('assessmentsList', action.payload);
    default:
      return state;
  }
};

/** Filters */

const initialFilterState = fromJS({
  filters: {},
});

export const filtersReducer = (state = initialFilterState, action) => {
  switch (action.type) {
    case APPLY_FILTER:
      return state.set('filters', action.payload);
    default:
      return state;
  }
};

const initialRoutesState = fromJS({
  isLoading: false,
  hasError: false,
  hasSucceeded: false,
  routes: [],
  errorMessage: false,
});

/** Routes/Industries */

export const routesReducer = (state = initialRoutesState, action) => {
  switch (action.type) {
    case GET_ROUTES_STARTED:
      return state.set('isLoading', true);
    case GET_ROUTES_FAILED:
      return state
        .set('isLoading', false)
        .set('hasError', true)
        .set('errorMessage', action.payload);
    case GET_ROUTES_SUCCEEDED:
      return state
        .set('isLoading', false)
        .set('hasSucceeded', true)
        .set('routes', action.payload);
    default:
      return state;
  }
};

// @suit-start
/**
 * Get Tweets Reducer
 * - Makes a Get Tweets API call
 */

export const initialGetTweetsState = fromJS({
  isLoading: false,
  hasSucceeded: false,
  hasError: false,
  errorMessage: '',
  data: null,
});

export const getTweetsReducer = (state = initialGetTweetsState, { type, payload }) => {
  switch (type) {
    // Begins the Get Tweets API Call. No payload.
    case GET_TWEETS_STARTED:
      return state
        .set('isLoading', true)
        .set('hasSucceeded', false)
        .set('hasError', false)
        .set('errorMessage', '')
        .set('data', null);
    // Called when the Get Tweets API call completes, passing the data as a payload.
    case GET_TWEETS_SUCCEEDED:
      return state
        .set('isLoading', false)
        .set('data', payload)
        .set('hasSucceeded', true);
    // Called when the Get Tweets API Call fails, delivering a standard error message.
    case GET_TWEETS_FAILED:
      return state
        .set('isLoading', false)
        .set('errorMessage', 'Get Tweets has failed')
        .set('hasError', true);
    default:
      return state;
  }
};

/**
 * Get Todos Reducer
 * - Makes a Get Todos API call
 */

export const initialGetTodosState = fromJS({
  isLoading: false,
  hasSucceeded: false,
  hasError: false,
  errorMessage: '',
  data: null,
});

export const getTodosReducer = (state = initialGetTodosState, { type, payload }) => {
  switch (type) {
    // Begins the Get Todos API Call. No payload.
    case GET_TODOS_STARTED:
      return state
        .set('isLoading', true)
        .set('hasSucceeded', false)
        .set('hasError', false)
        .set('errorMessage', '')
        .set('data', null);
    // Called when the Get Todos API call completes, passing the data as a payload.
    case GET_TODOS_SUCCEEDED:
      return state
        .set('isLoading', false)
        .set('data', payload)
        .set('hasSucceeded', true);
    // Called when the Get Todos API Call fails, delivering a standard error message.
    case GET_TODOS_FAILED:
      return state
        .set('isLoading', false)
        .set('errorMessage', 'Get Todos has failed')
        .set('hasError', true);
    default:
      return state;
  }
};
// @suit-end

export default combineReducers({
  getTodos: getTodosReducer, // @suit-line
  getTweets: getTweetsReducer, // @suit-line
  filters: filtersReducer,
  assessments: assessmentsReducer,
  routes: routesReducer,
});
