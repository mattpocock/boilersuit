import Api from 'utils/apiClient';
import appConfig from 'appConfig';
import {
  takeLatest, // @suit-line
  call, // @suit-line
  put, // @suit-line
} from 'redux-saga/effects';
import {
  DELETE_ASSESSMENT_ELEMENT_STARTED, // @suit-line
  GET_ASSESSMENT_ELEMENTS_STARTED, // @suit-line
  SOMETHING_STARTED, // @suit-line
} from './constants';
import {
  getAssessmentElementsFailed,
  getAssessmentElementsSucceeded,
  deleteAssessmentElementFailed,
  deleteAssessmentElementSucceeded,
  somethingGreat, // @suit-line
  somethingSucceeded, // @suit-line
} from './actions';

const api = new Api(appConfig.serverUrl);

/*
 *
 * AssessmentElementsTableContainer saga
 *
 */

// @suit-name-only-start
export function* something() {
  let data = '';
  try {
    data = yield call(somethingAjaxCall);
  } catch (err) {
    console.log(err); // eslint-disable-line
    yield put(somethingFailed());
  }
  if (!data) {
    yield put(somethingFailed());
  } else if (!data.error) {
    yield put(somethingSucceeded(data.body));
  } else {
    yield put(somethingFailed());
  }
}
// @suit-name-only-end

export default function* defaultSaga() {
  // @suit-start
  yield takeLatest(SOMETHING_STARTED, something);
  yield takeLatest(GET_ASSESSMENT_ELEMENTS_STARTED, getAssessmentElements);
  yield takeLatest(DELETE_ASSESSMENT_ELEMENT_STARTED, deleteAssessmentElement);
  // @suit-end
  // All sagas go in here
}
