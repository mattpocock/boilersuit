const { concat, transforms, prettify } = require('../../../tools/utils');
const writeOneAction = require('./writeOneAction');

module.exports = ({ buffer, cases, actions }) =>
  transforms(buffer, [
    /** Adds the domain */
    b => concat([b, `// @suit-start`, ``, `/** ${cases.display} actions */`]),
    /** Adds each action */
    ...Object.keys(actions)
      .map(key => ({ name: key, ...actions[key] }))
      .reverse()
      .map(writeOneAction(cases)),
    prettify,
  ]);
