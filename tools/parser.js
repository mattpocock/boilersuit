const { concat } = require('./utils');

const Parser = function(buffer) {
  this.buffer = buffer;
};

Parser.prototype.lastImportIndex = function() {
  let index = this.buffer.lastIndexOf('import');
  if (index !== -1) {
    return index;
  }

  throw new Error('Last import index could not be found');
};

Parser.prototype.getImportIndex = function(filename) {
  let index = this.buffer.indexOf(`\n} from '${filename}`);
  if (index !== -1) {
    return { index, prefix: '\n  ', suffix: `,` };
  }
  index = this.buffer.indexOf(` } from '${filename}';`);
  if (index !== -1) {
    return { index, prefix: `, ` };
  }
  return {
    index: this.lastImportIndex(),
    prefix: 'import {\n',
    suffix: `} from '${filename}';\n`,
  };
};

Parser.prototype.getCombineReducers = function() {
  const searchTerm = `combineReducers({`;
  let index = this.buffer.indexOf(searchTerm);
  if (index !== -1) {
    return { index: index + searchTerm.length, wasFound: true, prefix: `\n` };
  }
  let exportDefault = this.getExportDefaultIndex();
  return {
    index: exportDefault.index,
    wasFound: false,
    prefix:
      exportDefault.suffix +
      concat([`/**`, `export default combineReducers({`, ``]),
    suffix: concat([``, `});`, `*/`, ``]),
  };
};

Parser.prototype.getExportDefaultIndex = function() {
  let index = this.buffer.lastIndexOf('export default ');
  if (index !== -1) {
    return { index, suffix: `\n` };
  }
  throw new Error('Could not find export default in file');
};

Parser.prototype.getAllSagasIndex = function() {
  const searchTerm = 'export default function* allSagas() {';
  let index = this.buffer.indexOf(searchTerm);
  if (index !== -1) {
    return {
      wasFound: true,
      index: index + searchTerm.length,
      prefix: `\n`,
    };
  }
  let exportDefault = this.getExportDefaultIndex();
  return {
    index: exportDefault.index,
    wasFound: false,
    prefix:
      exportDefault.suffix +
      concat([`/**`, `export default function* allSagas() {`, ``]),
    suffix: concat([``, `};`, `*/`, ``]),
  };
};

module.exports = Parser;
