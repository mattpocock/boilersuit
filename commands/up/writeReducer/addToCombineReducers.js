const { concat } = require('../../../tools/utils');

module.exports = camel => buffer => {
  const searchTerm = 'combineReducers({';
  const index = buffer.indexOf(searchTerm) + searchTerm.length;
  return (
    concat([
      buffer.slice(0, index),
      `  ${camel}: ${camel}Reducer, // @suit-line`,
    ]) + buffer.slice(index)
  );
};
