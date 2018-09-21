const {
  concat,
  printObject,
  actionHasPayload,
} = require('../../../tools/utils');

/**
 * Writes an initial frame of a reducer before the 'export default' section
 */
module.exports = ({
  actions,
  display,
  describe,
  pascal,
  camel,
  initialState,
}) => buffer => {
  const index = buffer.lastIndexOf('export default');
  const hasPayload = actionHasPayload(actions);

  return concat([
    buffer.slice(0, index),
    `// @suit-start`,
    `/**`,
    ` * ${display} Reducer`,
    describe ? ` * - ${describe}` : null,
    ` */`,
    ``,
    `export const initial${pascal}State = fromJS(${printObject(
      initialState,
    )});`,
    ``,
    `export const ${camel}Reducer = (state = initial${pascal}State, { type${
      hasPayload ? ', payload' : ''
    } }) => {`,
    `  switch (type) {`,
    `    default:`,
    `      return state;`,
    `  }`,
    `};`,
    `// @suit-end`,
    ``,
    buffer.slice(index),
  ]);
};
