const { expect } = require('chai');
const fs = require('fs');
const { indexesOf } = require('../utils');

const file = fs.readFileSync('./tools/tests/mocks/nameOnly.2.js').toString();

describe('indexesOf', () => {
  it('Must work', () => {
    expect(indexesOf('// @suit-name-only-start', file)[0]).to.equal(675);
  });
});
