import {
  makeSelectGetTweets, // @suit-line
  makeSelectGetTweetsIsLoading, // @suit-line
  makeSelectGetTweetsHasSucceeded, // @suit-line
  makeSelectGetTweetsHasError, // @suit-line
  makeSelectGetTweetsErrorMessage, // @suit-line
  makeSelectGetTweetsData, // @suit-line
  makeSelectGetTodos, // @suit-line
  makeSelectGetTodosIsLoading, // @suit-line
  makeSelectGetTodosHasSucceeded, // @suit-line
  makeSelectGetTodosHasError, // @suit-line
  makeSelectGetTodosErrorMessage, // @suit-line
  makeSelectGetTodosData, // @suit-line
} from '../selectors';
import {
  fromJS, // @suit-line
} from 'immutable';

// @suit-start
const mockedState = fromJS({
  simple: {
    getTodos: {
      isLoading: false,
      hasSucceeded: false,
      hasError: false,
      errorMessage: '',
      data: null,
    },
    getTweets: {
      isLoading: false,
      hasSucceeded: false,
      hasError: false,
      errorMessage: '',
      data: null,
    },
  },
});

describe('makeSelectGetTweets', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTweets();
    expect(selector(mockedState))
      .toEqual(fromJS(mockedState.get('simple').get('getTweets')));
  });
});

describe('makeSelectGetTweetsIsLoading', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTweetsIsLoading();
    expect(selector(mockedState))
      .toEqual(false);
  });
});

describe('makeSelectGetTweetsHasSucceeded', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTweetsHasSucceeded();
    expect(selector(mockedState))
      .toEqual(false);
  });
});

describe('makeSelectGetTweetsHasError', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTweetsHasError();
    expect(selector(mockedState))
      .toEqual(false);
  });
});

describe('makeSelectGetTweetsErrorMessage', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTweetsErrorMessage();
    expect(selector(mockedState))
      .toEqual('');
  });
});

describe('makeSelectGetTweetsData', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTweetsData();
    expect(selector(mockedState))
      .toEqual(null);
  });
});

describe('makeSelectGetTodos', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTodos();
    expect(selector(mockedState))
      .toEqual(fromJS(mockedState.get('simple').get('getTodos')));
  });
});

describe('makeSelectGetTodosIsLoading', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTodosIsLoading();
    expect(selector(mockedState))
      .toEqual(false);
  });
});

describe('makeSelectGetTodosHasSucceeded', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTodosHasSucceeded();
    expect(selector(mockedState))
      .toEqual(false);
  });
});

describe('makeSelectGetTodosHasError', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTodosHasError();
    expect(selector(mockedState))
      .toEqual(false);
  });
});

describe('makeSelectGetTodosErrorMessage', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTodosErrorMessage();
    expect(selector(mockedState))
      .toEqual('');
  });
});

describe('makeSelectGetTodosData', () => {
  it('should return the correct value', () => {
    const selector = makeSelectGetTodosData();
    expect(selector(mockedState))
      .toEqual(null);
  });
});
// @suit-end
