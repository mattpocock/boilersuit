const { expect } = require('chai');
const fs = require('fs');
const { ensureImport, transforms, fixInlineImports } = require('../utils');

const file = fs
  .readFileSync('./tools/tests/mocks/withInlineImports.js')
  .toString();

describe('ensureImport', () => {
  it('Must have certain methods', () => {
    const result = transforms(file, [
      fixInlineImports,
      ensureImport('property', './selectors', { destructure: true }),
      ensureImport('otherProperty', './actions', { destructure: true }),
    ]);
    const expected = `import {
  getAssessmentsStarted,
  applyFilter,
  getRoutesStarted,
  otherProperty, // @suit-line
} from './actions';

import {
  CHANGE_LOCALE,
} from './constants';

import CHANGE_LOCALE, {
  property,
} from './selectors';`
    expect(result).to.contain(expected);
  });
});
