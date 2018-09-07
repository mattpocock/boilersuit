const fs = require('fs');
const Cases = require('./cases');
const { cleanFile, parseCamelCaseToArray } = require('./utils');

module.exports = (folder, cases, actions) => {
  const arrayOfActionCases = Object.keys(actions).map(key =>
    new Cases(parseCamelCaseToArray(key)).all(),
  );
  const errors = [];
  const hasDuplicateReducer =
    cleanFile(fs.readFileSync(`${folder}/reducer.js`)).indexOf(
      `${cases.camel}Reducer = `,
    ) !== -1;

  const constantFile = cleanFile(fs.readFileSync(`${folder}/constants.js`));

  const hasDuplicateConstants = arrayOfActionCases.filter(
    ({ constant }) => constantFile.indexOf(constant) !== -1,
  );

  const actionsFile = cleanFile(fs.readFileSync(`${folder}/actions.js`));

  const hasDuplicateActions = arrayOfActionCases.filter(
    ({ camel }) => actionsFile.indexOf(camel) !== -1,
  );

  if (hasDuplicateReducer) {
    errors.push(`Duplicate domain: ${cases.display} already present in reducer.`);
  }
  if (hasDuplicateConstants.length) {
    errors.push(`Duplicate constant: ${hasDuplicateConstants[0].constant} already present in constants.`);
  }
  if (hasDuplicateActions.length) {
    errors.push(`Duplicate action: ${hasDuplicateActions[0].camel} already present in actions.`);
  }
  return errors;
};
