// const { expect } = require('chai');
// const Parser = require('../parser');

// describe('Parser', () => {
//   const parser = new Parser();
//   it('Should have certain methods', () => {
//     expect(typeof parser.lastImportIndex).to.equal('function');
//     expect(typeof parser.getImportIndex).to.equal('function');
//   });

//   describe('lastImportIndex', () => {
//     let parser = new Parser('import');
//     expect(parser.lastImportIndex().index).to.equal(0);
//     expect(parser.lastImportIndex().suffix).to.equal('\n');
//     parser = new Parser('  import');
//     expect(parser.lastImportIndex().index).to.equal(2);
//   });

//   describe('getImportIndex', () => {
//     const parser = new Parser(`\n} from './actions';`);
//     expect(parser.getImportIndex('./actions').index).to.equal(0);
//   });
// });
