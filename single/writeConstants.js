const { fixFolderName, concat } = require('../tools/utils');

module.exports = (buf, { display, constant }, folderName) => {
  const buffer = buf.toString();
  const fixedFolderName = fixFolderName(folderName);
  return concat([
    buffer,
    `/** ${display} */`,
    `export const CHANGE_${constant} =`,
    `  'app/${fixedFolderName}CHANGE_${constant}';`,
    ``,
  ]);
};
