const { concat } = require('./utils');

module.exports = schema => {
  const errors = [];
  if (!Object.keys(schema).length) {
    errors.push(
      concat([
        'No domains defined within suit.json.',
        '| Try this:',
        '| {',
        '|   "getTweets": {}',
        '| }',
      ]),
    );
    return errors;
  }
  const domains = Object.keys(schema).map(key => ({
    name: key,
    ...schema[key],
  }));
  domains.forEach(domain => {
    if (!domain.initialState || !Object.keys(domain.initialState).length) {
      errors.push(
        concat([
          `No initialState defined on ${domain.name}`,
          `| Try this:`.green,
          `| {`,
          `|   "${domain.name}": {`,
          `|     "initialState": {`,
          `|       "isLoading": true`,
          `|     }`,
          `|   }`,
          `| }`,
        ]),
      );
    }
    if (!domain.actions || !Object.keys(domain.actions).length) {
      errors.push(
        concat([
          `No actions defined on ${domain.name}`,
          `| Try this:`.green,
          `| {`,
          `|   "${domain.name}": {`,
          `|     "actions": {`,
          `|       "${domain.name}FirstAction: {`,
          `|         "set": {`,
          `|           "isFirstAction": true`,
          `|         }`,
          `|       }`,
          `|     }`,
          `|   }`,
          `| }`,
        ]),
      );
    }
    if (errors.length) return;
    const arrayOfActions = Object.keys(domain.actions).map(key => ({
      name: key,
      ...domain.actions[key],
    }));

    arrayOfActions.forEach(action => {
      if (!action.set) {
        errors.push(
          concat([
            `${
              action.name
            } has no 'set' property defined. That means it won't do anything.`,
            `| Try this:`.green,
            `| ${action.name}: {`,
            `|   "set": {`,
            `|     "isFirstAction": true`,
            `|   }`,
            `| }`,
          ]),
        );
      } else {
        Object.keys(action.set).forEach(actionSetKey => {
          if (!Object.keys(domain.initialState).includes(actionSetKey)) {
            errors.push(
              concat([
                `${action.name}`.cyan +
                  ` is attempting to set ` +
                  `${actionSetKey}`.cyan +
                  `. Sadly, ` +
                  `${actionSetKey}`.cyan +
                  ` doesn't exist in ` +
                  `${domain.name}`.cyan +
                  `'s initial state.`,
                `- Did you forget to define it in the initialState?`,
                `- Did you do a typo?`,
                `- Don't worry - it hapens to the best of us.`,
              ]),
            );
          }
        });
      }
    });
  });
  return errors;
};
