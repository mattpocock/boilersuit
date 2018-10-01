const fs = require('fs');
const path = require('path');

/**
 * Checks if there has been any changes between this suit file
 * and a previous version.
 *
 * Returns a boolean saying whether suit up should continue
 */
module.exports = ({ dotSuitFolder, force, quiet, schemaBuf }) => {
  const messages = [];
  if (
    fs.existsSync(path.resolve(`./.suit/${dotSuitFolder}/suit.old.json`)) &&
    !force
  ) {
    if (
      fs
        .readFileSync(path.resolve(`./.suit/${dotSuitFolder}/suit.old.json`))
        .toString() === schemaBuf
    ) {
      if (!quiet) {
        messages.push(
          `\nNO CHANGES:`.green +
            ` No changes found in suit file from previous version. Not editing files.`,
        );
      }
      return { shouldContinue: false, messages };
    }
  }
  return { shouldContinue: true, messages };
};
