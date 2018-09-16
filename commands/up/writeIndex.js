const Cases = require('../../tools/cases');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  prettify,
  ensureImport,
  capitalize,
} = require('../../tools/utils');

module.exports = ({ buffer, cases, initialState, actions, keyChanges }) => {
  /** Checks if the passAsProp keyword is present */
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
          .map(key =>
            ensureImport(key, './actions', {
              destructure: true,
            }),
          ),
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
              const actionCases = new Cases(parseCamelCaseToArray(key)).all();
              const hasPayload =
                Object.values(actions[key].set).filter(value =>
                  `${value}`.includes('payload'),
                ).length || actions[key].payload;
              return concat([
                actions[key].describe
                  ? `    /** ${actions[key].describe} */`
                  : null,
                `    submit${actionCases.pascal}: (${
                  hasPayload ? 'payload' : ''
                }) => dispatch(${actionCases.camel}(${
                  hasPayload ? 'payload' : ''
                })),`,
              ]);
            }),
          '    // @suit-end',
          b.slice(index),
        ])
      );
    },
    /** Writes propTypes, using @suit-name-only // */
    b => {
      const startIndex = b.indexOf('propTypes = {') + 'propTypes = {'.length;
      const endIndex = b.indexOf('\n};', startIndex);
      const propTypesSlice = b.slice(startIndex, endIndex);

      const noPreviousPropTypes =
        propTypesSlice.indexOf('// @suit-name-only-start') === -1;

      if (noPreviousPropTypes) {
        const propTypesToAdd = [
          ...Object.keys(initialState)
            .map(key => ({
              key,
              value: initialState[key],
              fieldCases: new Cases(parseCamelCaseToArray(key)).all(),
            }))
            // If the user has already added it to prop types, don't double add it
            .filter(
              ({ fieldCases }) =>
                propTypesSlice.indexOf(`${cases.camel}${fieldCases.pascal}`) ===
                -1,
            )
            .map(
              ({ value, fieldCases }) =>
                `// ${cases.camel}${
                  fieldCases.pascal
                }: PropTypes.${propTypeFromTypeOf(typeof value)},`,
            ),
          // Adds functions from dispatchToProps
          ...Object.keys(actions)
            .filter(key => {
              /** If no prop filtering, give all props */
              if (!hasPropFiltering) return true;
              return actions[key].passAsProp;
            })
            .filter(
              actionKey =>
                propTypesSlice.indexOf(`submit${capitalize(actionKey)}`) === -1,
            )
            .map(
              actionKey => `// submit${capitalize(actionKey)}: PropTypes.func,`,
            ),
        ];
        // If any valid prop types to add, adds them
        if (propTypesToAdd.length) {
          return concat([
            b.slice(0, startIndex),
            `  // @suit-name-only-start`,
            ...propTypesToAdd,
            `  // @suit-name-only-end` + b.slice(startIndex),
          ]);
        }
        return b;
      }
      return transforms(b, [
        // Removes old keys and adds in the new
        ...keyChanges
          .filter(
            ({ removed }) =>
              removed.includes(cases.camel) &&
              // If key is in initialstate, or is the name of an action
              (removed.includes('initialState') ||
                removed[removed.length - 2] === 'actions'),
          )
          .map(({ removedCases, addedCases }) => buf => {
            const startOfCaseToRemove = buf.indexOf(
              removedCases.pascal,
              startIndex,
            );
            return (
              buf.slice(0, startOfCaseToRemove) +
              addedCases.pascal +
              buf.slice(startOfCaseToRemove + removedCases.pascal.length)
            );
          }),
        // If key still not present, adds it
        ...Object.keys(initialState).map(key => buf => {
          const newPropTypesSlice = buf.slice(
            startIndex,
            buf.indexOf('\n};', startIndex),
          );
          if (
            newPropTypesSlice.indexOf(`${cases.camel}${capitalize(key)}`) === -1
          ) {
            const buffArr = buf.split('\n');
            buffArr.splice(
              buffArr.findIndex(line =>
                line.includes('// @suit-name-only-start'),
              ) + 1,
              0,
              `// ${cases.camel}${capitalize(
                key,
              )}: PropTypes.${propTypeFromTypeOf(typeof value)},`,
            );
            return buffArr.join('\n');
          }
          return buf;
        }),
        // This adds action propTypes
        ...Object.keys(actions)
          .filter(key => {
            /** If no prop filtering, give all props */
            if (!hasPropFiltering) return true;
            return actions[key].passAsProp;
          })
          .map(key => buf => {
            const newPropTypesSlice = buf.slice(
              startIndex,
              buf.indexOf('\n};', startIndex),
            );
            if (newPropTypesSlice.indexOf(`submit${capitalize(key)}`) === -1) {
              const buffArr = buf.split('\n');
              buffArr.splice(
                buffArr.findIndex(line =>
                  line.includes('// @suit-name-only-start'),
                ) + 1,
                0,
                `// submit${capitalize(key)}: PropTypes.func,`,
              );
              return buffArr.join('\n');
            }
            return buf;
          }),
      ]);
    },
    prettify,
  ]);
};

const propTypeFromTypeOf = type => {
  switch (type) {
    case 'function':
      return 'func';
    case 'undefined':
    case 'object':
      return 'any';
    case 'boolean':
      return 'bool';
    default:
      return type;
  }
};
