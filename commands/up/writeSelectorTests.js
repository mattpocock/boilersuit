const {
  transforms,
  prettify,
  concat,
  ensureImport,
  parseCamelCaseToArray,
  getDomainNameFromFolder,
  printObject,
  unCapitalize,
} = require('../../tools/utils');
const Cases = require('../../tools/cases');

module.exports = ({ buffer, cases, initialState, folder }) =>
  transforms(buffer, [
    ensureImport('fromJS', 'immutable', { destructure: true }),
    /** Creates a mocked-up version of the state for testing */
    b => {
      const toInsert = concat([
        `const mockedState = fromJS({`,
        `  ${unCapitalize(getDomainNameFromFolder(folder))}: {`,
      ]);
      if (b.indexOf(toInsert) === -1) {
        return concat([
          b,
          `// @suit-start`,
          toInsert,
          `  },`,
          `});`,
          `// @suit-end`,
        ]);
      }
      return b;
    },
    /** Fills in that mocked-up state */
    b => {
      const searchTerm = concat([
        `const mockedState = fromJS({`,
        `  ${unCapitalize(getDomainNameFromFolder(folder))}: {`,
      ]);
      const index = b.indexOf(searchTerm) + searchTerm.length;
      return concat([
        b.slice(0, index),
        `    ${cases.camel}: ${printObject(initialState, '    ')},` +
          b.slice(index),
      ]);
    },
    ensureImport(`makeSelect${cases.pascal}`, '../selectors', {
      destructure: true,
    }),
    b =>
      concat([
        b,
        `// @suit-start`,
        `describe('makeSelect${cases.pascal}', () => {`,
        `  it('should return the correct value', () => {`,
        `    const selector = makeSelect${cases.pascal}();`,
        `    expect(selector(mockedState))`,
        `      .toEqual(fromJS(mockedState.get('${unCapitalize(getDomainNameFromFolder(folder))}').get('${cases.camel}')));`,
        `  });`,
        `});`,
        `// @suit-end`,
      ]),
    ...Object.keys(initialState)
      .map(key => new Cases(parseCamelCaseToArray(key)).all())
      .map(fieldCases =>
        ensureImport(
          `makeSelect${cases.pascal}${fieldCases.pascal}`,
          '../selectors',
          { destructure: true },
        ),
      ),
    ...Object.keys(initialState)
      .map(key => ({
        key,
        value:
          /* eslint-disable no-nested-ternary */
          typeof initialState[key] === 'string'
            ? `'${initialState[key]}'`
            : typeof initialState[key] === 'object' && initialState[key] !== null
              ? `fromJS(${printObject(initialState[key], '      ')})`
              : initialState[key],
        cases: new Cases(parseCamelCaseToArray(key)).all(),
      }))
      .map(field => b =>
        concat([
          b,
          `// @suit-start`,
          `describe('makeSelect${cases.pascal}${field.cases.pascal}', () => {`,
          `  it('should return the correct value', () => {`,
          `    const selector = makeSelect${cases.pascal}${
            field.cases.pascal
          }();`,
          `    expect(selector(mockedState))`,
          `      .toEqual(${field.value});`,
          `  });`,
          `});`,
          `// @suit-end`,
          ``,
        ]),
      ),
    prettify,
  ]);
