const fs = require('fs');
const { exec } = require('child_process');
const { concat } = require('../../tools/utils');

module.exports = folder => {
  const prettierErrors = [];
  if (fs.existsSync('./.prettierrc')) {
    try {
      exec(`prettier --config ./.prettierrc --write "${folder}/**/*.js"`);
      console.log(
        `\nPRETTIER: `.green +
          `Running prettier on this folder from the root config.`,
      );
    } catch (e) {
      console.log(
        concat([
          'No version of prettier found. This will make your files uglier.',
          `- If you're running suit from npm scripts, run npm i prettier`,
          `- If you installed suit by typing npm i -g boilersuit, run npm i -g prettier`,
        ]),
      );
    }
  } else {
    prettierErrors.push(
      concat([
        `I see you're not using prettier!`,
        `- Try adding a .prettierrc to your root directory and suit will make things prettier :)`,
      ]),
    );
  }
  return prettierErrors;
};
