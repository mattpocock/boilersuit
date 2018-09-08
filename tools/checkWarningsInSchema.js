const { concat } = require('./utils');

module.exports = schema => {
  const warnings = [];
  const domains = Object.keys(schema).map(key => ({
    name: key,
    ...schema[key],
  }));
  domains.forEach(domain => {
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
    const arrayOfActions = Object.keys(domain.actions).map(key => ({
      name: key,
      ...domain.actions[key],
    }));

    arrayOfActions.forEach(action => {
      const notUsingPassAsProp =
        arrayOfActions.filter(
          ({ passAsProp }) => typeof passAsProp !== 'undefined',
        ).length === 0;
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
    });
  });
  return warnings;
};
