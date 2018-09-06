import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

/**
 * Direct selector to the adminManageAssessments state domain
 */
export const selectAdminManageAssessmentsDomain = state => state.get('adminManageAssessments');

// @suit-start

/** Get Actions Selectors */

export const makeSelectGetActions = () =>
  createSelector(selectFromConfigDomain, (substate) => 
    fromJS(substate.getActions));

export const makeSelectGetActionsIsLoading = () =>
  createSelector(makeSelectGetActions, (substate) =>
    substate.get('isLoading')
  );

export const makeSelectGetActionsHasCompleted = () =>
  createSelector(makeSelectGetActions, (substate) =>
    substate.get('hasCompleted')
  );

export const makeSelectGetActionsData = () =>
  createSelector(makeSelectGetActions, (substate) =>
    substate.get('data')
  );

/** Get Fields Selectors */

export const makeSelectGetFields = () =>
  createSelector(selectFromConfigDomain, (substate) => 
    fromJS(substate.getFields));

export const makeSelectGetFieldsIsLoading = () =>
  createSelector(makeSelectGetFields, (substate) =>
    substate.get('isLoading')
  );

export const makeSelectGetFieldsHasCompleted = () =>
  createSelector(makeSelectGetFields, (substate) =>
    substate.get('hasCompleted')
  );

export const makeSelectGetFieldsData = () =>
  createSelector(makeSelectGetFields, (substate) =>
    substate.get('data')
  );

export const makeSelectGetFieldsErrorMessage = () =>
  createSelector(makeSelectGetFields, (substate) =>
    substate.get('errorMessage')
  );

// @suit-end
