const diff = require('deep-diff');
const fs = require('fs');
const path = require('path');
const Cases = require('../../tools/cases');
const { parseCamelCaseToArray } = require('../../tools/utils');

/**
 * Does a deep diff, comparing the schema objects of the old
 * and new suit.json
 */
module.exports = ({ dotSuitFolder, schemaBuf }) => {
  if (fs.existsSync(path.resolve(`./.suit/${dotSuitFolder}/suit.old.json`))) {
    const oldSchemaBuf = fs
      .readFileSync(path.resolve(`./.suit/${dotSuitFolder}/suit.old.json`))
      .toString();

    const differences =
      diff(JSON.parse(oldSchemaBuf), JSON.parse(schemaBuf)) || [];
    return [
      ...differences
        .filter(({ kind }) => kind === 'D' || kind === 'N')
        .map(({ path: oldPath }, index) => {
          if (!differences[index + 1]) return null;
          const newPath = differences[index + 1].path;
          return JSON.stringify(oldPath.slice(0, oldPath.length - 1)) ===
            JSON.stringify(newPath.slice(0, newPath.length - 1))
            ? {
                removed: oldPath,
                added: newPath,
                removedCases: new Cases(
                  parseCamelCaseToArray(oldPath[oldPath.length - 1]),
                ).all(),
                addedCases: new Cases(
                  parseCamelCaseToArray(newPath[newPath.length - 1]),
                ).all(),
              }
            : null;
        })
        .filter(n => n !== null),
      // Saga changes in actions
      ...differences
        .filter(
          ({ path: diffPath, lhs, rhs }) =>
            diffPath.includes('saga') && lhs && rhs,
        )
        .map(({ lhs, rhs, path: diffPath }) => ({
          removed: diffPath,
          removedCases: new Cases(parseCamelCaseToArray(`${lhs}`)).all(),
          addedCases: new Cases(parseCamelCaseToArray(`${rhs}`)).all(),
        })),
    ];
  }
  return [];
};
