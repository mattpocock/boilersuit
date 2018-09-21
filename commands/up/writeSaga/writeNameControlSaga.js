const {
  concat,
  transforms,
  prettify,
  ensureImport,
} = require('../../../tools/utils');
const replaceInNameOnly = require('../../../tools/replaceInNameOnly');

module.exports = ({
  buffer,
  domainCases,
  actionCases,
  action,
  failCases,
  successCases,
  keyChanges,
}) => {
  const messages = [];
  const newBuffer = transforms(buffer, [
    ensureImport(failCases.camel, './actions', { destructure: true }),
    ensureImport(successCases.camel, './actions', { destructure: true }),
    ensureImport('takeLatest', 'redux-saga/effects', { destructure: true }),
    ensureImport('call', 'redux-saga/effects', { destructure: true }),
    ensureImport('put', 'redux-saga/effects', { destructure: true }),
    b => {
      const index = b.indexOf('{', b.indexOf('export default function*')) + 1;
      return concat([
        b.slice(0, index),
        `  // @suit-start`,
        `  yield takeLatest(${actionCases.constant}, ${domainCases.camel});`,
        `  // @suit-end` + b.slice(index),
      ]);
    },
    // Change sagas if already present
    b =>
      transforms(b, [
        ...keyChanges
          .filter(
            ({ removed }) =>
              removed.includes('saga') && removed.includes('actions'),
          )
          .map(({ removedCases, addedCases }) =>
            replaceInNameOnly(removedCases.camel, addedCases.camel),
          ),
      ]),
    b => {
      const sagaPresent = b.indexOf(`function* ${domainCases.camel}`) !== -1;
      if (sagaPresent) {
        messages.push(
          `\nSAGA:`.green +
            ` ${
              domainCases.camel
            } saga already present in file. No edits have been made.`,
        );
        return b;
      }
      const index = b.indexOf(`export default`);

      messages.push(
        concat([
          `\nSAGA:`.green + ` ${domainCases.camel} saga not found in file.`,
          `- Adding a basic skeleton of a saga. This needs to be updated manually.`,
        ]),
      );

      return concat([
        b.slice(0, index),
        `// @suit-name-only-start`,
        `function* ${domainCases.camel}(${
          action.payload ? '{ payload }' : ''
        }) {`,
        `  let data = '';`,
        `  try {`,
        `    data = yield call(null${action.payload ? ', payload' : ''});`,
        `  } catch (err) {`,
        `    console.log(err); // eslint-disable-line`,
        `    yield put(${failCases.camel}());`,
        `  }`,
        `  if (!data) {`,
        `    yield put(${failCases.camel}());`,
        `  } else if (!data.error) {`,
        `    yield put(${successCases.camel}(data.body));`,
        `  } else {`,
        `    yield put(${failCases.camel}());`,
        `  }`,
        `}`,
        `// @suit-name-only-end`,
        ``,
        b.slice(index),
      ]);
    },
    ensureImport(actionCases.constant, './constants', { destructure: true }),
    prettify,
  ]);
  return {
    buffer: newBuffer,
    messages,
    errors: [],
  };
};
