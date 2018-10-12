const {
  concat,
  transforms,
  prettify,
  ensureImport,
} = require('../../../tools/utils');

module.exports = ({ buffer, cases, actionCases, action }) => {
  const messages = [];
  const newBuffer = transforms(buffer, [
    ensureImport('takeLatest', 'redux-saga/effects', { destructure: true }),
    ensureImport('put', 'redux-saga/effects', { destructure: true }),
    b => {
      const index = b.indexOf('{', b.indexOf('export default function*')) + 1;
      return concat([
        b.slice(0, index),
        `  // @suit-start`,
        `  yield takeLatest(${actionCases.constant}, ${cases.camel});`,
        `  // @suit-end` + b.slice(index),
      ]);
    },
    b => {
      const sagaPresent = b.indexOf(`function* ${cases.camel}`) !== -1;
      if (sagaPresent) {
        messages.push(
          `\nSAGA:`.green +
            ` ${
              cases.camel
            } saga already present in file. No edits have been made.`,
        );
        return b;
      }
      const index = b.indexOf(`export default`);

      messages.push(
        concat([
          `\nSAGA:`.green + ` ${cases.camel} saga not found in file.`,
          `- Adding a basic skeleton of a saga. This needs to be updated manually.`,
        ]),
      );

      return concat([
        b.slice(0, index),
        `/**`,
        ` * ${cases.display} Saga`,
        ` * This saga was added by boilersuit, but is not managed by boilersuit.`,
        ` * That means you need to edit it yourself, and delete it yourself if your`,
        ` * actions, constants or reducer name changes.`,
        ` */`,
        `function* ${cases.camel}(${action.payload ? '{ payload }' : ''}) {`,
        `  let data = '';`,
        `  try {`,
        `    data = yield call(null${action.payload ? ', payload' : ''});`,
        `  } catch (err) {`,
        `    console.log(err); // eslint-disable-line`,
        `    yield put(actionToFireWhen${cases.pascal}Fails());`,
        `  }`,
        `  if (!data) {`,
        `    yield put(actionToFireWhen${cases.pascal}Fails());`,
        `  } else if (!data.error) {`,
        `    yield put(actionToFireWhen${cases.pascal}Succeeds(data.body));`,
        `  } else {`,
        `    yield put(actionToFireWhen${cases.pascal}Fails());`,
        `  }`,
        `}`,
        ``,
        b.slice(index),
      ]);
    },
    ensureImport(actionCases.constant, './constants', { destructure: true }),
    b => {
      console.log(b.indexOf('call('));
      if (b.indexOf('call(') !== -1) {
        return ensureImport('call', 'redux-saga/effects', {
          destructure: true,
        })(b);
      }
      return b;
    },
    prettify,
  ]);
  return {
    buffer: newBuffer,
    messages,
    errors: [],
  };
};
