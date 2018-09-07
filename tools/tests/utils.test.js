const { expect } = require('chai');
const fs = require('fs');
const { fixInlineImports, concat } = require('../utils');

const file = fs.readFileSync('./tools/tests/mocks/withInlineImports.js').toString();

describe('fixInlineImports', () => {
  it('Must have certain methods', () => {
    console.log(fixInlineImports);
    console.log(fixInlineImports(file));
  });

  
});
