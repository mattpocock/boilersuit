const {
  concat,
  printObject,
  actionHasPayload,
  transforms,
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
}) => buf =>
  transforms(buf, [
    buffer => {
      const startIndex = buffer.indexOf(`export const ${camel}Reducer = `);
      const hasPayload = actionHasPayload(actions);
      if (startIndex === -1) return buffer;
      const slice = buffer.slice(
        startIndex,
        buffer.indexOf(') => {', startIndex) + 6,
      );
      return buffer.replace(
        slice,
        concat([
          `export const ${camel}Reducer = (state = initial${pascal}State, { type${
            hasPayload ? ', payload' : ''
          } }) => {`,
        ]),
      );
    },
    buffer => {
      const index = buffer.lastIndexOf('export default');
      const hasPayload = actionHasPayload(actions);

      /** Detect if it exists */

      const alreadyExists = buffer.includes(`export const ${camel}Reducer = (`);
      if (alreadyExists) {
        return buffer;
      }

      /** Change payload */

      /**  */

      return concat([
        buffer.slice(0, index),
        `// @suit-name-only-start`,
        `export const ${camel}Reducer = (state = initial${pascal}State, { type${
          hasPayload ? ', payload' : ''
        } }) => {`,
        `  switch (type) {`,
        `    default:`,
        `      return state;`,
        `  }`,
        `};`,
        `// @suit-name-only-end`,
        ``,
        buffer.slice(index),
      ]);
    },
    buffer => {
      const index = buffer.indexOf(`export const ${camel}Reducer`);
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
        `// @suit-end`,
        buffer.slice(index),
      ]);
    },
  ]);
