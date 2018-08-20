const fs = require('fs');
const Cases = require('../tools/cases');
const Parser = require('../tools/parser');
const { concat } = require('../tools/utils');

const ajax = (identifier, folderName) => {
  const cases = new Cases(identifier);
  const { camel, display, pascal, constant } = cases.all();

  fs.readFile(`${folderName}/index.js`, (err, buf) => {
    const buffer = buf.toString();
    const parser = new Parser(buffer);

    const mapStateToPropsBeginning = buffer.indexOf('mapStateToProps');
    const mapStateToPropsEnd = buffer.indexOf('});', mapStateToPropsBeginning);

    const stringToInsert = concat([
      `  /** ${display} */`,
      `  is${pascal}Loading: makeSelectIs${pascal}Loading(),`,
      `  has${pascal}Failed: makeSelect${pascal}HasFailed(),`,
      `  has${pascal}Succeeded: makeSelect${pascal}HasSucceeded(),`,
      `  ${camel}Data: makeSelect${pascal}Data(),`,
      `  ${camel}ErrorMessage: makeSelect${pascal}ErrorMessage(),`,
      ``,
    ]);

    /** Selectors */
    const { index: selectorsIndex, ...selectors } = parser.getImportIndex(
      './selectors',
    );
    const selectorsToInsert = concat([
      `${selectors.prefix || ''}makeSelectIs${pascal}Loading,`,
      `  makeSelect${pascal}HasFailed,`,
      `  makeSelect${pascal}HasSucceeded,`,
      `  makeSelect${pascal}Data,`,
      `  makeSelect${pascal}ErrorMessage${selectors.suffix || ''}`,
    ]);

    /** Dispatch to props */
    const mapDispatchToPropsBeginning = buffer.indexOf('mapDispatchToProps');
    const mapDispatchToPropsEnd =
      buffer.indexOf('return {', mapDispatchToPropsBeginning) + 8;

    const dispatchToInsert = `
    submit${pascal}: () => dispatch(${camel}Started()),`;

    /** Actions */
    const { index: actionIndex, ...actions } = parser.getImportIndex(
      './actions',
    );
    const actionToInsert = `${actions.prefix ||
      ''}${camel}Started${actions.suffix || ''}`;

    fs.writeFile(
      `${folderName}/index.js`,
      buffer.slice(0, selectorsIndex) +
        selectorsToInsert +
        buffer.slice(selectorsIndex, actionIndex) +
        actionToInsert +
        buffer.slice(actionIndex, mapStateToPropsEnd) +
        stringToInsert +
        buffer.slice(mapStateToPropsEnd, mapDispatchToPropsEnd) +
        dispatchToInsert +
        buffer.slice(mapDispatchToPropsEnd),
      err => {
        console.log('Index written!');
      },
    );
  });

  fs.readFile(`${folderName}/selectors.js`, (err, buf) => {
    const buffer = buf.toString();

    const stringToInsert = `
/**
 * ${display}
 */

export const makeSelect${pascal} = () =>
  createSelector(selectDomain, (substate) => fromJS(substate.${camel}));

export const makeSelectIs${pascal}Loading = () =>
  createSelector(makeSelect${pascal}(), (substate) => substate.get('isLoading'));

export const makeSelect${pascal}HasFailed = () =>
  createSelector(makeSelect${pascal}(), (substate) => substate.get('hasError'));

export const makeSelect${pascal}HasSucceeded = () =>
  createSelector(makeSelect${pascal}(), (substate) => substate.get('hasSucceeded'));

export const makeSelect${pascal}Data = () =>
  createSelector(makeSelect${pascal}(), (substate) => substate.get('${camel}Data'));

export const makeSelect${pascal}ErrorMessage = () =>
  createSelector(makeSelect${pascal}(), (substate) => substate.get('errorMessage'));
`;

    fs.writeFile(`${folderName}/selectors.js`, buffer + stringToInsert, err => {
      console.log('Selectors written!');
    });
  });

  fs.readFile(`${folderName}/actions.js`, (err, buf) => {
    const buffer = buf.toString();

    const stringToInsert = `
/** ${display} */

export const ${camel}Started = () => ({
  type: ${constant}_STARTED,
});

export const ${camel}Failed = (errorMessage) => ({
  type: ${constant}_FAILED,
  payload: errorMessage,
});

export const ${camel}Succeeded = (${camel}Data) => ({
  type: ${constant}_SUCCEEDED,
  payload: ${camel}Data,
});
`;
    const importsIndex = buffer.indexOf(`} from './constants';`);
    const importsToInsert = `  ${constant}_STARTED,
  ${constant}_SUCCEEDED,
  ${constant}_FAILED,
`;

    fs.writeFile(
      `${folderName}/actions.js`,
      buffer.slice(0, importsIndex) +
        importsToInsert +
        buffer.slice(importsIndex) +
        stringToInsert,
      err => {
        console.log('Actions written!');
      },
    );
  });

  fs.readFile(`${folderName}/constants.js`, (err, buf) => {
    const buffer = buf.toString();
    const stringToInsert = `
/** ${display} */

export const ${constant}_STARTED =
  'app/${folderName}/${constant}_STARTED';
export const ${constant}_SUCCEEDED =
  'app/${folderName}/${constant}_SUCCEEDED';
export const ${constant}_FAILED =
  'app/${folderName}/${constant}_FAILED';
`;
    fs.writeFile(`${folderName}/constants.js`, buffer + stringToInsert, err => {
      console.log('Constants Written!');
    });
  });

  fs.readFile(`${folderName}/reducer.js`, (err, buf) => {
    const buffer = buf.toString();

    const stringToInsert = `const initial${pascal}State = fromJS({
  isLoading: false,
  hasError: false,
  hasSucceeded: false,
  ${camel}Data: [],
  errorMessage: '',
});

/** ${display} Reducer */

export const ${camel}Reducer = (state = initial${pascal}State, action) => {
  switch (action.type) {
    case ${constant}_STARTED:
      return state.set('isLoading', true);
    case ${constant}_FAILED:
      return state
        .set('isLoading', false)
        .set('hasError', true)
        .set('errorMessage', action.payload);
    case ${constant}_SUCCEEDED:
      return state
        .set('isLoading', false)
        .set('hasSucceeded', true)
        .set('${camel}Data', action.payload);
    default:
      return state;
  }
};

`;

    const lastExportIndex = buffer.indexOf('export default ');

    /** Insert imports */
    const importsIndex = buffer.indexOf(`} from './constants';`);
    const importsToInsert = `  ${constant}_STARTED,
  ${constant}_SUCCEEDED,
  ${constant}_FAILED,
`;

    const endOfReducers = buffer.lastIndexOf('});');

    const reducerToInsert = `  ${camel}: ${camel}Reducer,
`;

    fs.writeFile(
      `${folderName}/reducer.js`,
      buffer.slice(0, importsIndex) +
        importsToInsert +
        buffer.slice(importsIndex, lastExportIndex) +
        stringToInsert +
        buffer.slice(lastExportIndex, endOfReducers) +
        reducerToInsert +
        buffer.slice(endOfReducers),
      err => {
        console.log('Reducer written!');
      },
    );
  });
};

module.exports = ajax;
