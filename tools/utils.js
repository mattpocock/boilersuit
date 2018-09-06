const concat = array => array.join(`\n`);

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

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
  string.replace(/([A-Z])/g, letter => ` ${letter}`).split(' ');

const printObject = object => {
  const newObject = JSON.stringify(object, null, 2)
    .replace(/"(\w+)"\s*:/g, '$1:')
    .replace(/"/g, "'");
  return newObject.slice(0, -2) + ',' + newObject.slice(-2);
};

const cleanFile = buffer => {
  let newBuffer = buffer;
  while (newBuffer.indexOf('// @suit-start') !== -1) {
    const startIndex =
      newBuffer.lastIndexOf('\n', newBuffer.indexOf('// @suit-start')) + 1;
    const endIndex =
      newBuffer.indexOf('// @suit-end', startIndex) + '// @ suit-end'.length;
    newBuffer = newBuffer.slice(0, startIndex) + newBuffer.slice(endIndex);
  }
  newBuffer = newBuffer
    .split('\n')
    .filter(line => !line.includes('@suit-line'))
    .join('\n');

  return newBuffer;
};

const ensureImport = (
  property,
  fileName,
  { destructure = false },
) => buffer => {
  /** Checks if already loaded */
  const isImported =
    buffer.slice(0, buffer.lastIndexOf(' from ')).indexOf(`${property}`) !== -1;
  if (isImported) {
    return buffer;
  }

  const hasImportsFromFileName = buffer.indexOf(fileName) !== -1;

  /** If no imports from fileName, add it and the filename */
  if (!hasImportsFromFileName) {
    const firstImportLineIndex = buffer.indexOf('import');
    return concat([
      buffer.slice(0, firstImportLineIndex),
      `import ${
        destructure ? `{ ${property} }` : property
      } from '${fileName}'; // @suit-line`,
      buffer.slice(firstImportLineIndex),
    ]);
  }
  /**
   * Now we know that we have imports from the filename,
   * it's just whether it's destructured or not
   */
  if (destructure) {
    const isOnNewLine =
      buffer.split('\n').findIndex(line => line === `} from '${fileName}';`) !==
      -1;
    if (isOnNewLine) {
      const index = buffer.indexOf(`\n} from '${fileName}';`);
      return (
        buffer.slice(0, index) +
        `\n  ${property}, // @suit-line` +
        buffer.slice(index)
      );
    }
    const index = buffer.indexOf(` } from '${fileName};`);
    return buffer.slice(0, index) + `,\n  ${property}, // @suit-line\n`;
  }

  /**
   * I don't think there's a case for handling
   * multiple default inputs from the same filename,
   * so I'm not writing it.
   */

  return buffer;
};

const removeWhiteSpace = buffer => {
  const lines = buffer.split('\n');
  return lines
    .filter((thisLine, index) => !(thisLine === '' && lines[index + 1] === ''))
    .join('\n');
};

const removeSuitDoubling = buffer =>
  buffer
    .replace(concat([`// @suit-end`, ``, `// @suit-start`]), '')
    .replace(concat([`// @suit-end`, `// @suit-start`]), '')
    .replace(concat([`    // @suit-end`, `    // @suit-start`, '']), '')
    .replace(concat([`  // @suit-end`, `  // @suit-start`, '']), '');

const prettify = buffer =>
  transforms(buffer, [removeWhiteSpace, removeSuitDoubling, removeWhiteSpace]);

module.exports = {
  concat,
  fixFolderName,
  transforms,
  isCapital,
  parseCamelCaseToArray,
  printObject,
  cleanFile,
  ensureImport,
  removeWhiteSpace,
  removeSuitDoubling,
  prettify,
  capitalize,
};
