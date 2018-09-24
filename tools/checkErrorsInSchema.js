const { concat } = require('./utils');
const rm = require('../commands/rm');

module.exports = (schema, folder) => {
  const errors = [];
  const domainKeys = Object.keys(schema).filter(
    domain => !['compose'].includes(domain),
  );
  if (!domainKeys.length) {
    errors.push(
      concat([
        'No domains defined within suit.json.',
        '| Try this:',
        '| {',
        '|   "getTweets": {}',
        '| }',
      ]),
    );
    rm(folder, { silent: true });
    return errors;
  }
  const domains = domainKeys.map(key => ({
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
      if (
        (!action.set || !Object.keys(action.set).length) &&
        !action.customFunction
      ) {
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
      }
      if (action.set) {
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
      if (action.saga && (action.saga.onFail && action.saga.onSuccess)) {
        if (!actionExists(action.saga.onFail, domain)) {
          errors.push(
            concat([
              `The saga in ` +
                `${action.name}`.cyan +
                ` is referencing an action, ` +
                `${action.saga.onFail}`.cyan +
                `, does not exist.`,
              `- Your choices are:`,
              ...arrayOfActions.map(({ name }) => `- ${name}`),
            ]),
          );
        }
        if (!actionExists(action.saga.onSuccess, domain)) {
          errors.push(
            concat([
              `The saga in ` +
                `${action.name}`.cyan +
                ` is referencing an action, ` +
                `${action.saga.onSuccess}`.cyan +
                `, does not exist.`,
              `- Your choices are:`,
              ...arrayOfActions.map(({ name }) => `- ${name}`),
            ]),
          );
        }
      }
    });
  });
  return errors;
};

const actionExists = (action, domain) =>
  typeof domain.actions[action] !== 'undefined';
