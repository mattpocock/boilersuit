
import { fromJS } from 'immutable';
import adminManageAssessmentsReducer from '../reducer';

describe('adminManageAssessmentsReducer', () => {
  it('returns the initial state', () => {
    expect(adminManageAssessmentsReducer(undefined, {})).toEqual(fromJS({}));
  });
});
