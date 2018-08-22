const { fixFolderName, concat } = require('../tools/utils');

module.exports = (buf, { display, constant }, folderName) => {
  const buffer = buf.toString();
  const fixedFolderName = fixFolderName(folderName);
  return concat([
    buffer,
    `/** ${display} */`,
    `export const ${constant}_STARTED =`,
    `  'app/${fixedFolderName}${constant}_STARTED';`,
    `export const ${constant}_SUCCEEDED =`,
    `  'app/${fixedFolderName}${constant}_SUCCEEDED';`,
    `export const ${constant}_FAILED =`,
    `  'app/${fixedFolderName}${constant}_FAILED';`,
    ``,
  ]);
};
