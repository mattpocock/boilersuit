const { transforms, concat } = require('../../../tools/utils');

module.exports = actions => buffer =>
  transforms(buffer, [
    ...Object.keys(actions)
      .map(key => ({ name: key, ...actions[key] }))
      .filter(({ customFunction }) => typeof customFunction !== 'undefined')
      .map(({ name, describe }) => b => {
        const index = b.indexOf(`const ${name}CustomFunction`);
        if (index !== -1) return b;
        return concat([
          b,
          describe ? `// ${describe}` : null,
          `const ${name}CustomFunction = (state) => state;`,
          ``,
        ]);
      }),
  ]);
