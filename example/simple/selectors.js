import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

/**
 * Direct selector to the adminManageAssessments state domain
 */
export const selectAdminManageAssessmentsDomain = state => state.get('adminManageAssessments');