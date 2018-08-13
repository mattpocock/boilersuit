const fs = require('fs');

const writeToFile = (identifier, folderName) => {

  const capitalize = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);
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

  fs.readFile(`${folderName}/index.js`, (err, buf) => {
    const buffer = buf.toString();

    const mapStateToPropsBeginning = buffer.indexOf('mapStateToProps');
    const mapStateToPropsEnd = buffer.indexOf('});', mapStateToPropsBeginning);

    const stringToInsert = `  /** ${display} */
  is${normal}Loading: makeSelectIs${normal}Loading(),
  has${normal}Failed: makeSelect${normal}HasFailed(),
  has${normal}Succeeded: makeSelect${normal}HasSucceeded(),
  ${pascal}Data: makeSelect${normal}Data(),
  ${pascal}ErrorMessage: makeSelect${normal}ErrorMessage(),
`;
    const importsIndex = buffer.indexOf(`} from './selectors';`);
    const importsToInsert = `  makeSelectIs${normal}Loading,
  makeSelect${normal}HasFailed,
  makeSelect${normal}HasSucceeded,
  makeSelect${normal}Data,
  makeSelect${normal}ErrorMessage,
`;

    const mapDispatchToPropsBeginning = buffer.indexOf('mapDispatchToProps');
    const mapDispatchToPropsEnd =
      buffer.indexOf('return {', mapDispatchToPropsBeginning) + 8;

    const dispatchToInsert = `
    submit${normal}: () => dispatch(${pascal}Started()),`;

    let actionIndex = buffer.indexOf(`} from './actions';`);
    let actionToInsert = `  ${pascal}Started,
    `;

    /** If actions not imported */
    if (actionIndex === -1) {
      ActionIndex = buffer.lastIndexOf(`import`);
      actionToInsert = `import { ${pascal}Started } from './actions';\n`;
    }

    fs.writeFile(
      `${folderName}/index.js`,
      buffer.slice(0, importsIndex) +
        importsToInsert +
        buffer.slice(importsIndex, actionIndex) +
        actionToInsert +
        buffer.slice(actionIndex, mapStateToPropsEnd) +
        stringToInsert +
        buffer.slice(mapStateToPropsEnd, mapDispatchToPropsEnd) +
        dispatchToInsert +
        buffer.slice(mapDispatchToPropsEnd),
      (err) => {
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

export const makeSelect${normal} = () =>
  createSelector(selectDomain, (substate) => fromJS(substate.${pascal}));

export const makeSelectIs${normal}Loading = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('isLoading'));

export const makeSelect${normal}HasFailed = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('hasError'));

export const makeSelect${normal}HasSucceeded = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('hasSucceeded'));

export const makeSelect${normal}Data = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('${pascal}Data'));

export const makeSelect${normal}ErrorMessage = () =>
  createSelector(makeSelect${normal}(), (substate) => substate.get('errorMessage'));
`;

    fs.writeFile(
      `${folderName}/selectors.js`,
      buffer + stringToInsert,
      (err) => {
        console.log('Selectors written!');
      },
    );
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

    fs.writeFile(
      `${folderName}/actions.js`,
      buffer.slice(0, importsIndex) +
        importsToInsert +
        buffer.slice(importsIndex) +
        stringToInsert,
      (err) => {
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
    fs.writeFile(
      `${folderName}/constants.js`,
      buffer + stringToInsert,
      (err) => {
        console.log('Constants Written!');
      },
    );
  });

  fs.readFile(`${folderName}/reducer.js`, (err, buf) => {
    const buffer = buf.toString();

    const stringToInsert = `const initial${normal}State = fromJS({
  isLoading: false,
  hasError: false,
  hasSucceeded: false,
  ${pascal}Data: [],
  errorMessage: '',
});

/** ${display} Reducer */

export const ${pascal}Reducer = (state = initial${normal}State, action) => {
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

    fs.writeFile(
      `${folderName}/reducer.js`,
      buffer.slice(0, importsIndex) +
        importsToInsert +
        buffer.slice(importsIndex, lastExportIndex) +
        stringToInsert +
        buffer.slice(lastExportIndex, endOfReducers) +
        reducerToInsert +
        buffer.slice(endOfReducers),
      (err) => {
        console.log('Reducer written!');
      },
    );
  });
};

module.exports = writeToFile;