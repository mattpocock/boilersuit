const fs = require('fs');
const { concat, parseCamelCaseToArray } = require('../../tools/utils');
const Cases = require('../../tools/cases');

module.exports = (folder, camelCase) => {
  const array = parseCamelCaseToArray(camelCase);
  const cases = new Cases(array).all();

  let fixedFolder = folder;
  if (folder[folder.length - 1] !== '/') {
    fixedFolder += '/';
  }
  let buffer = concat(['{', '}']);
  let includeComma = false;
  if (fs.existsSync(`${fixedFolder}suit.json`)) {
    buffer = fs.readFileSync(`${fixedFolder}suit.json`).toString();
    includeComma = true;
  }
  console.log(` ${fixedFolder}suit.json `.bgGreen.black);
  console.log(
    'SUIT: '.green +
      (includeComma ? 'writing existing suit.json' : 'writing new suit.json'),
  );
  fs.writeFileSync(
    `${fixedFolder}suit.json`,
    buffer.slice(0, -2) +
      concat([
        includeComma ? ',' : undefined,
        `  "${cases.camel}": {`,
        `    "describe": "Makes a ${cases.display} API call",`,
        `    "initialState": {`,
        `      "isLoading": false,`,
        `      "hasSucceeded": false,`,
        `      "hasError": false,`,
        `      "errorMessage": "",`,
        `      "data": {}`,
        `    },`,
        `    "actions": {`,
        `      "${cases.camel}Started": {`,
        `        "describe": "Begins the ${
          cases.display
        } API Call. No payload.",`,
        `        "saga": true,`,
        `        "passAsProp": true,`,
        `        "set": {`,
        `          "isLoading": true,`,
        `          "hasSucceeded": false,`,
        `          "hasError": false,`,
        `          "errorMessage": "",`,
        `          "data": {}`,
        `        }`,
        `      },`,
        `      "${cases.camel}Succeeded": {`,
        `        "describe": "Called when the ${
          cases.display
        } API call completes, passing the data as a payload.",`,
        `        "set": {`,
        `          "isLoading": false,`,
        `          "data": "payload",`,
        `          "hasSucceeded": true`,
        `        }`,
        `      },`,
        `      "${cases.camel}Failed": {`,
        `        "describe": "Called when the ${
          cases.display
        } API Call fails, delivering a standard error message.",`,
        `        "set": {`,
        `          "isLoading": false,`,
        `          "errorMessage": "${cases.display} has failed",`,
        `          "hasError": true`,
        `        }`,
        `      }`,
        `    }`,
        `  }`,
      ]) +
      buffer.slice(-2),
  );
};
