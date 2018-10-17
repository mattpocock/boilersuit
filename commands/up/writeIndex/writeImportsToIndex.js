const {
  concat,
  transforms,
  prettify,
  ensureImport,
  capitalize,
} = require('../../../tools/utils');

module.exports = ({ buffer, imports }) =>
  transforms(buffer, [
    b =>
      transforms(b, [
        ...imports.map(({ property, fileName }) =>
          ensureImport(property, fileName, {
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
          ...imports
            .filter(({ type }) => type === 'selector')
            .filter(
              ({ selector, value }) =>
                b.indexOf(`  ${value}: ${selector}(),`) === -1,
            )
            .map(({ selector, value }) =>
              concat([`  ${value}: ${selector}(),`]),
            ),
          '  // @suit-end',
          b.slice(index),
        ])
      );
    },
    b => b.replace('\t', ' '),
    /** Get actions into mapDispatchToProps */
    b => {
      const index =
        b.indexOf('return {\n', b.indexOf('mapDispatchToProps')) +
        'return {\n'.length;
      if (index === -1 + 'return {\n'.length) {
        return b;
      }
      return (
        b.slice(0, index) +
        concat([
          '    // @suit-start',
          ...imports
            .filter(({ type }) => type === 'action')
            .filter(
              ({ action }) =>
                b.indexOf(
                  `submit${capitalize(action)}: (`,
                  b.indexOf('mapDispatchToProps'),
                ) === -1,
            )
            .map(({ action, describe, payload }) =>
              concat([
                describe ? `    /** ${describe} */` : null,
                `    submit${capitalize(action)}: (${
                  payload ? 'payload' : ''
                }) => dispatch(${action}(${payload ? 'payload' : ''})),`,
              ]),
            ),
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
    /** Writes any remaining propTypes between the // @suit-name-only tags */
    b => {
      const startIndex = b.indexOf('propTypes = {') + 'propTypes = {'.length;
      const endIndex = b.indexOf('\n};', startIndex);
      const propTypesSlice = b.slice(startIndex, endIndex);
      const propTypesToAdd = [
        ...imports
          .filter(({ type }) => type === 'selector')
          .filter(
            ({ value }) => propTypesSlice.indexOf(`${value}: PropTypes`) === -1,
          )
          .map(
            ({ initialValue, value }) =>
              `  // ${value}: PropTypes.${propTypeFromTypeOf(
                typeof initialValue,
              )},`,
          ),
        ...imports
          .filter(({ type }) => type === 'action')
          .filter(
            ({ property }) =>
              propTypesSlice.indexOf(
                `submit${capitalize(property)}: PropTypes.func,`,
              ) === -1,
          )
          .map(
            ({ property }) =>
              `  // submit${capitalize(property)}: PropTypes.func,`,
          ),
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
