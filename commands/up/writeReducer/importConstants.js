const Cases = require('../../../tools/cases');
const {
  transforms,
  parseCamelCaseToArray,
  ensureImport,
} = require('../../../tools/utils');

module.exports = actions => buf =>
  transforms(buf, [
    ...Object.keys(actions)
      .map(key => ({ ...actions[key], name: key }))
      .map(action => {
        const c = new Cases(parseCamelCaseToArray(action.name));
        const constant = c.constant();
        return ensureImport(constant, './constants', { destructure: true });
      }),
  ]);
