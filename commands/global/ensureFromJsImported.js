const Parser = require('../../tools/parser');

const ensureFromJsImported = buffer => {
  const parser = new Parser(buffer);
  if (parser.includes(`fromJS`)) {
    return buffer;
  }
  if (parser.includes(`} from 'immutable';`)) {
    const index = parser.indexOf(`} from 'immutable';`);
    return buffer.slice(0, index) + `, fromJS ` + buffer.slice(index);
  }
  return (
    buffer.slice(0, parser.firstImportIndex()) +
    `import { fromJS } from 'immutable';\n` +
    buffer.slice(parser.firstImportIndex())
  );
};

module.exports = ensureFromJsImported;
