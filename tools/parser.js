const { concat } = require('./utils');

const Parser = function(buffer) {
  this.buffer = buffer;
  this.ticker = 0;
};

Parser.prototype.lastImportIndex = function() {
  const index = this.buffer.lastIndexOf('import');
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
  const index = this.buffer.indexOf(searchTerm);
  if (index !== -1) {
    return { index: index + searchTerm.length, wasFound: true, prefix: `\n` };
  }
  const exportDefault = this.getExportDefaultIndex();
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
  const index = this.buffer.lastIndexOf('export default ');
  if (index !== -1) {
    return { index, suffix: `\n` };
  }
  throw new Error('Could not find export default in file');
};

Parser.prototype.getAllSagasIndex = function() {
  const searchTerm = 'export default function* allSagas() {';
  const index = this.buffer.indexOf(searchTerm);
  if (index !== -1) {
    return {
      wasFound: true,
      index: index + searchTerm.length,
      prefix: `\n`,
    };
  }
  const exportDefault = this.getExportDefaultIndex();
  return {
    index: exportDefault.index,
    wasFound: false,
    prefix:
      exportDefault.suffix +
      concat([`/**`, `export default function* allSagas() {`, ``]),
    suffix: concat([``, `};`, `*/`, ``]),
  };
};

Parser.prototype.getMapStateToPropsIndex = function() {
  const mapStateToPropsBeginning = this.buffer.indexOf('mapStateToProps');
  const mapStateToPropsEnd = this.buffer.indexOf(
    '});',
    mapStateToPropsBeginning,
  );
  return { index: mapStateToPropsEnd, suffix: '\n' };
};

Parser.prototype.includes = function(string) {
  return this.buffer.indexOf(string) !== -1;
};

/**
 * Uses the ticker to go from piece of text to piece of text.
 */
Parser.prototype.toNext = function(string) {
  const index = this.buffer.indexOf(string, this.ticker);
  if (index >= this.ticker) {
    this.ticker = index;
    return { found: true, index };
  }
  return { found: false };
};

/**
 * Uses the ticker to go from piece of text to piece of text.
 */
Parser.prototype.toPrev = function(string) {
  const index = this.buffer.lastIndexOf(string, this.ticker);
  if (index !== -1 && index <= this.ticker) {
    this.ticker = index;
    return { found: true, index };
  }
  return { found: false };
};

Parser.prototype.resetTicker = function() {
  this.ticker = 0;
};

module.exports = Parser;
