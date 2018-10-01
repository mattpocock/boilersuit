const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const replaceInNameOnly = require('../replaceInNameOnly');

const file = fs
  .readFileSync(path.resolve('./tools/tests/mocks/nameOnly.js'))
  .toString();
const correctFile = fs
  .readFileSync(path.resolve('./tools/tests/mocks/nameOnlyCorrect.js'))
  .toString();

const file2 = fs
  .readFileSync(path.resolve('./tools/tests/mocks/nameOnly.2.js'))
  .toString();
const correctFile2 = fs
  .readFileSync(path.resolve('./tools/tests/mocks/nameOnly.2.correct.js'))
  .toString();

describe('fixInlineImports', () => {
  it('Must work in a couple of cases', () => {
    expect(replaceInNameOnly('somethingToChange', 'megaMan')(file)).to.equal(
      correctFile,
    );
    expect(
      replaceInNameOnly('somethingFailed', 'somethingAmazing')(file2),
    ).to.equal(correctFile2);
  });
});
