const Parser = require('../../../tools/parser');
const { concat } = require('../../../tools/utils');

module.exports = (buf, { pascal, camel }, { pascal: domainPascal }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  /** State to props */
  const {
    index: mapStateToPropsEnd,
    suffix: mapStateSuffix,
  } = parser.getMapStateToPropsIndex();

  const stringToInsert = `  ${camel}: makeSelect${domainPascal}${pascal}(),${mapStateSuffix ||
    ''}`;

  /** Selectors */
  const { index: selectorsIndex, ...selectors } = parser.getImportIndex(
    './selectors',
  );
  const selectorsToInsert = concat([
    `${selectors.prefix ||
      ''}makeSelect${domainPascal}${pascal}${selectors.suffix || ''}`,
  ]);

  return (
    buffer.slice(0, selectorsIndex) +
    selectorsToInsert +
    buffer.slice(selectorsIndex, mapStateToPropsEnd) +
    stringToInsert +
    buffer.slice(mapStateToPropsEnd)
  );
};
