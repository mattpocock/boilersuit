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
    const isInline = buffer.indexOf(` } from '${fileName}';`) !== -1;
    if (isInline) {
      const index = buffer.indexOf(` } from '${fileName}';`);
      return (
        buffer.slice(0, index) +
        `,\n  ${property}, // @suit-line\n` +
        buffer.slice(index)
      );
    }
    const index = buffer.indexOf(` from '${fileName}';`);
    return buffer.slice(0, index) + concat([
      `, {`,
      `  ${property},`,
      `}`,
    ]) + buffer.slice(index);
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

const checkErrorsInSchema = schema => {
  const errors = [];
  if (!Object.keys(schema).length) {
    errors.push(
      concat([
        'No domains defined within suit.json.',
        'Try this:',
        '{',
        '  "getTweets": {}',
        '}',
      ]),
    );
    return errors;
  }
  const domains = Object.keys(schema).map(key => ({
    name: key,
    ...schema[key],
  }));
  domains.forEach(domain => {
    if (!domain.actions || !Object.keys(domain.actions).length) {
      errors.push(
        concat([
          `No actions defined on ${domain.name}`,
          `Try this:`.green,
          `{`,
          `  "${domain.name}": {`,
          `    "actions": {`,
          `      "${domain.name}FirstAction: {`,
          `        "set": {`,
          `          "isFirstAction": true`,
          `        }`,
          `      }`,
          `    }`,
          `  }`,
          `}`,
        ]),
      );
    }
    if (!domain.initialState || !Object.keys(domain.initialState).length) {
      errors.push(
        concat([
          `No initialState defined on ${domain.name}`,
          `Try this:`.green,
          `{`,
          `  "${domain.name}": {`,
          `    "initialState": {`,
          `      "isLoading": true`,
          `    }`,
          `  }`,
          `}`,
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
            `Try this:`.green,
            `${action.name}: {`,
            `  "set": {`,
            `    "isFirstAction": true`,
            `  }`,
            `}`,
          ]),
        );
      }
    });
  });
  return errors;
};

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
  checkErrorsInSchema,
  fixInlineImports,
  actionHasPayload,
};
