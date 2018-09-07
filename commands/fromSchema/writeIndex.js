const Cases = require('../../tools/cases');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  prettify,
  ensureImport,
} = require('../../tools/utils');

module.exports = ({ buffer, cases, initialState, actions }) => {
  if (!actions || !initialState) return buffer;
  const hasPropFiltering = Object.values(actions).filter(actionValues =>
    Object.keys(actionValues).includes('passAsProp'),
  ).length;
  return transforms(buffer, [
    /** Import all selectors */
    b =>
      transforms(b, [
        ...Object.keys(initialState).map(key => {
          const c = new Cases(parseCamelCaseToArray(key));
          const fieldCases = c.all();
          return ensureImport(
            `makeSelect${cases.pascal}${fieldCases.pascal}`,
            './selectors',
            {
              destructure: true,
            },
          );
        }),
      ]),
    /** Import actions */
    b =>
      transforms(b, [
        ...Object.keys(actions)
          .filter(key => {
            /** If no prop filtering, give all props */
            if (!hasPropFiltering) return true;
            return actions[key].passAsProp;
          })
          .map(key => {
            const c = new Cases(parseCamelCaseToArray(key));
            const keyCases = c.all();
            return ensureImport(keyCases.camel, './actions', {
              destructure: true,
            });
          }),
      ]),
    /** Get Selectors Into mapStateToProps */
    b => {
      const searchTerm = 'mapStateToProps = createStructuredSelector({\n';
      const index = b.indexOf(searchTerm) + searchTerm.length;
      return (
        b.slice(0, index) +
        concat([
          '  // @suit-start',
          ...Object.keys(initialState).map(key => {
            const c = new Cases(parseCamelCaseToArray(key));
            const fieldCases = c.all();
            return `  ${cases.camel}${fieldCases.pascal}: makeSelect${
              cases.pascal
            }${fieldCases.pascal}(),`;
          }),
          '  // @suit-end',
          b.slice(index),
        ])
      );
    },
    /** Get actions into mapDispatchToProps */
    b => {
      const searchTerm = concat([
        'mapDispatchToProps(dispatch) {',
        '  return {\n',
      ]);
      const index = b.indexOf(searchTerm) + searchTerm.length;
      return (
        b.slice(0, index) +
        concat([
          '    // @suit-start',
          ...Object.keys(actions)
            .filter(key => {
              /** If no prop filtering, give all props */
              if (!hasPropFiltering) return true;
              return actions[key].passAsProp;
            })
            .map(key => {
              const c = new Cases(parseCamelCaseToArray(key));
              const actionCases = c.all();
              if (actions[key].set) {
                const hasPayload = Object.values(actions[key].set).filter(
                  value => `${value}`.includes('payload'),
                ).length || actions[key].payload;
                if (hasPayload) {
                  return `    submit${
                    actionCases.pascal
                  }: (payload) => dispatch(${actionCases.camel}(payload)),`;
                }
              }
              return `    submit${actionCases.pascal}: () => dispatch(${
                actionCases.camel
              }()),`;
            }),
          '    // @suit-end',
          b.slice(index),
        ])
      );
    },
    prettify,
  ]);
};
