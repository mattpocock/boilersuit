const concat = array => array.join(`\n`);

const fixFolderName = string => {
  if (string.charAt(string.length - 1) !== '/') {
    return string + '/';
  }
  return string;
}

module.exports = {
  concat,
  fixFolderName,
};
