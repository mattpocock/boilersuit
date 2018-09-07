const fs = require('fs');
const { concat } = require('./utils');

module.exports = (folder) => {
  const errors = [];
  const noCombineReducers =
    fs.readFileSync(`${folder}/reducer.js`).toString().indexOf('combineReducers({') === -1;
  if (noCombineReducers) {
    errors.push(
      concat([
        `No 'combineReducers({' in './reducer.js'`,
        `- Consider a refactor to combine the reducers, such as:`,
        `| `,
        `| import { combineReducers } from 'redux';`,
        `| `,
        `| const getTweetsReducer = (state, action) => { ... }`,
        `| `,
        `| export default combineReducers({`,
        `|   getTweets: getTweetsReducer,`,
        `| });`,
      ]),
    );
  }

  const noCreateStructuredSelector =
    fs
      .readFileSync(`${folder}/index.js`)
      .indexOf('createStructuredSelector({') === -1;
  if (noCreateStructuredSelector) {
    errors.push(
      concat([
        `No 'createStructuredSelector({' in './index.js'`,
        `- Consider a refactor in mapStateToProps to use createStructuredSelector.`,
        `| import { createStructuredSelector } from 'reselect';`,
        `| import { makeSelectGetTweetsIsLoading } from './selectors';`,
        `| `,
        `| const mapStateToProps = createStructuredSelector({`,
        `|   getTweetsIsLoading: makeSelectGetTweetsIsLoading(),`,
        `| });`,
      ]),
    );
  }
  return errors;
};
