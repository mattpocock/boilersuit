const fs = require('fs');
const { concat, parseCamelCaseToArray } = require('../../tools/utils');
const Cases = require('../../tools/cases');

module.exports = (folder, camelCase) => {
  const array = parseCamelCaseToArray(camelCase);
  const cases = new Cases(array).all();

  let fixedFolder = folder;
  if (folder[folder.length - 1] === '/') {
    fixedFolder += '/';
  }
  let buffer = concat(['{', '}']);
  let includeComma = false;
  if (fs.existsSync(`${fixedFolder}suit.json`)) {
    buffer = fs.readFileSync(`${fixedFolder}suit.json`).toString();
    includeComma = true;
  }
  console.log(` ${folder} `.bgGreen.black);
  console.log(
    'SUIT: '.green + (includeComma ? 'writing existing suit.json' : 'writing new suit.json'),
  );
  fs.writeFileSync(
    `${fixedFolder}suit.json`,
    buffer.slice(0, -2) +
      concat([
        includeComma ? ',' : undefined,
        `  "${cases.camel}": {`,
        `    "initialState": {`,
        `      "isLoading": false,`,
        `      "hasSucceeded": false,`,
        `      "hasError": false,`,
        `      "errorMessage": "",`,
        `      "data": null`,
        `    },`,
        `    "actions": {`,
        `      "${cases.camel}Started": {`,
        `        "saga": true,`,
        `        "passAsProp": true,`,
        `        "set": {`,
        `          "isLoading": true,`,
        `          "hasSucceeded": false,`,
        `          "hasError": false,`,
        `          "errorMessage": "",`,
        `          "data": null`,
        `        }`,
        `      },`,
        `      "${cases.camel}Succeeded": {`,
        `        "set": {`,
        `          "isLoading": false,`,
        `          "data": "payload",`,
        `          "hasSucceeded": false`,
        `        }`,
        `      },`,
        `      "${cases.camel}Failed": {`,
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
