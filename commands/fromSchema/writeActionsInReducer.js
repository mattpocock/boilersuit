const { concat } = require('../../tools/utils');

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
      }
      return `        .set('${key}', ${value})`;
    }),
  ]) + ';';
};
