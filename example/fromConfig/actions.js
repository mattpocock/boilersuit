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
  GET_ACTIONS_STARTED, // @suit-line
  GET_FIELDS_FAILED, // @suit-line
  GET_FIELDS_STARTED, // @suit-line
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

/** Get Actions actions */

export const getActionsStarted = () => ({
  type: GET_ACTIONS_STARTED,
});

/** Get Fields actions */

export const getFieldsStarted = () => ({
  type: GET_FIELDS_STARTED,
});

export const getFieldsFailed = (payload) => ({
  type: GET_FIELDS_FAILED,
  payload,
});

// @suit-end
