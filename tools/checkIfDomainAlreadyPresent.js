const fs = require('fs');
const path = require('path');
const Cases = require('./cases');
const { cleanFile, parseCamelCaseToArray } = require('./utils');

module.exports = (folder, cases, actions) => {
  const arrayOfActionCases = Object.keys(actions).map(key =>
    new Cases(parseCamelCaseToArray(key)).all(),
  );
  const errors = [];

  const constantFile = cleanFile(
    fs.readFileSync(path.resolve(`${folder}/constants.js`)).toString(),
  );

  const hasDuplicateConstants = arrayOfActionCases.filter(
    ({ constant }) => constantFile.indexOf(constant) !== -1,
  );

  const actionsFile = cleanFile(
    fs.readFileSync(path.resolve(`${folder}/actions.js`)).toString(),
  );

  const hasDuplicateActions = arrayOfActionCases.filter(
    ({ camel }) => actionsFile.indexOf(camel) !== -1,
  );

  if (hasDuplicateConstants.length) {
    errors.push(
      `Duplicate constant: ${
        hasDuplicateConstants[0].constant
      } already present in constants.`,
    );
  }
  if (hasDuplicateActions.length) {
    errors.push(
      `Duplicate action: ${
        hasDuplicateActions[0].camel
      } already present in actions.`,
    );
  }
  return errors;
};
