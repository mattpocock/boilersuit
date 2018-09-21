const fs = require('fs');
const printWarning = require('../../tools/printWarning');

/**
 * Checks if there has been any changes between this suit file
 * and a previous version.
 *
 * Returns a boolean saying whether suit up should continue
 */
module.exports = ({
  dotSuitFolder,
  force,
  quiet,
  folder,
  schemaBuf,
  warnings,
}) => {
  if (fs.existsSync(`./.suit/${dotSuitFolder}/suit.old.json`) && !force) {
    if (
      fs.readFileSync(`./.suit/${dotSuitFolder}/suit.old.json`).toString() ===
      schemaBuf
    ) {
      if (warnings.length) {
        console.log(`\n ${folder}suit.json `.bgYellow.black);
        printWarning(warnings);
      } else if (!quiet) {
        console.log(`\n ${folder}suit.json `.bgGreen.black);
        console.log(
          `\n NO CHANGES:`.green +
            ` No changes found in suit file from previous version. Not editing files.`,
        );
      }
      return false;
    }
  }
  return true;
};
