const { concat } = require('../tools/utils');
const Parser = require('../tools/parser');

module.exports = (buf, { display, camel, constant }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  const { index: constantsImportIndex, ...constants } = parser.getImportIndex(
    './constants',
  );

  const { index: actionsImportIndex, ...actions } = parser.getImportIndex(
    './actions',
  );

  const { index: allSagasIndex, ...allSagas } = parser.getAllSagasIndex();

  const {
    index: lastExportIndex,
    ...exportDefault
  } = parser.getExportDefaultIndex();

  return (
    buffer.slice(0, constantsImportIndex) +
    `${constants.prefix || ''}${constant}_STARTED${constants.suffix || ''}` +
    buffer.slice(constantsImportIndex, actionsImportIndex) +
    concat([
      `${actions.prefix || ''}${camel}Failed,`,
      `${camel}Succeeded${actions.suffix || ''}`,
    ]) +
    buffer.slice(actionsImportIndex, lastExportIndex) +
    concat([
      `${exportDefault.prefix ||
        ''}const ${camel}ErrorText = '${display} failed';`,
      ``,
      `export function* ${camel}() {`,
      `  let data = '';`,
      `  try {`,
      `    // data = yield call(${camel}AjaxCall, params);`,
      `    data = { mockedUp: true };`,
      `  } catch (err) {`,
      `    console.log(err); // eslint-disable-line`,
      `    yield put(${camel}Failed(${camel}ErrorText));`,
      `  }`,
      `  if (!data) {`,
      `    yield put(${camel}Failed(${camel}ErrorText));`,
      `  } else if (!data.error) {`,
      `    yield put(${camel}Succeeded(data));`,
      `  } else {`,
      `    yield put(${camel}Failed(${camel}ErrorText));`,
      `  }`,
      `}`,
      `${exportDefault.suffix || ''}`,
    ]) +
    buffer.slice(lastExportIndex, allSagasIndex) +
    `${allSagas.prefix ||
      ''}  yield takeLatest(${constant}_STARTED, ${camel});${allSagas.suffix ||
      ''}` +
    buffer.slice(allSagasIndex)
  );
};
