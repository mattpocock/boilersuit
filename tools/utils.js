const concat = array => array.join(`\n`);

const fixFolderName = string => {
  if (string.charAt(string.length - 1) !== '/') {
    return `${string}/`;
  }
  return string;
};

const transforms = (buffer, funcArray) => {
  let newBuffer = buffer;
  funcArray.forEach(func => {
    newBuffer = func(newBuffer);
  });
  return newBuffer;
};

const isCapital = string => string === string.toUpperCase();

const parseCamelCaseToArray = string =>
  string.replace(/[A-Z]/, letter => ` ${letter}`).split(' ');

module.exports = {
  concat,
  fixFolderName,
  transforms,
  isCapital,
  parseCamelCaseToArray,
};
