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
} from './constants';

/** Get Assessments */

export const getAssessmentsStarted = () => ({
  type: GET_ASSESSMENTS_STARTED,
});

export const getAssessmentsFailed = (errorMessage) => ({
  type: GET_ASSESSMENTS_FAILED,
  payload: errorMessage,
});

export const getAssessmentsSucceeded = (assessments) => ({
  type: GET_ASSESSMENTS_SUCCEEDED,
  payload: assessments,
});

/** Filters */

export const applyFilter = (filters) => ({
  type: APPLY_FILTER,
  payload: filters,
});

/** Get Routes */

export const getRoutesStarted = () => ({
  type: GET_ROUTES_STARTED,
});

export const getRoutesFailed = (errorMessage) => ({
  type: GET_ROUTES_FAILED,
  payload: errorMessage,
});

export const getRoutesSucceeded = (assessments) => ({
  type: GET_ROUTES_SUCCEEDED,
  payload: assessments,
});
