const fs = require('fs');
const path = require('path');
const { concat, parseCamelCaseToArray } = require('../../tools/utils');
const Cases = require('../../tools/cases');

module.exports = (folder, camelCase, file) => {
  let fileToChange = file;
  const array = parseCamelCaseToArray(camelCase);
  const cases = new Cases(array).all();

  if (!fileToChange) {
    let fixedFolder = folder;
    if (folder[folder.length - 1] !== '/') {
      fixedFolder += '/';
    }
    fileToChange = path.resolve(`${fixedFolder}suit.json`);
  }

  let buffer = concat(['{', ' ', '}']);
  let includeComma = false;
  if (fs.existsSync(fileToChange)) {
    const newSchema = fs.readFileSync(fileToChange).toString();
    const anyContent = Object.keys(JSON.parse(newSchema)).length;
    includeComma = anyContent;
    if (anyContent) buffer = newSchema;
  }
  console.log(` ${fileToChange} `.bgGreen.black);
  console.log(
    '\n SUIT: '.green +
      (includeComma ? 'writing existing suit.json' : 'writing new suit.json'),
  );
  fs.writeFileSync(
    fileToChange,
    buffer.slice(0, -3) +
      concat([
        includeComma ? ',' : null,
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
        } API Call. Passes a payload to the saga.",`,
        `        "saga": {`,
        `          "onFail": "${cases.camel}Failed",`,
        `          "onSuccess": "${cases.camel}Succeeded"`,
        `        },`,
        `        "passAsProp": true,`,
        `        "payload": true,`,
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
      buffer.slice(-3),
  );
};
