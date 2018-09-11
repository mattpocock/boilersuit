const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const { cleanFile } = require('../../tools/utils');

const removeSuitFromFile = filename => {
  fs.writeFileSync(filename, cleanFile(fs.readFileSync(filename).toString()));
};

const rm = (folder, { silent = false } = {}) => {
  let fixedFolder = folder;
  if (folder[folder.length - 1] !== '/') {
    fixedFolder += '/';
  }

  if (!silent) {
    console.log(`\n ${fixedFolder} `.white.bgRed);

    console.log('\nCHANGES:'.red);

    console.log('- removing reducers');
    console.log('- removing reducer tests');
    console.log('- removing actions');
    console.log('- removing action tests');
    console.log('- removing constants');
    console.log('- removing selectors');
    console.log('- removing selectors tests');
    console.log('- removing index');
    console.log('- removing saga');
  }

  removeSuitFromFile(`${fixedFolder}/reducer.js`);

  removeSuitFromFile(`${fixedFolder}/tests/reducer.test.js`);

  removeSuitFromFile(`${fixedFolder}/actions.js`);

  removeSuitFromFile(`${fixedFolder}/tests/actions.test.js`);

  removeSuitFromFile(`${fixedFolder}/constants.js`);

  removeSuitFromFile(`${fixedFolder}/selectors.js`);

  removeSuitFromFile(`${fixedFolder}/tests/selectors.test.js`);

  removeSuitFromFile(`${fixedFolder}/index.js`);

  removeSuitFromFile(`${fixedFolder}/saga.js`);
};

module.exports = rm;
