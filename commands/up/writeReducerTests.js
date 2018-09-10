const {
  transforms,
  prettify,
  concat,
  printObject,
  ensureImport,
  parseCamelCaseToArray,
} = require('../../tools/utils');
const Cases = require('../../tools/cases');

module.exports = ({ buffer, cases, actions, initialState }) =>
  transforms(buffer, [
    ensureImport('fromJS', 'immutable', { destructure: true }),
    ensureImport(`${cases.camel}Reducer`, '../reducer', { destructure: true }),
    ...Object.keys(actions).map(actionName => buf => {
      const actionCases = new Cases(parseCamelCaseToArray(actionName)).all();
      return transforms(buf, [
        ensureImport(actionCases.camel, '../actions', {
          destructure: true,
        }),
      ]);
    }),
    b =>
      concat([
        b,
        `// @suit-start`,
        `describe('${cases.camel}Reducer', () => {`,
        `  it('returns the initial state', () => {`,
        `    expect(${cases.camel}Reducer(undefined, { type: '' }))`,
        `      .toEqual(fromJS(${printObject(initialState, '      ')}),`,
        `    );`,
        `  });`,
        /** Test each action in the reducer */
        ...Object.keys(actions)
          .map(key => ({ ...actions[key], name: key }))
          .map(action => {
            const arrayOfSets = Object.keys(action.set)
              .map(key => ({
                key,
                value: action.set[key],
                hasPayload: `${action.set[key]}`.includes('payload'),
              }))
              .map(set => ({
                ...set,
                value:
                  typeof set.value !== 'string' || set.hasPayload
                    ? set.value
                    : `'${set.value}'`,
              }));
            const payloadValues = arrayOfSets
              .filter(({ hasPayload }) => hasPayload)
              .map(({ value }) => value);
            // Checks if payload should be rendered as an object
            const payloadIsObject =
              payloadValues.length > 1 ||
              payloadValues.filter(val => val.includes('.')).length;
            return concat([
              `  describe('${action.name}', () => {`,
              `    it('alters the state as expected', () => {`,
              // if only passes one payload, only test one payload
              payloadValues.length === 1 && !payloadIsObject
                ? `      const payload = 'dummyPayload';`
                : null,
              // If multiple payloads, define payload as an object and define properties
              payloadIsObject ? `      const payload = {};` : null,
              payloadIsObject
                ? concat([
                    ...payloadValues.map(
                      value => `      ${value} = 'dummyPayload';`,
                    ),
                  ])
                : null,
              `      const newState = ${cases.camel}Reducer(`,
              `        undefined,`,
              // If it has a payload, pass it to the action creator
              `        ${action.name}(${
                payloadValues.length > 0 ? 'payload' : ''
              }),`,
              `      );`,
              ...arrayOfSets.map(({ key, value }) =>
                concat([
                  `      expect(newState.get('${key}')).toEqual(${value});`,
                ]),
              ),
              `    });`,
              `  });`,
            ]);
          }),
        `});`,
        `// @suit-end`,
        ``,
      ]),
    prettify,
  ]);
