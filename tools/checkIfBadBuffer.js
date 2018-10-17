const { concat } = require('./utils');

module.exports = ({ reducer, index }) => {
  const errors = [];
  const noCombineReducers = reducer.indexOf('combineReducers({') === -1;
  if (noCombineReducers) {
    errors.push(
      concat([
        `No 'combineReducers({' in './reducer.js'`,
        `- Consider a refactor to combine the reducers, such as:`,
        ``,
        `import { combineReducers } from 'redux';`,
        ``,
        `const getTweetsReducer = (state, action) => { ... }`,
        ``,
        `export default combineReducers({`,
        `  getTweets: getTweetsReducer,`,
        `});`,
      ]),
    );
  }

  const noCreateStructuredSelector =
    index.indexOf('createStructuredSelector({') === -1;
  if (noCreateStructuredSelector) {
    errors.push(
      concat([
        `No 'createStructuredSelector({' in './index.js'`,
        `- Consider a refactor in mapStateToProps to use createStructuredSelector.`,
        `import { createStructuredSelector } from 'reselect';`,
        `import { makeSelectGetTweetsIsLoading } from './selectors';`,
        ``,
        `const mapStateToProps = createStructuredSelector({`,
        `  getTweetsIsLoading: makeSelectGetTweetsIsLoading(),`,
        `});`,
      ]),
    );
  }

  const noMapDispatchToProps =
    index.indexOf(`mapDispatchToProps(dispatch) {`) === -1;
  if (noMapDispatchToProps) {
    errors.push(
      concat([
        `No 'createStructuredSelector({' in './index.js'`,
        `- Consider a refactor to use mapDispatchToProps.`,
        ``,
        `function mapDispatchToProps(dispatch) {`,
        `  return {`,
        `    submitGetTweets: (payload) => dispatch(getTweetsStarted(payload)),`,
        `  };`,
        `}`,
      ]),
    );
  }

  return errors;
};
