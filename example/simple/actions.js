/*
 *
 * AdminManageAssessments actions
 *
 */

import {
  GET_ASSESSMENTS_STARTED,
  GET_ASSESSMENTS_FAILED,
  GET_ASSESSMENTS_SUCCEEDED,
  APPLY_FILTER,
  GET_ROUTES_STARTED,
  GET_ROUTES_SUCCEEDED,
  GET_ROUTES_FAILED,
  GET_TWEETS_FAILED, // @suit-line
  GET_TWEETS_SUCCEEDED, // @suit-line
  GET_TWEETS_STARTED, // @suit-line
  GET_TODOS_FAILED, // @suit-line
  GET_TODOS_SUCCEEDED, // @suit-line
  GET_TODOS_STARTED, // @suit-line
} from './constants';

/** Get Assessments */

export const getAssessmentsStarted = () => ({
  type: GET_ASSESSMENTS_STARTED,
});

export const getAssessmentsFailed = errorMessage => ({
  type: GET_ASSESSMENTS_FAILED,
  payload: errorMessage,
});

export const getAssessmentsSucceeded = assessments => ({
  type: GET_ASSESSMENTS_SUCCEEDED,
  payload: assessments,
});

/** Filters */

export const applyFilter = filters => ({
  type: APPLY_FILTER,
  payload: filters,
});

/** Get Routes */

export const getRoutesStarted = () => ({
  type: GET_ROUTES_STARTED,
});

export const getRoutesFailed = errorMessage => ({
  type: GET_ROUTES_FAILED,
  payload: errorMessage,
});

export const getRoutesSucceeded = assessments => ({
  type: GET_ROUTES_SUCCEEDED,
  payload: assessments,
});

// @suit-start

/** Get Tweets actions */

// Begins the Get Tweets API Call. No payload.
export const getTweetsStarted = () => ({
  type: GET_TWEETS_STARTED,
});

// Called when the Get Tweets API call completes, passing the data as a payload.
export const getTweetsSucceeded = (payload) => ({
  type: GET_TWEETS_SUCCEEDED,
  payload,
});

// Called when the Get Tweets API Call fails, delivering a standard error message.
export const getTweetsFailed = () => ({
  type: GET_TWEETS_FAILED,
});

/** Get Todos actions */

// Begins the Get Todos API Call. No payload.
export const getTodosStarted = () => ({
  type: GET_TODOS_STARTED,
});

// Called when the Get Todos API call completes, passing the data as a payload.
export const getTodosSucceeded = (payload) => ({
  type: GET_TODOS_SUCCEEDED,
  payload,
});

// Called when the Get Todos API Call fails, delivering a standard error message.
export const getTodosFailed = () => ({
  type: GET_TODOS_FAILED,
});

// @suit-end
