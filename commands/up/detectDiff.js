const diff = require('deep-diff');
const fs = require('fs');
const Cases = require('../../tools/cases');
const { parseCamelCaseToArray } = require('../../tools/utils');

/**
 * Does a deep diff, comparing the schema objects of the old
 * and new suit.json
 */
module.exports = ({ dotSuitFolder, schemaBuf }) => {
  if (fs.existsSync(`./.suit/${dotSuitFolder}/suit.old.json`)) {
    const oldSchemaBuf = fs
      .readFileSync(`./.suit/${dotSuitFolder}/suit.old.json`)
      .toString();

    const differences =
      diff(JSON.parse(oldSchemaBuf), JSON.parse(schemaBuf)) || [];
    return [
      ...differences
        .filter(({ kind }) => kind === 'D' || kind === 'N')
        .map(({ path }, index) => {
          if (!differences[index + 1]) return null;
          const newPath = differences[index + 1].path;
          return JSON.stringify(path.slice(0, path.length - 1)) ===
            JSON.stringify(newPath.slice(0, newPath.length - 1))
            ? {
                removed: path,
                added: newPath,
                removedCases: new Cases(
                  parseCamelCaseToArray(path[path.length - 1]),
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
        .filter(({ path, lhs, rhs }) => path.includes('saga') && lhs && rhs)
        .map(({ lhs, rhs, path }) => ({
          removed: path,
          removedCases: new Cases(parseCamelCaseToArray(`${lhs}`)).all(),
          addedCases: new Cases(parseCamelCaseToArray(`${rhs}`)).all(),
        })),
    ];
  }
  return [];
};
