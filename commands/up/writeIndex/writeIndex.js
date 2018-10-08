const Cases = require('../../../tools/cases');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  prettify,
  ensureImport,
  capitalize,
} = require('../../../tools/utils');

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
                (actions[key].set &&
                  Object.values(actions[key].set).filter(value =>
                    `${value}`.includes('payload'),
                  ).length) ||
                actions[key].payload;
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
    /** Adds a suit-name-only area to the PropTypes if it doesn't already exist */
    b => {
      const startIndex = b.indexOf('propTypes = {') + 'propTypes = {'.length;
      const endIndex = b.indexOf('\n};', startIndex);
      // Makes a slice of the proptypes to check if keys already exist
      const propTypesSlice = b.slice(startIndex, endIndex);

      const noPreviousPropTypes =
        propTypesSlice.indexOf('// @suit-name-only-start') === -1;

      // If we've not put in a // @suit-name-only section
      if (noPreviousPropTypes) {
        return concat([
          b.slice(0, startIndex),
          `  // @suit-name-only-start`,
          `  // @suit-name-only-end` + b.slice(startIndex),
        ]);
      }
      return b;
    },
    /** Makes changes to proptypes based on keyChanges */
    b =>
      transforms(b, [
        // Checks the list of new changes for any relevant ones for PropTypes
        ...keyChanges
          .filter(
            ({ removed }) =>
              removed.includes(cases.camel) &&
              // If key is in initialstate, or is the name of an action, include it
              (removed.includes('initialState') ||
                removed[removed.length - 2] === 'actions'),
          )
          // There are both actions and initialState bits in this area
          .map(({ removed, removedCases, addedCases }) => buf => {
            const startOfNameOnly =
              buf.indexOf('// @suit-name-only-start\n') +
              '// @suit-name-only-start\n'.length;
            const endOfNameOnly = buf.indexOf(
              '// @suit-name-only-end',
              startOfNameOnly,
            );
            const nameOnlySlice = buf.slice(startOfNameOnly, endOfNameOnly);
            // If is a state field, and is in the name only section
            const prefix = removed.includes('initialState')
              ? cases.camel
              : 'submit';
            // If the propType is in the nameOnlySlice, change it
            if (
              nameOnlySlice.indexOf(`${prefix}${removedCases.pascal}` !== -1)
            ) {
              return (
                buf.slice(0, startOfNameOnly) +
                nameOnlySlice.replace(
                  new RegExp(`${prefix}${removedCases.pascal}`, 'g'),
                  `${prefix}${addedCases.pascal}`,
                ) +
                buf.slice(endOfNameOnly)
              );
            }
            return buf;
          }),
      ]),
    /** Writes any remaining propTypes between the // @suit-name-only tags */
    b => {
      const startIndex = b.indexOf('propTypes = {') + 'propTypes = {'.length;
      const endIndex = b.indexOf('\n};', startIndex);
      const propTypesSlice = b.slice(startIndex, endIndex);
      const propTypesToAdd = [
        ...Object.keys(initialState)
          .map(key => ({
            key,
            value: initialState[key],
          }))
          // If the user has already added it to prop types, don't double add it
          .filter(
            ({ key }) =>
              propTypesSlice.indexOf(`${cases.camel}${capitalize(key)}`) === -1,
          )
          .map(
            ({ value, key }) =>
              `  // ${cases.camel}${capitalize(
                key,
              )}: PropTypes.${propTypeFromTypeOf(typeof value)},`,
          ),
        // Adds functions from dispatchToProps
        ...Object.keys(actions)
          .filter(key => {
            /** If no prop filtering, give all props */
            if (!hasPropFiltering) return true;
            return actions[key].passAsProp;
          })
          // Filters out actions that have already been included
          .filter(
            key => propTypesSlice.indexOf(`submit${capitalize(key)}`) === -1,
          )
          .map(key => `  // submit${capitalize(key)}: PropTypes.func,`),
      ];
      const arrayOfLines = b.split('\n');
      const indexToInsert = arrayOfLines.findIndex(line =>
        line.includes('// @suit-name-only-start'),
      );
      return [
        ...arrayOfLines.filter((_, index) => index <= indexToInsert),
        ...propTypesToAdd,
        ...arrayOfLines.filter((_, index) => index > indexToInsert),
      ].join('\n');
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
