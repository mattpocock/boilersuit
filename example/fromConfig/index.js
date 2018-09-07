/**
 *
 * AdminManageAssessments
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import ManageAssessmentsSearchForm from 'components/Forms/ManageAssessmentsSearchForm';
import ManageAssessmentsTable from 'components/ManageAssessmentsTable';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import {
  makeSelectIsAssessmentsLoading,
  makeSelectHasGetAssessmentsFailed,
  makeSelectHasGetAssessmentsSucceeded,
  makeSelectGetAssessmentsErrorMessage,
  makeSelectAssessmentsList,
  makeSelectFilters,
  makeSelectRoutesIsLoading,
  makeSelectRoutesHasError,
  makeSelectRoutesHasSucceeded,
  makeSelectRoutesErrorMessage,
  makeSelectRoutesList,
  makeSelectGetActionsIsLoading, // @suit-line
  makeSelectGetActionsHasCompleted, // @suit-line
  makeSelectGetActionsData, // @suit-line
  makeSelectGetFieldsIsLoading, // @suit-line
  makeSelectGetFieldsHasCompleted, // @suit-line
  makeSelectGetFieldsData, // @suit-line
  makeSelectGetFieldsErrorMessage, // @suit-line
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';
import {
  getAssessmentsStarted,
  applyFilter,
  getRoutesStarted,
  getActionsStarted, // @suit-line
  getFieldsFailed, // @suit-line
} from './actions';

export class AdminManageAssessments extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    if (
      !this.props.assessmentsList.length &&
      !this.props.hasGetAssessmentsFailed
    ) {
      this.props.getAssessments();
    }
  }
  render() {
    const {
      filters,
      isAssessmentsLoading,
      hasGetAssessmentsFailed,
      hasGetAssessmentsSucceeded,
      assessmentsList,
      getAssessmentsErrorMessage,
    } = this.props;
    return (
      <div className={'container'}>
        <ManageAssessmentsSearchForm onSubmit={this.props.applyFilter} />
        <ManageAssessmentsTable
          filters={filters}
          assessments={{
            isLoading: isAssessmentsLoading,
            hasFailed: hasGetAssessmentsFailed,
            hasFinished: hasGetAssessmentsSucceeded,
            list: assessmentsList,
            errorMessage: getAssessmentsErrorMessage,
          }}
          message={messages}
        />
      </div>
    );
  }
}

const { bool, func, string, array, object, oneOfType } = PropTypes;

AdminManageAssessments.propTypes = {
  filters: object,
  isAssessmentsLoading: bool,
  hasGetAssessmentsSucceeded: bool,
  getAssessmentsErrorMessage: string,
  hasGetAssessmentsFailed: bool,
  assessmentsList: oneOfType([array, object]),
  getAssessments: func,
  applyFilter: func,
};

const mapStateToProps = createStructuredSelector({
  // @suit-start
  getFieldsIsLoading: makeSelectGetFieldsIsLoading(),
  getFieldsHasCompleted: makeSelectGetFieldsHasCompleted(),
  getFieldsData: makeSelectGetFieldsData(),
  getFieldsErrorMessage: makeSelectGetFieldsErrorMessage(),
  getActionsIsLoading: makeSelectGetActionsIsLoading(),
  getActionsHasCompleted: makeSelectGetActionsHasCompleted(),
  getActionsData: makeSelectGetActionsData(),
  // @suit-end
  /** Filters */
  filters: makeSelectFilters(),
  /** Assessments */
  isAssessmentsLoading: makeSelectIsAssessmentsLoading(),
  hasGetAssessmentsFailed: makeSelectHasGetAssessmentsFailed(),
  hasGetAssessmentsSucceeded: makeSelectHasGetAssessmentsSucceeded(),
  getAssessmentsErrorMessage: makeSelectGetAssessmentsErrorMessage(),
  assessmentsList: makeSelectAssessmentsList(),
  /** Routes */
  isRoutesLoading: makeSelectRoutesIsLoading(),
  routesHasError: makeSelectRoutesHasError(),
  routesHasSucceeded: makeSelectRoutesHasSucceeded(),
  routes: makeSelectRoutesList(),
  routesErrorMessage: makeSelectRoutesErrorMessage(),
});

function mapDispatchToProps(dispatch) {
  return {
    // @suit-start
    submitGetFieldsFailed: (payload) => dispatch(getFieldsFailed(payload)),
    submitGetActionsStarted: () => dispatch(getActionsStarted()),
    // @suit-end
    getAssessments: () => dispatch(getAssessmentsStarted()),
    applyFilter: code => dispatch(applyFilter(code)),
    getRoutes: () => dispatch(getRoutesStarted()),
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'adminManageAssessments', reducer });
const withSaga = injectSaga({ key: 'adminManageAssessments', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(AdminManageAssessments);
