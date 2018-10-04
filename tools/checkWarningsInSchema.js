const { concat } = require('./utils');
const reservedKeywords = require('./constants/reservedKeywords');

module.exports = (schema, config) => {
  const warnings = [];
  const domains = Object.keys(schema)
    .filter(domain => !reservedKeywords.includes(domain))
    .map(key => ({
      name: key,
      ...schema[key],
    }));

  domains.forEach(domain => {
    if (
      typeof config.showDescribeWarnings !== 'undefined' &&
      config.showDescribeWarnings
    ) {
      if (!domain.describe) {
        warnings.push(
          concat([
            `No "describe" key defined on ${
              domain.name
            }. Write a description so we know what's going on.`,
            `| {`,
            `|   "${domain.name}": {`,
            `|     "describe": "What do I do? Why do I exist?"`,
            `|   }`,
            `| }`,
          ]),
        );
      }
    }
    const arrayOfActions = Object.keys(domain.actions).map(key => ({
      name: key,
      ...domain.actions[key],
    }));

    arrayOfActions.forEach(action => {
      const notUsingPassAsProp =
        arrayOfActions.filter(
          ({ passAsProp }) => typeof passAsProp !== 'undefined',
        ).length === 0;
      if (
        typeof config.showDescribeWarnings !== 'undefined' &&
        config.showDescribeWarnings
      ) {
        if (!action.describe && (action.passAsProp || notUsingPassAsProp)) {
          warnings.push(
            concat([
              `No "describe" key defined on ${
                action.name
              }. Write a description so we know what the action does.`,
              `| {`,
              `|   "${domain.name}": {`,
              `|     "actions": {`,
              `|       "${action.name}": {`,
              `|         "describe": "What do I do? What payload do I pass? Why do I exist?"`,
              `|       }`,
              `|     }`,
              `|   }`,
              `| }`,
            ]),
          );
        }
      }
    });

    const arrayOfPropertiesSet = Object.keys(
      arrayOfActions
        .map(({ set }) => set)
        .reduce((a, b) => ({ ...a, ...b }), {}),
    );
    Object.keys(domain.initialState).forEach(field => {
      if (!arrayOfPropertiesSet.includes(field)) {
        warnings.push(
          concat([
            `Unused piece of state in ` +
              `${domain.name}`.cyan +
              `:` +
              ` ${field}`.cyan +
              ` is never changed by any action.`,
            `- Use it or lose it, buddy.`,
          ]),
        );
      }
    });
  });
  return warnings;
};
