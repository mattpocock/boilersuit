#!/usr/bin/env node

const fs = require('fs');

const identifier = ['Get', 'Regions'];

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const pascalCase = (array) =>
  array
    .map((item, index) => {
      if (index === 0) {
        return item.toLowerCase();
      }
      return capitalize(item);
    })
    .join('');

const constantCase = (array) =>
  array.map((item) => item.toUpperCase()).join('_');

const normalCase = (array) => array.map((item) => capitalize(item)).join('');

const normal = normalCase(identifier);
const pascal = pascalCase(identifier);
const constant = constantCase(identifier);
const display = identifier.join(' ');

const folderName = 'AdminManageAssessments';

fs.readFile(`${folderName}/index.js`, (err, buf) => {
  const buffer = buf.toString();

  const mapStateToPropsBeginning = buffer.indexOf('mapStateToProps');
  const mapStateToPropsEnd = buffer.indexOf('});', mapStateToPropsBeginning);

  const stringToInsert = `  /** ${display} */
  is${normal}Loading: makeSelectIs${normal}Loading(),
  has${normal}Failed: makeSelectHas${normal}Failed(),
  has${normal}Succeeded: makeSelectHas${normal}Succeeded(),
  ${pascal}: makeSelect${normal}Data(),
  ${pascal}ErrorMessage: makeSelect${normal}ErrorMessage(),
`;
  const importsIndex = buffer.indexOf(`} from './selectors';`);
  const importsToInsert = `  makeSelectIs${normal}Loading,
  makeSelectHas${normal}Failed,
  makeSelectHas${normal}Succeeded,
  makeSelect${normal}Data,
  makeSelect${normal}ErrorMessage,
`;

  const mapDispatchToPropsBeginning = buffer.indexOf('mapDispatchToProps');
  const mapDispatchToPropsEnd = buffer.indexOf('return {', mapDispatchToPropsBeginning) + 8;

  const dispatchToInsert = `
    ${pascal}: () => dispatch(${pascal}Started()),`;

  const actionIndex = buffer.indexOf(` } from './actions';`);

  const actionToInsert = `, ${pascal}Started`;

  console.log(
    buffer.slice(0, importsIndex) +
      importsToInsert +
      buffer.slice(importsIndex, actionIndex) +
      actionToInsert +
      buffer.slice(actionIndex, mapStateToPropsEnd) + 
      stringToInsert +
      buffer.slice(mapStateToPropsEnd, mapDispatchToPropsEnd) +
      dispatchToInsert +
      buffer.slice(mapDispatchToPropsEnd),
  );
});

fs.readFile(`${folderName}/selectors.js`, (err, buf) => {
  const buffer = buf.toString();

  const stringToInsert = `

/**
 * ${display}
 */

export const makeSelect${normal} = () =>
  createSelector(selectDomain, (substate) => fromJS(substate.${pascal}));

export const makeSelect${normal}IsLoading = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('isLoading'));

export const makeSelect${normal}HasError = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('hasError'));

export const makeSelect${normal}HasSucceeded = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('hasSucceeded'));

export const makeSelect${normal}Data = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('${pascal}Data'));

export const makeSelect${normal}ErrorMessage = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('errorMessage'));
`;

  // console.log(buffer + stringToInsert);
});

fs.readFile(`${folderName}/actions.js`, (err, buf) => {
  const buffer = buf.toString();

  const stringToInsert = `
/** ${display} */

export const ${pascal}Started = () => ({
  type: ${constant}_STARTED,
});

export const ${pascal}Failed = (errorMessage) => ({
  type: ${constant}_FAILED,
  payload: errorMessage,
});

export const ${pascal}Succeeded = (${pascal}Data) => ({
  type: ${constant}_SUCCEEDED,
  payload: ${pascal}Data,
});
`;
  const importsIndex = buffer.indexOf(`} from './constants';`);
  const importsToInsert = `  ${constant}_STARTED,
  ${constant}_SUCCEEDED,
  ${constant}_FAILED,
`;
  // console.log(
  //   buffer.slice(0, importsIndex) +
  //     importsToInsert +
  //     buffer.slice(importsIndex) +
  //     stringToInsert,
  // );
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
  // console.log(buffer + stringToInsert);
});

fs.readFile(`${folderName}/reducer.js`, (err, buf) => {
  const buffer = buf.toString();

  const stringToInsert = `const ${pascal} = fromJS({
  isLoading: false,
  hasError: false,
  hasSucceeded: false,
  ${pascal}: {},
  errorMessage: false,
});

/** ${display} Reducer */

export const ${pascal}Reducer = (state = initial${normal}State, action) => {
  switch(action.type) {
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
        .set('${pascal}Data', action.payload);
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

  const reducerToInsert = `  ${pascal}: ${pascal}Reducer,
`;

  // console.log(
  //   buffer.slice(0, importsIndex) +
  //     importsToInsert +
  //     buffer.slice(importsIndex, lastExportIndex) +
  //     stringToInsert +
  //     buffer.slice(lastExportIndex, endOfReducers) +
  //     reducerToInsert +
  //     buffer.slice(endOfReducers),
  // );
});
