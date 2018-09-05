import { createSelector } from 'reselect';

/**
 * Direct selector to the adminManageAssessments state domain
 */
export const selectAdminManageAssessmentsDomain = state => state.get('adminManageAssessments');