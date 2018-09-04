const Parser = require('../../../tools/parser');

module.exports = (buf, { camel }, { pascal: domainPascal }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  parser.toNext(`const initial${domainPascal}State = fromJS`);
  const { index } = parser.toNext(`});`);

  return buffer.slice(0, index) + `  ${camel}: null,\n` + buffer.slice(index);
};
