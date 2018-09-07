import { fromJS } from 'immutable';
import boilerplateContainerReducer from '../reducer';

describe('boilerplateContainerReducer', () => {
  it('returns the initial state', () => {
    expect(boilerplateContainerReducer(undefined, {})).toEqual(fromJS({}));
  });
});
