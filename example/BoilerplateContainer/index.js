/**
 *
 * BoilerplateContainer
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectBoilerplateContainer from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

function BoilerplateContainer() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

BoilerplateContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  boilerplatecontainer: makeSelectBoilerplateContainer(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'boilerplatecontainer', reducer });
const withSaga = injectSaga({ key: 'boilerplatecontainer', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(BoilerplateContainer);
