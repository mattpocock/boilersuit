const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const Cases = require('../../tools/cases');
// const writeIndex = require('./writeIndex');
// const writeSelectors = require('./writeSelectors');
// const writeActions = require('./writeActions');
// const writeConstants = require('./writeConstants');
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

  let schema;
  try {
    schema = JSON.parse(schemaBuf.toString());
  } catch (e) {
    console.log(e);
  }
  if (!schema) return;
  /** Turns the schema into an array of domains */

  const reducersFile = `${folder}/reducer.js`;
  const buffer = cleanFile(fs.readFileSync(reducersFile).toString());
  const newBuffer = transforms(buffer, [
    ...Object.keys(schema)
      .map(key => ({ ...schema[key], domainName: key }))
      .map(({ domainName, initialState, actions }) => b => {
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

  fs.writeFileSync(reducersFile, newBuffer);

  // const cases = new Cases(identifier);
  // const allCases = cases.all();

  // /** Index file */
  // fs.readFile(`${folderName}/index.js`, (_, buf) => {
  //   fs.writeFile(`${folderName}/index.js`, writeIndex(buf, allCases), () => {
  //     console.log('Index written!'.white);
  //   });
  // });

  // /** Selectors File */
  // fs.readFile(`${folderName}/selectors.js`, (_, buf) => {
  //   fs.writeFile(
  //     `${folderName}/selectors.js`,
  //     writeSelectors(buf, allCases),
  //     () => {
  //       console.log('Selectors written!'.white);
  //     },
  //   );
  // });

  // /** Actions File */
  // fs.readFile(`${folderName}/actions.js`, (_, buf) => {
  //   fs.writeFile(
  //     `${folderName}/actions.js`,
  //     writeActions(buf, allCases),
  //     () => {
  //       console.log('Actions written!'.white);
  //     },
  //   );
  // });

  // /** Constants File */
  // fs.readFile(`${folderName}/constants.js`, (_, buf) => {
  //   fs.writeFile(
  //     `${folderName}/constants.js`,
  //     writeConstants(buf, allCases, folderName),
  //     () => {
  //       console.log('Constants Written!'.white);
  //     },
  //   );
  // });

  // /** Reducers File */
  // fs.readFile(`${folderName}/reducer.js`, (_, buf) => {
  //   fs.writeFile(
  //     `${folderName}/reducer.js`,
  //     writeReducer(buf, allCases),
  //     () => {
  //       console.log('Reducer written!'.white);
  //     },
  //   );
  // });

  // /** Saga File */
  // fs.readFile(`${folderName}/saga.js`, (_, buf) => {
  //   fs.writeFile(`${folderName}/saga.js`, writeSaga(buf, allCases), () => {
  //     console.log('Saga written!'.white);
  //   });
  // });
};

module.exports = fromSchema;
