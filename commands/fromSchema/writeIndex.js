const Parser = require('../../tools/parser');
const { concat } = require('../../tools/utils');

module.exports = (buf, { camel, pascal, display }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  /** State to props */
  const {
    index: mapStateToPropsEnd,
    suffix: mapStateSuffix,
  } = parser.getMapStateToPropsIndex();

  const stringToInsert = concat([
    `  /** ${display} */`,
    `  is${pascal}Loading: makeSelectIs${pascal}Loading(),`,
    `  has${pascal}Failed: makeSelect${pascal}HasFailed(),`,
    `  has${pascal}Succeeded: makeSelect${pascal}HasSucceeded(),`,
    `  ${camel}Data: makeSelect${pascal}Data(),`,
    `  ${camel}ErrorMessage: makeSelect${pascal}ErrorMessage(),${mapStateSuffix ||
      ''}`,
  ]);

  /** Selectors */
  const { index: selectorsIndex, ...selectors } = parser.getImportIndex(
    './selectors',
  );
  const selectorsToInsert = concat([
    `${selectors.prefix || ''}makeSelectIs${pascal}Loading,`,
    `  makeSelect${pascal}HasFailed,`,
    `  makeSelect${pascal}HasSucceeded,`,
    `  makeSelect${pascal}Data,`,
    `  makeSelect${pascal}ErrorMessage${selectors.suffix || ''}`,
  ]);

  /** Dispatch to props */
  const mapDispatchToPropsBeginning = buffer.indexOf('mapDispatchToProps');
  const mapDispatchToPropsEnd =
    buffer.indexOf('return {', mapDispatchToPropsBeginning) + 8;

  const dispatchToInsert = concat([
    ``,
    `    submit${pascal}: () => dispatch(${camel}Started()),`,
  ]);

  /** Actions */
  const { index: actionIndex, ...actions } = parser.getImportIndex('./actions');
  const actionToInsert = `${actions.prefix ||
    ''}${camel}Started${actions.suffix || ''}`;

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
