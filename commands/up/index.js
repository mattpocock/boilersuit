const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const path = require('path');
const checkExtends = require('./checkExtends');
const printError = require('../../tools/printError');
const printWarning = require('../../tools/printWarning');
const printMessages = require('../../tools/printMessages');
const runPrettier = require('./runPrettier');
const writeAllFiles = require('./writeAllFiles');
const { concat, capitalize } = require('../../tools/utils');
const checkForConfigFile = require('./checkForConfigFile');

const composeSchema = ({ schema, folder }) => {
  let newSchema = schema;
  /** Look for a compose object on the schema */
  if (schema.compose && schema.compose.length) {
    /** For each of the 'compose' array */
    schema.compose.forEach(c => {
      const file = `${c}`.includes('.json') ? c : `${c}.json`;
      if (fs.existsSync(path.resolve(folder, file))) {
        const buf = fs.readFileSync(path.resolve(folder, file)).toString();
        const otherSchema = JSON.parse(buf);
        newSchema = {
          ...schema,
          ...otherSchema,
        };
      }
    });
  }
  return newSchema;
};

const up = (schemaFile, { quiet = false, force = false } = {}, watcher) => {
  // If no .suit folder exists at the root, create one
  if (!fs.existsSync(path.resolve('./.suit'))) {
    fs.mkdirSync(path.resolve('./.suit'));
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
        if (fs.existsSync(path.resolve(`${folder}/${file}`))) {
          const buf = fs
            .readFileSync(path.resolve(`${folder}/${file}`))
            .toString();
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
              schemaFile: path.resolve(`${folder}/${file}`),
              schemaBuf: buf,
            });
          // Adds it to the watcher
          const allWatchedPaths = Object.values(watcher.watched()).reduce(
            (a, b) => [...a, ...b],
            [],
          );
          if (!allWatchedPaths.includes(path.resolve(`${folder}${file}`))) {
            watcher.add(path.resolve(`${folder}${file}`));
          }
        } else {
          errors.push(concat([`Could not find suit.json file ` + `${c}`.cyan]));
        }
      });
    }

    if (extendsFound) return;

    let imports = [];

    if (schema.import) {
      Object.keys(schema.import).forEach(key => {
        const importPath = path.resolve(folder, key, './suit.json');
        if (!fs.existsSync(importPath)) {
          errors.push(`Could not find imported file: ` + `"${key}"`.cyan);
          return;
        }
        const importedSchema = composeSchema({
          folder: path.resolve(folder, key),
          schema: JSON.parse(fs.readFileSync(importPath).toString()),
        });

        Object.keys(schema.import[key]).forEach(domain => {
          if (typeof importedSchema[domain] === 'undefined') {
            errors.push(
              `Could not find reducer` +
                ` ${domain} `.cyan +
                `in ` +
                `${key}`.cyan,
            );
          }
        });

        if (errors.length) return;

        imports = [
          ...imports,
          ...Object.keys(schema.import[key])
            .map(domain => [
              ...(schema.import[key][domain].selectors
                ? schema.import[key][domain].selectors.map(selector => {
                    const importedState = importedSchema[domain].initialState;
                    if (typeof importedState[selector] === 'undefined') {
                      errors.push(
                        `Import failed: ` +
                          `${selector}`.cyan +
                          ` not found in the initialState of ` +
                          `${domain} `.cyan +
                          `in ` +
                          `"${key}suit.json"`.cyan,
                      );
                    }
                    return {
                      value: `${domain}${capitalize(selector)}`,
                      property: `makeSelect${capitalize(domain)}${capitalize(
                        selector,
                      )}`,
                      selector: `makeSelect${capitalize(domain)}${capitalize(
                        selector,
                      )}`,
                      path: key,
                      type: 'selector',
                      initialValue:
                        importedSchema[domain].initialState[selector],
                      fileName: `${key}selectors`,
                    };
                  })
                : []),
              ...(schema.import[key][domain].actions
                ? schema.import[key][domain].actions.map(action => {
                    const importedAction =
                      importedSchema[domain].actions[action];
                    if (!importedAction) {
                      errors.push(
                        `Import failed: ` +
                          `${action}`.cyan +
                          ` not found in ` +
                          `${domain} `.cyan +
                          `in ` +
                          `"${key}suit.json"`.cyan,
                      );
                      return {};
                    }
                    return {
                      property: `${action}`,
                      action,
                      describe: importedAction.describe || '',
                      path: key,
                      payload:
                        importedAction.payload ||
                        (
                          importedAction.set &&
                          Object.values(importedAction.set).filter(value =>
                            `${value}`.includes('payload'),
                          )
                        ).length,
                      type: 'action',
                      fileName: `${key}actions`,
                    };
                  })
                : []),
            ])
            .reduce((a, b) => [...a, ...b], []),
        ];
      });
    }

    if (errors.length) {
      console.log(`\n ${folder}suit.json `.white.bgRed);
      printError(errors);
      return;
    }

    const newSchemaBuf = JSON.stringify(schema, null, 2);

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
      // messages,
    } = writeAllFiles({
      schema,
      imports,
      errors,
      folder,
      newSchemaBuf,
      config: checkForConfigFile(),
      dotSuitFolder,
      quiet,
      force,
      buffers: {
        reducer: fs
          .readFileSync(path.resolve(`${folder}/reducer.js`))
          .toString(),
        actions: fs
          .readFileSync(path.resolve(`${folder}/actions.js`))
          .toString(),
        constants: fs
          .readFileSync(path.resolve(`${folder}/constants.js`))
          .toString(),
        selectors: fs
          .readFileSync(path.resolve(`${folder}/selectors.js`))
          .toString(),
        index: fs.readFileSync(path.resolve(`${folder}/index.js`)).toString(),
        saga: fs.readFileSync(path.resolve(`${folder}/saga.js`)).toString(),
        reducerTests: fs.existsSync(
          path.resolve(`${folder}/tests/reducer.test.js`),
        )
          ? fs
              .readFileSync(path.resolve(`${folder}/tests/reducer.test.js`))
              .toString()
          : '',
        actionTests: fs.existsSync(
          path.resolve(`${folder}/tests/actions.test.js`),
        )
          ? fs
              .readFileSync(path.resolve(`${folder}/tests/actions.test.js`))
              .toString()
          : '',
        selectorsTests: fs.existsSync(
          path.resolve(`${folder}/tests/selectors.test.js`),
        )
          ? fs
              .readFileSync(path.resolve(`${folder}/tests/selectors.test.js`))
              .toString()
          : '',
      },
    });
    if (newErrors.length) {
      console.log(`\n ${folder}suit.json `.white.bgRed);
      printError(newErrors);
      return;
    }

    if (warnings.length) {
      console.log(`\n ${folder}suit.json `.bgYellow.black);
      printWarning(warnings);
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
    fs.writeFileSync(path.resolve(`${folder}/reducer.js`), newReducerBuffer);
    fs.writeFileSync(
      path.resolve(`${folder}/tests/reducer.test.js`),
      newReducerTestBuffer,
    );
    fs.writeFileSync(path.resolve(`${folder}/actions.js`), newActionsBuffer);
    fs.writeFileSync(
      path.resolve(`${folder}/tests/actions.test.js`),
      newActionTestsBuffer,
    );
    fs.writeFileSync(
      path.resolve(`${folder}/constants.js`),
      newConstantsBuffer,
    );
    fs.writeFileSync(
      path.resolve(`${folder}/selectors.js`),
      newSelectorsBuffer,
    );
    fs.writeFileSync(
      path.resolve(`${folder}/tests/selectors.test.js`),
      newSelectorsTestsBuffer,
    );
    fs.writeFileSync(path.resolve(`${folder}/index.js`), newIndexBuffer);
    fs.writeFileSync(path.resolve(`${folder}/saga.js`), saga.buffer);
    if (!fs.existsSync(path.resolve(`./.suit/${dotSuitFolder}`))) {
      fs.mkdirSync(path.resolve(`./.suit/${dotSuitFolder}`));
    }
    fs.writeFileSync(
      path.resolve(`./.suit/${dotSuitFolder}/suit.old.json`),
      newSchemaBuf,
    );

    /** Runs prettier and checks for prettier warnings */
    const prettierWarnings = runPrettier(folder);

    printWarning([...warnings, ...prettierWarnings]);
  });
};

module.exports = up;
