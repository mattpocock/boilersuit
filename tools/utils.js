const concat = array => array.filter(line => line !== null).join(`\n`);

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const unCapitalize = string => string.charAt(0).toLowerCase() + string.slice(1);

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

const printObject = (object, indent = '') => {
  const newObject = JSON.stringify(object, null, 2)
    .replace(/"(\w+)"\s*:/g, '$1:')
    .replace(/"/g, "'")
    .split('\n')
    .map(line => {
      const lastChar = line[line.length - 1];
      return line.length === 1 ||
        line.length === 2 ||
        lastChar === '{' ||
        lastChar === ','
        ? line
        : `${line},`;
    })
    .map((line, index) => (index === 0 ? `${line}` : `${indent}${line}`))
    .join(`\n`);
  return newObject.slice(0, -2) + newObject.slice(-2);
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

const ensureImport = (property, fileName, { destructure = false }) => b =>
  transforms(b, [
    buffer => {
      /** Checks if already loaded */
      const isImported =
        buffer.slice(0, buffer.lastIndexOf(' from ')).indexOf(`${property}`) !==
        -1;
      if (isImported) {
        return buffer;
      }

      const hasImportsFromFileName = buffer.indexOf(fileName) !== -1;

      /** If no imports from fileName, add it and the filename */
      if (!hasImportsFromFileName) {
        /** We need to know if there are any imports. If not, add it to the top of the file */
        const hasPrevImports = buffer.indexOf('import') !== -1;
        let index = 0;
        if (hasPrevImports) {
          index = buffer.lastIndexOf('import');
        }
        if (destructure) {
          return (
            buffer.slice(0, index) +
            concat([
              `import {`,
              `  ${property}, // @suit-line`,
              `} from '${fileName}';`,
              buffer.slice(index),
            ])
          );
        }
        return concat([
          buffer.slice(0, index),
          `import ${property} from '${fileName}'; // @suit-line`,
          buffer.slice(index),
        ]);
      }
      /**
       * Now we know that we have imports from the filename,
       * it's just whether it's destructured or not
       */
      if (destructure) {
        const isOnNewLine =
          buffer
            .split('\n')
            .findIndex(line => line === `} from '${fileName}';`) !== -1;
        if (isOnNewLine) {
          const index = buffer.indexOf(`\n} from '${fileName}';`);
          return (
            buffer.slice(0, index) +
            `\n  ${property}, // @suit-line` +
            buffer.slice(index)
          );
        }
        const index = buffer.indexOf(` from '${fileName}';`);
        return (
          buffer.slice(0, index) +
          concat([`, {`, `  ${property}, // @suit-line`, `}`]) +
          buffer.slice(index)
        );
      }

      /**
       * I don't think there's a case for handling
       * multiple default inputs from the same filename,
       * so I'm not writing it.
       */
      return buffer;
    },
    correctCommentedOutImport(fileName),
  ]);

const removeWhiteSpace = buffer => {
  const lines = buffer.split('\n');
  return lines
    .filter((thisLine, index) => !(thisLine === '' && lines[index + 1] === ''))
    .join('\n');
};

/**
 * If an import required by boilersuit has been commented out,
 * this corrects it
 */
const correctCommentedOutImport = fileName => buffer =>
  transforms(buffer, [
    b => {
      const index = buffer
        .slice(0, buffer.indexOf(`'${fileName}'`))
        .lastIndexOf('import');
      if (buffer.slice(index - 3, index - 1) === '//') {
        return b.slice(0, index - 3) + b.slice(index);
      }
      return b;
    },
  ]);

const removeSuitDoubling = buffer =>
  buffer
    .replace(new RegExp(concat([`// @suit-end`, `// @suit-start`]), 'g'), '')
    .replace(
      new RegExp(
        concat([`// @suit-name-only-end`, `// @suit-name-only-start`]),
        'g',
      ),
      '',
    )
    .replace(
      new RegExp(
        concat([`  // @suit-name-only-start`, `  // @suit-name-only-end`]),
        'g',
      ),
      '',
    )
    .replace(
      new RegExp(
        concat([`// @suit-name-only-end`, ``, `// @suit-name-only-start`]),
        'g',
      ),
      '',
    )
    .replace(
      new RegExp(concat([`// @suit-end`, ``, `// @suit-start`]), 'g'),
      '',
    )
    .replace(
      new RegExp(concat([`// @suit-end`, ``, ``, `// @suit-start`]), 'g'),
      '',
    )
    .replace(
      new RegExp(concat([`// @suit-end`, ``, ``, ``, `// @suit-start`]), 'g'),
      '',
    )
    .replace(
      new RegExp(concat([`    // @suit-end`, `    // @suit-start`, '']), 'g'),
      '',
    )
    .replace(
      new RegExp(concat([`  // @suit-end`, `  // @suit-start`, '']), 'g'),
      '',
    );

const correctInlineImports = buffer =>
  transforms(buffer, [
    ...eachIndexOf(buffer, 'import {')
      .map(startIndex => {
        const endIndex = buffer.indexOf(';', startIndex) + 1;
        return {
          length: endIndex - startIndex,
          content: buffer.slice(startIndex + 'import {'.length, endIndex),
        };
      })
      .filter(({ length }) => length <= 80)
      .filter(({ content }) => !content.includes('@suit'))
      .map(({ content }) => b =>
        b.slice(0, b.indexOf(content)) +
        content
          .replace(/\n/g, '')
          .replace(/ {2}/g, ' ')
          .replace(/,(?=})/, ' ') +
        b.slice(b.indexOf(content) + content.length),
      ),
  ]);

const eachIndexOf = (buffer, string) => {
  let count = 0;
  const indexArray = [];
  while (buffer.indexOf(string, count) !== -1) {
    const index = buffer.indexOf(string, count);
    count = index + 1;
    indexArray.push(index);
  }
  return indexArray;
};

const prettify = buffer =>
  transforms(buffer, [
    removeWhiteSpace,
    removeSuitDoubling,
    removeWhiteSpace,
    correctInlineImports,
  ]);

const fixInlineImports = buffer => {
  let newBuffer = buffer;
  while (newBuffer.indexOf('import { ') !== -1) {
    const startIndex = newBuffer.indexOf('import { ') + 'import {'.length;
    const endIndex = newBuffer.indexOf('} from', startIndex);
    const content = newBuffer
      .slice(startIndex, endIndex)
      .replace(/ /g, '')
      .split(',')
      .map(line => `  ${line.replace('\n', '').replace(',', '')},`)
      .join('\n');
    newBuffer = concat([
      newBuffer.slice(0, startIndex),
      content,
      newBuffer.slice(endIndex),
    ]);
  }
  return newBuffer;
};

const actionHasPayload = actions =>
  Object.values(actions).filter(({ set }) => {
    if (!set) return false;
    return (
      Object.values(set).filter(val => `${val}`.includes('payload')).length > 0
    );
  }).length > 0;

const getDomainNameFromFolder = folder =>
  folder
    .split('/')
    .reverse()
    .filter(x => x !== '')[0];

const indexesOf = (needle, haystack, modifier = 0) => {
  const instances = haystack.match(new RegExp(needle, 'g'));
  if (instances === null) return [];
  let lastIndex = 0;
  return instances.map(() => {
    const index = haystack.indexOf(needle, lastIndex) + modifier;
    lastIndex = index + 1;
    return index;
  });
};

module.exports = {
  concat,
  indexesOf,
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
  fixInlineImports,
  actionHasPayload,
  eachIndexOf,
  getDomainNameFromFolder,
  unCapitalize,
};
