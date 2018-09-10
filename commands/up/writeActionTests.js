const {
  transforms,
  prettify,
  concat,
  removeSuitDoubling,
  ensureImport,
} = require('../../tools/utils');

module.exports = ({ buffer, arrayOfActions }) =>
  transforms(buffer, [
    ...arrayOfActions.map(action => buf =>
      transforms(buf, [
        ensureImport(action.name, '../actions', { destructure: true }),
        ensureImport(action.cases.constant, '../constants', {
          destructure: true,
        }),
      ]),
    ),
    ...arrayOfActions.map(action => buf =>
      concat([
        buf,
        `// @suit-start`,
        `describe('${action.cases.camel}', () => {`,
        `  it('should have the correct type', () => {`,
        `    expect(${action.cases.camel}().type).toEqual(${action.cases.constant});`,
        `  });`,
        Object.values(action.set).filter(val => `${val}`.includes('payload'))
          .length > 0
          ? concat([
              `  it('should return the correct payload', () => {`,
              `    expect(${action.cases.camel}('dummyPayload').payload).toEqual('dummyPayload');`,
              `  });`,
            ])
          : null,
        `});`,
        `// @suit-end`,
        ``,
      ]),
    ),
    prettify,
    removeSuitDoubling,
  ]);
