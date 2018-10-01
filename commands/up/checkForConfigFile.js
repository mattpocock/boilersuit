const fs = require('fs');
const path = require('path');
const { transforms } = require('../../tools/utils');

module.exports = () => {
  const { found, file } = transforms({ found: false, file: null }, [
    ...[path.resolve('./.suitrc.json'), path.resolve('./.suitrc')].map(
      fileName => () => {
        const wasFound = fs.existsSync(fileName);
        return { found: wasFound, file: wasFound ? fileName : null };
      },
    ),
  ]);
  if (!found) {
    return {};
  }
  return JSON.parse(fs.readFileSync(file));
};
