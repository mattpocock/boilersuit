import {
  getTweetsReducer, // @suit-line
  getTodosReducer, // @suit-line
} from '../reducer';
import {
  getTweetsStarted, // @suit-line
  getTweetsSucceeded, // @suit-line
  getTweetsFailed, // @suit-line
  getTodosStarted, // @suit-line
  getTodosSucceeded, // @suit-line
  getTodosFailed, // @suit-line
} from '../actions';
import {
  fromJS, // @suit-line
} from 'immutable';

// @suit-start
describe('getTweetsReducer', () => {
  it('returns the initial state', () => {
    expect(getTweetsReducer(undefined, { type: '' }))
      .toEqual(fromJS({
        isLoading: false,
        hasSucceeded: false,
        hasError: false,
        errorMessage: '',
        data: null,
      }),
    );
  });
  describe('getTweetsStarted', () => {
    it('alters the state as expected', () => {
      const newState = getTweetsReducer(
        undefined,
        getTweetsStarted(),
      );
      expect(newState.get('isLoading')).toEqual(true);
      expect(newState.get('hasSucceeded')).toEqual(false);
      expect(newState.get('hasError')).toEqual(false);
      expect(newState.get('errorMessage')).toEqual('');
      expect(newState.get('data')).toEqual(null);
    });
  });
  describe('getTweetsSucceeded', () => {
    it('alters the state as expected', () => {
      const payload = 'dummyPayload';
      const newState = getTweetsReducer(
        undefined,
        getTweetsSucceeded(payload),
      );
      expect(newState.get('isLoading')).toEqual(false);
      expect(newState.get('data')).toEqual(payload);
      expect(newState.get('hasSucceeded')).toEqual(true);
    });
  });
  describe('getTweetsFailed', () => {
    it('alters the state as expected', () => {
      const newState = getTweetsReducer(
        undefined,
        getTweetsFailed(),
      );
      expect(newState.get('isLoading')).toEqual(false);
      expect(newState.get('errorMessage')).toEqual('Get Tweets has failed');
      expect(newState.get('hasError')).toEqual(true);
    });
  });
});

describe('getTodosReducer', () => {
  it('returns the initial state', () => {
    expect(getTodosReducer(undefined, { type: '' }))
      .toEqual(fromJS({
        isLoading: false,
        hasSucceeded: false,
        hasError: false,
        errorMessage: '',
        data: null,
      }),
    );
  });
  describe('getTodosStarted', () => {
    it('alters the state as expected', () => {
      const newState = getTodosReducer(
        undefined,
        getTodosStarted(),
      );
      expect(newState.get('isLoading')).toEqual(true);
      expect(newState.get('hasSucceeded')).toEqual(false);
      expect(newState.get('hasError')).toEqual(false);
      expect(newState.get('errorMessage')).toEqual('');
      expect(newState.get('data')).toEqual(null);
    });
  });
  describe('getTodosSucceeded', () => {
    it('alters the state as expected', () => {
      const payload = 'dummyPayload';
      const newState = getTodosReducer(
        undefined,
        getTodosSucceeded(payload),
      );
      expect(newState.get('isLoading')).toEqual(false);
      expect(newState.get('data')).toEqual(payload);
      expect(newState.get('hasSucceeded')).toEqual(true);
    });
  });
  describe('getTodosFailed', () => {
    it('alters the state as expected', () => {
      const newState = getTodosReducer(
        undefined,
        getTodosFailed(),
      );
      expect(newState.get('isLoading')).toEqual(false);
      expect(newState.get('errorMessage')).toEqual('Get Todos has failed');
      expect(newState.get('hasError')).toEqual(true);
    });
  });
});
// @suit-end
