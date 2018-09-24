const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const checkExtends = require('./checkExtends');
const printError = require('../../tools/printError');
const printWarning = require('../../tools/printWarning');
const printMessages = require('../../tools/printMessages');
const runPrettier = require('./runPrettier');
const checkForChanges = require('./checkForChanges');
const writeAllFiles = require('./writeAllFiles');
const { concat } = require('../../tools/utils');
const checkForConfigFile = require('./checkForConfigFile');

const up = (schemaFile, { quiet = false, force = false } = {}, watcher) => {
  // If no .suit folder exists at the root, create one
  if (!fs.existsSync('./.suit')) {
    fs.mkdirSync('./.suit');
  }

  /** If this is not a suit.json file, return */
  if (!schemaFile.includes('suit.json')) return;
  fs.readFile(schemaFile, (err, s) => {
    const errors = [];
    const schemaBuf = s.toString();
    /** Gives us the folder where the schema file lives */
    const folder = schemaFile
      .slice(0, -9)
      // This replaces all backslashes with forward slashes on Windows
      .replace(/\\/g, '/');
    const dotSuitFolder = folder.replace(/\//g, '-');

    let schema;
    try {
      schema = JSON.parse(schemaBuf.toString());
    } catch (e) {
      console.log('Error: ', e);
      return;
    }

    let extendsFound = checkExtends({
      arrayOfDomains: Object.keys(schema).map(key => ({
        ...schema[key],
        domainName: key,
      })),
      folder,
      schemaFile,
      schemaBuf,
    });

    if (extendsFound) return;

    /** Look for a compose object on the schema */
    if (schema.compose && schema.compose.length) {
      /** For each of the 'compose' array */
      schema.compose.forEach(c => {
        const file = `${c}`.includes('.json') ? c : `${c}.json`;
        if (fs.existsSync(`${folder}/${file}`)) {
          const buf = fs.readFileSync(`${folder}/${file}`).toString();
          const otherSchema = JSON.parse(buf);
          schema = {
            ...schema,
            ...otherSchema,
          };

          extendsFound =
            extendsFound ||
            checkExtends({
              arrayOfDomains: Object.keys(otherSchema).map(key => ({
                ...otherSchema[key],
                domainName: key,
              })),
              folder,
              schemaFile: `${folder}/${file}`,
              schemaBuf: buf,
            });
          // Adds it to the watcher
          const allWatchedPaths = Object.values(watcher.watched()).reduce(
            (a, b) => [...a, ...b],
            [],
          );
          if (!allWatchedPaths.includes(`${folder}${file}`)) {
            watcher.add(`${folder}${file}`);
          }
        } else {
          errors.push(concat([`Could not find suit.json file ` + `${c}`.cyan]));
        }
      });
    }

    if (extendsFound) return;

    const newSchemaBuf = JSON.stringify(schema, null, 2);

    /** Check for a previous suit file in folder - force prevents this check */
    const {
      shouldContinue: anyChanges,
      messages: changeMessages,
    } = checkForChanges({
      dotSuitFolder,
      quiet,
      force,
      schemaBuf: newSchemaBuf,
    });
    if (!anyChanges) {
      if (!quiet) {
        console.log(`\n ${folder}suit.json `.bgGreen.black);
        printMessages(changeMessages);
      }
      return;
    }

    const {
      newReducerBuffer,
      newReducerTestBuffer,
      newActionsBuffer,
      newSelectorsBuffer,
      newActionTestsBuffer,
      newConstantsBuffer,
      newSelectorsTestsBuffer,
      newIndexBuffer,
      saga,
      shouldContinue,
      errors: newErrors,
      warnings,
      messages,
    } = writeAllFiles({
      schema,
      errors,
      folder,
      newSchemaBuf,
      config: checkForConfigFile(),
      dotSuitFolder,
      quiet,
      force,
      buffers: {
        reducer: fs.readFileSync(`${folder}/reducer.js`).toString(),
        actions: fs.readFileSync(`${folder}/actions.js`).toString(),
        constants: fs.readFileSync(`${folder}/constants.js`).toString(),
        selectors: fs.readFileSync(`${folder}/selectors.js`).toString(),
        index: fs.readFileSync(`${folder}/index.js`).toString(),
        saga: fs.readFileSync(`${folder}/saga.js`).toString(),
        reducerTests: fs.existsSync(`${folder}/tests/reducer.test.js`)
          ? fs.readFileSync(`${folder}/tests/reducer.test.js`).toString()
          : '',
        actionTests: fs.existsSync(`${folder}/tests/actions.test.js`)
          ? fs.readFileSync(`${folder}/tests/actions.test.js`).toString()
          : '',
        selectorsTests: fs.existsSync(`${folder}/tests/selectors.test.js`)
          ? fs.readFileSync(`${folder}/tests/selectors.test.js`).toString()
          : '',
      },
    });
    if (newErrors.length) {
      console.log(`\n ${folder}suit.json `.white.bgRed);
      printError(newErrors);
      return;
    }

    if (!quiet) {
      if (warnings.length) {
        console.log(`\n ${folder}suit.json `.bgYellow.black);
      } else {
        console.log(`\n ${folder}suit.json `.bgGreen.black);
        printMessages(messages);
      }
    }

    if (!shouldContinue) {
      return;
    }

    if (quiet) {
      console.log(`\n ${folder}suit.json `.bgGreen.black);
    }

    printMessages([
      ...saga.messages,
      '\nCHANGES:'.green,
      'writing reducers, reducer tests, actions, action tests, constants, selectors, selectors tests, index, saga, saving old suit file in .suit directory',
    ]);
    fs.writeFileSync(`${folder}/reducer.js`, newReducerBuffer);
    fs.writeFileSync(`${folder}/tests/reducer.test.js`, newReducerTestBuffer);
    fs.writeFileSync(`${folder}/actions.js`, newActionsBuffer);
    fs.writeFileSync(`${folder}/tests/actions.test.js`, newActionTestsBuffer);
    fs.writeFileSync(`${folder}/constants.js`, newConstantsBuffer);
    fs.writeFileSync(`${folder}/selectors.js`, newSelectorsBuffer);
    fs.writeFileSync(
      `${folder}/tests/selectors.test.js`,
      newSelectorsTestsBuffer,
    );
    fs.writeFileSync(`${folder}/index.js`, newIndexBuffer);
    fs.writeFileSync(`${folder}/saga.js`, saga.buffer);
    if (!fs.existsSync(`./.suit/${dotSuitFolder}`)) {
      fs.mkdirSync(`./.suit/${dotSuitFolder}`);
    }
    fs.writeFileSync(`./.suit/${dotSuitFolder}/suit.old.json`, newSchemaBuf);

    /** Runs prettier and checks for prettier warnings */
    const prettierWarnings = runPrettier(folder);

    printWarning(prettierWarnings);
  });
};

module.exports = up;
