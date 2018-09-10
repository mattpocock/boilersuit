import {
  GET_TWEETS_STARTED, // @suit-line
  GET_TWEETS_SUCCEEDED, // @suit-line
  GET_TWEETS_FAILED, // @suit-line
  GET_TODOS_STARTED, // @suit-line
  GET_TODOS_SUCCEEDED, // @suit-line
  GET_TODOS_FAILED, // @suit-line
} from '../constants';
import {
  getTweetsStarted, // @suit-line
  getTweetsSucceeded, // @suit-line
  getTweetsFailed, // @suit-line
  getTodosStarted, // @suit-line
  getTodosSucceeded, // @suit-line
  getTodosFailed, // @suit-line
} from '../actions';

// @suit-start
describe('getTweetsStarted', () => {
  it('should have the correct type', () => {
    expect(getTweetsStarted().type).toEqual(GET_TWEETS_STARTED);
  });
});

describe('getTweetsSucceeded', () => {
  it('should have the correct type', () => {
    expect(getTweetsSucceeded().type).toEqual(GET_TWEETS_SUCCEEDED);
  });
  it('should return the correct payload', () => {
    expect(getTweetsSucceeded('dummyPayload').payload).toEqual('dummyPayload');
  });
});

describe('getTweetsFailed', () => {
  it('should have the correct type', () => {
    expect(getTweetsFailed().type).toEqual(GET_TWEETS_FAILED);
  });
});

describe('getTodosStarted', () => {
  it('should have the correct type', () => {
    expect(getTodosStarted().type).toEqual(GET_TODOS_STARTED);
  });
});

describe('getTodosSucceeded', () => {
  it('should have the correct type', () => {
    expect(getTodosSucceeded().type).toEqual(GET_TODOS_SUCCEEDED);
  });
  it('should return the correct payload', () => {
    expect(getTodosSucceeded('dummyPayload').payload).toEqual('dummyPayload');
  });
});

describe('getTodosFailed', () => {
  it('should have the correct type', () => {
    expect(getTodosFailed().type).toEqual(GET_TODOS_FAILED);
  });
});
// @suit-end
