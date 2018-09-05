import { takeLatest, call, put } from 'redux-saga/effects';
import { GET_ASSESSMENTS_STARTED } from './constants';

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
export default function* allSagas() {
  yield takeLatest(GET_ASSESSMENTS_STARTED, getAssessments);
}
