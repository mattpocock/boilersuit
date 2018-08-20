const Parser = function(buffer) {
  this.buffer = buffer;
};

Parser.prototype.lastImportIndex = function() {
  let index = this.buffer.lastIndexOf('import');
  if (index !== -1) {
    return { index, suffix: '\n' };
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
  return this.lastImportIndex();
}

module.exports = Parser;
