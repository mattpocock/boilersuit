const fs = require('fs');
const ajax = require('../ajax');
const up = require('./');
const { concat } = require('../../tools/utils');

module.exports = ({ arrayOfDomains, schemaBuf, schemaFile, folder }) => {
  let extendsFound = false;
  arrayOfDomains.forEach(domain => {
    if (domain.extends === 'ajax') {
      let searchTerm = concat([
        `,`,
        `  "${domain.domainName}": {`,
        `    "extends": "ajax"`,
        `  }`,
      ]);
      let index = schemaBuf.indexOf(searchTerm);
      if (index === -1) {
        searchTerm = concat([
          `  "${domain.domainName}": {`,
          `    "extends": "ajax"`,
          `  }`,
        ]);
        index = schemaBuf.indexOf(searchTerm);
      }
      if (index !== -1) {
        extendsFound = true;
        fs.writeFileSync(
          schemaFile,
          schemaBuf.slice(0, index) +
            schemaBuf.slice(index + searchTerm.length),
        );
        ajax(folder, domain.domainName);
        up(schemaFile);
      }
    }
  });
  return extendsFound;
};
