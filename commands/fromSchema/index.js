const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const Cases = require('../../tools/cases');
// const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');
const writeActions = require('./writeActions');
const writeConstants = require('./writeConstants');
const writeReducer = require('./writeReducer');
// const writeSaga = require('./writeSaga');
const {
  parseCamelCaseToArray,
  cleanFile,
  transforms,
} = require('../../tools/utils');

const fromSchema = schemaFile => {
  const schemaBuf = fs.readFileSync(schemaFile);
  /** Gives us the folder where the schema file lives */
  const folder = schemaFile.slice(0, -9);

  console.log(`\n${folder}`.yellow);

  let schema;
  try {
    schema = JSON.parse(schemaBuf.toString());
  } catch (e) {
    console.log(e);
  }
  if (!schema) return;

  const arrayOfDomains = Object.keys(schema).map(key => ({
    ...schema[key],
    domainName: key,
  }));

  /** Write Reducers */
  const reducersFile = `${folder}/reducer.js`;
  const reducerBuffer = cleanFile(fs.readFileSync(reducersFile).toString());
  const newReducerBuffer = transforms(reducerBuffer, [
    ...arrayOfDomains.map(({ domainName, initialState, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      if (!initialState) {
        console.log(
          `No initialState specified for ${allDomainCases.display}!`.red,
        );
        return b;
      }

      return writeReducer({
        buffer: b,
        cases: allDomainCases,
        initialState,
        actions,
      });
    }),
  ]);

  fs.writeFileSync(reducersFile, newReducerBuffer);

  /** Write Actions */

  const actionsBuffer = fs.readFileSync(`${folder}/actions.js`).toString();

  const newActionsBuffer = transforms(actionsBuffer, [
    cleanFile,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();
      if (!actions) {
        console.log(`No actions specified for ${allDomainCases.display}`.red);
        return b;
      }

      return writeActions({
        buffer: b,
        cases: allDomainCases,
        actions,
      });
    }),
  ]);

  fs.writeFileSync(`${folder}/actions.js`, newActionsBuffer);

  /** Write Constants */

  const constantsBuffer = fs.readFileSync(`${folder}/constants.js`).toString();

  const newConstantsBuffer = transforms(constantsBuffer, [
    cleanFile,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();
      if (!actions) {
        // They will have been warned already, so can fail silently
        return b;
      }

      return writeConstants({
        buffer: b,
        cases: allDomainCases,
        actions,
        folder,
      });
    }),
  ]);

  fs.writeFileSync(`${folder}/constants.js`, newConstantsBuffer);

  /** Write Selectors */

  const selectorsBuffer = fs.readFileSync(`${folder}/selectors.js`).toString();

  const newSelectorsBuffer = transforms(selectorsBuffer, [
    cleanFile,
    ...arrayOfDomains.map(({ domainName, initialState }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();
      if (!initialState) {
        // They will have been warned already, so can fail silently
        return b;
      }

      return writeSelectors({
        buffer: b,
        cases: allDomainCases,
        initialState,
        folder,
      });
    }),
  ]);

  fs.writeFileSync(`${folder}/selectors.js`, newSelectorsBuffer);
  // console.log(newSelectorsBuffer);

  // const cases = new Cases(identifier);
  // const allCases = cases.all();

  // /** Index file */
  // fs.readFile(`${folderName}/index.js`, (_, buf) => {
  //   fs.writeFile(`${folderName}/index.js`, writeIndex(buf, allCases), () => {
  //     console.log('Index written!');
  //   });
  // });

  // /** Selectors File */
  // fs.readFile(`${folderName}/selectors.js`, (_, buf) => {
  //   fs.writeFile(
  //     `${folderName}/selectors.js`,
  //     writeSelectors(buf, allCases),
  //     () => {
  //       console.log('Selectors written!');
  //     },
  //   );
  // });

  // /** Constants File */
  // fs.readFile(`${folderName}/constants.js`, (_, buf) => {
  //   fs.writeFile(
  //     `${folderName}/constants.js`,
  //     writeConstants(buf, allCases, folderName),
  //     () => {
  //       console.log('Constants Written!');
  //     },
  //   );
  // });

  // /** Reducers File */
  // fs.readFile(`${folderName}/reducer.js`, (_, buf) => {
  //   fs.writeFile(
  //     `${folderName}/reducer.js`,
  //     writeReducer(buf, allCases),
  //     () => {
  //       console.log('Reducer written!');
  //     },
  //   );
  // });

  // /** Saga File */
  // fs.readFile(`${folderName}/saga.js`, (_, buf) => {
  //   fs.writeFile(`${folderName}/saga.js`, writeSaga(buf, allCases), () => {
  //     console.log('Saga written!');
  //   });
  // });
};

module.exports = fromSchema;
