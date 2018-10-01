const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { indexesOf } = require('../utils');

const file = fs
  .readFileSync(path.resolve('./tools/tests/mocks/nameOnly.2.js'))
  .toString();

describe('indexesOf', () => {
  it('Must work', () => {
    expect(indexesOf('// @suit-name-only-start', file)[0]).to.equal(675);
  });
});
