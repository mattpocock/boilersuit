const { concat, printObject } = require('../../tools/utils');

module.exports = ({ action }) => {
  if (!action.set) {
    return concat([`      return state;`]);
  }

  return concat([
    `      return state`,
    ...Object.entries(action.set).map(entry => ({
      key: entry[0],
      value: entry[1],
    })).map(({ key, value }) => {
      if (typeof value === 'string' && !value.includes('payload')) {
        /* eslint-disable no-param-reassign */
        value = `'${value}'`;
      } else if (typeof value === 'object' && value !== null) {
        value = printObject(value, '          ');
      }
      return `        .set('${key}', ${value})`;
    }),
  ]) + ';';
};
