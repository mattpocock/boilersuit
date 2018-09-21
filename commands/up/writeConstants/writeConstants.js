const { concat, transforms, prettify } = require('../../../tools/utils');
const writeOneConstant = require('./writeOneConstant');

module.exports = ({ buffer, cases, actions, folder }) =>
  transforms(buffer, [
    /** Adds the domain */
    b => concat([b, `// @suit-start`, ``, `/** ${cases.display} constants */`]),
    /** Adds each action */
    ...Object.keys(actions)
      .map(key => ({ name: key, ...actions[key] }))
      .reverse()
      .map(writeOneConstant({ cases, folder })),
    prettify,
  ]);
