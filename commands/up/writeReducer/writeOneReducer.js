const { transforms, prettify, ensureImport } = require('../../../tools/utils');

const writeInitialReducer = require('./writeInitialReducer');
const addToCombineReducers = require('./addToCombineReducers');
const addActionsToInitialReducer = require('./addActionsToInitialReducer');
const importConstants = require('./importConstants');
const addCustomFunctions = require('./addCustomFunctions');

module.exports = ({
  buffer,
  cases: { pascal, camel, display },
  initialState,
  actions,
  describe,
  keyChanges,
}) =>
  transforms(buffer, [
    /** Adds in boilerplate if domain does not exist */
    ensureImport('fromJS', 'immutable', { destructure: true }),
    ensureImport('combineReducers', 'redux', { destructure: true }),
    writeInitialReducer({
      actions,
      display,
      describe,
      pascal,
      camel,
      initialState,
    }),
    /** Adds to combineReducers */
    addToCombineReducers(camel),
    /** Adds actions */
    addActionsToInitialReducer({ camel, actions }),
    /** Imports constants */
    importConstants(actions),
    addCustomFunctions({ actions, keyChanges }),
    prettify,
  ]);
