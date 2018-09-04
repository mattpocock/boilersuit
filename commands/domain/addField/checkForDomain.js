const Parser = require('../../../tools/parser');

const checkSelectors = (buf, { pascal }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  return parser.includes(
    `export const makeSelect${pascal} = () =>`,
  );
};

const checkReducer = (buf, { pascal, camel }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  return parser.includes(
    `export const ${camel}Reducer = (state = initial${pascal}State, { type }) => {`,
  );
};

module.exports = {
  checkSelectors,
  checkReducer,
};
