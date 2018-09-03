const Parser = require('../tools/parser');
const { concat } = require('../tools/utils');

module.exports = (buf, { camel, pascal, display }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  /** State to props */
  const {
    index: mapStateToPropsEnd,
    suffix: mapStateSuffix,
  } = parser.getMapStateToPropsIndex();

  const stringToInsert = concat([
    `  ${camel}: makeSelect${pascal}(),${mapStateSuffix || ''}`,
  ]);

  /** Selectors */
  const { index: selectorsIndex, ...selectors } = parser.getImportIndex(
    './selectors',
  );
  const selectorsToInsert = concat([
    `${selectors.prefix || ''}makeSelect${pascal}${selectors.suffix || ''}`,
  ]);

  /** Dispatch to props */
  const mapDispatchToPropsBeginning = buffer.indexOf('mapDispatchToProps');
  const mapDispatchToPropsEnd =
    buffer.indexOf('return {', mapDispatchToPropsBeginning) + 8;

  const dispatchToInsert = concat([
    ``,
    `    submitChange${pascal}: (value) => dispatch(change${pascal}(value)),`,
  ]);

  /** Actions */
  const { index: actionIndex, ...actions } = parser.getImportIndex('./actions');
  const actionToInsert = `${actions.prefix ||
    ''}change${pascal}${actions.suffix || ''}`;

  return (
    buffer.slice(0, selectorsIndex) +
    selectorsToInsert +
    buffer.slice(selectorsIndex, actionIndex) +
    actionToInsert +
    buffer.slice(actionIndex, mapStateToPropsEnd) +
    stringToInsert +
    buffer.slice(mapStateToPropsEnd, mapDispatchToPropsEnd) +
    dispatchToInsert +
    buffer.slice(mapDispatchToPropsEnd)
  );
};
