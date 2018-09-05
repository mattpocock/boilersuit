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

export default combineReducers({
  filters: filtersReducer,
  assessments: assessmentsReducer,
  routes: routesReducer,
});
