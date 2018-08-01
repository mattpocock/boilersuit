import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

/**
 * Direct selector to the adminManageAssessments state domain
 */
export const selectDomain = (state) => state.get('adminManageAssessments');

/**
 * Filters
 */
export const makeSelectFilters = () =>
  createSelector(selectDomain, (substate) => fromJS(substate.filters.filters));

/**
 * Assessments
 */
export const makeSelectAssessments = () =>
  createSelector(selectDomain, (substate) => fromJS(substate.assessments));

export const makeSelectIsAssessmentsLoading = () =>
  createSelector(makeSelectAssessments(), (assessments) =>
    assessments.get('isGetAssessmentsLoading'),
  );

export const makeSelectHasGetAssessmentsFailed = () =>
  createSelector(makeSelectAssessments(), (assessments) =>
    assessments.get('hasGetAssessmentsFailed'),
  );

export const makeSelectHasGetAssessmentsSucceeded = () =>
  createSelector(makeSelectAssessments(), (assessments) =>
    assessments.get('hasGetAssessmentsSucceeded'),
  );

export const makeSelectAssessmentsList = () =>
  createSelector(makeSelectAssessments(), (assessments) =>
    assessments.get('assessmentsList'),
  );

export const makeSelectGetAssessmentsErrorMessage = () =>
  createSelector(makeSelectAssessments(), (assessments) =>
    assessments.get('getAssessmentsErrorMessage'),
  );

/**
 * Routes
 */

export const makeSelectRoutes = () =>
  createSelector(selectDomain, (substate) => fromJS(substate.routes));

export const makeSelectRoutesIsLoading = () =>
  createSelector(makeSelectRoutes(), (substate) => substate.get('isLoading'));

export const makeSelectRoutesHasError = () =>
  createSelector(makeSelectRoutes(), (substate) => substate.get('hasError'));

export const makeSelectRoutesHasSucceeded = () =>
  createSelector(makeSelectRoutes(), (substate) =>
    substate.get('hasSucceeded'),
  );

export const makeSelectRoutesList = () =>
  createSelector(makeSelectRoutes(), (substate) => substate.get('routes'));

export const makeSelectRoutesErrorMessage = () =>
  createSelector(makeSelectRoutes(), (substate) =>
    substate.get('errorMessage'),
  );
