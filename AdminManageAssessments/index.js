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
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';
import { getAssessmentsStarted, applyFilter, getRoutesStarted } from './actions';

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
        <ManageAssessmentsSearchForm
          onSubmit={this.props.applyFilter}
        />
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
    getAssessments: () => dispatch(getAssessmentsStarted()),
    applyFilter: (code) => dispatch(applyFilter(code)),
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
