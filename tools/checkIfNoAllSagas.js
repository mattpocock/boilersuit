const { concat } = require('./utils');

module.exports = buffer => {
  const errors = [];
  if (buffer.indexOf('export default function*') === -1) {
    errors.push(
      concat([
        `No defaultSaga pattern present in saga.js`,
        `- Refactor to this pattern. This will allow suit-managed sagas`,
        `  to slot in alongside other sagas.`,
        `| `,
        `| export default function* defaultSaga() {`,
        `|   takeLatest(ACTION_CONSTANT_NAME, sagaName);`,
        `| }`,
      ]),
    );
  }
  return errors;
};
