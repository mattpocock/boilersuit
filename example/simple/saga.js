import { takeLatest, call, put } from 'redux-saga/effects';
import {
  GET_ASSESSMENTS_STARTED,
  GET_TWEETS_STARTED, // @suit-line
  GET_TODOS_STARTED, // @suit-line
} from './constants';

import { getAssessmentsFailed, getAssessmentsSucceeded } from './actions';

const getMockedUpData = () => ({
  error: false,
  body: {
    assessments: ['Hi'],
  },
});

const errorText = 'Get assessments failed';

export function* getAssessments() {
  let data = '';
  try {
    data = yield call(getMockedUpData);
  } catch (err) {
    console.log(err); // eslint-disable-line
    yield put(getAssessmentsFailed(errorText));
  }
  if (!data) {
    yield put(getAssessmentsFailed(errorText));
  } else if (!data.error) {
    yield put(getAssessmentsSucceeded(data.body.assessments));
  } else {
    yield put(getAssessmentsFailed(errorText));
  }
}

// Individual exports for testing

/**
 * Get Tweets Saga
 * This saga was added by boilersuit, but is not managed by boilersuit.
 * That means you need to edit it yourself, and delete it yourself if your
 * actions, constants or reducer name changes.
 */
export function* getTweets() {
  let data = '';
  try {
    data = yield call(getTweetsAjaxCall);
  } catch (err) {
    console.log(err); // eslint-disable-line
    yield put(actionToFireWhenGetTweetsFails());
  }
  if (!data) {
    yield put(actionToFireWhenGetTweetsFails());
  } else if (!data.error) {
    yield put(actionToFireWhenGetTweetsSucceeds(data.body));
  } else {
    yield put(actionToFireWhenGetTweetsFails());
  }
}

/**
 * Get Todos Saga
 * This saga was added by boilersuit, but is not managed by boilersuit.
 * That means you need to edit it yourself, and delete it yourself if your
 * actions, constants or reducer name changes.
 */
export function* getTodos() {
  let data = '';
  try {
    data = yield call(getTodosAjaxCall);
  } catch (err) {
    console.log(err); // eslint-disable-line
    yield put(actionToFireWhenGetTodosFails());
  }
  if (!data) {
    yield put(actionToFireWhenGetTodosFails());
  } else if (!data.error) {
    yield put(actionToFireWhenGetTodosSucceeds(data.body));
  } else {
    yield put(actionToFireWhenGetTodosFails());
  }
}

export default function* allSagas() {
  // @suit-start
  yield takeLatest(GET_TODOS_STARTED, getTodos);
  yield takeLatest(GET_TWEETS_STARTED, getTweets);
  // @suit-end
  yield takeLatest(GET_ASSESSMENTS_STARTED, getAssessments);
}
