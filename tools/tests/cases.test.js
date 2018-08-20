const { expect } = require('chai');
const Cases = require('../cases');

const cases = new Cases();

describe('Cases', () => {
  it('Must have certain methods', () => {
    expect(typeof cases.capitalize).to.equal('function');
    expect(typeof cases.camel).to.equal('function');
    expect(typeof cases.pascal).to.equal('function');
    expect(typeof cases.constant).to.equal('function');
    expect(typeof cases.display).to.equal('function');
    expect(typeof cases.all).to.equal('function');
  });

  describe('Capitalize', () => {
    it('Should capitalize something', () => {
      expect(cases.capitalize('poo')).to.equal('Poo');
    });
  });

  describe('Camel', () => {
    it('Should put something in camel case', () => {
      expect(cases.camel(['Hello', 'World'])).to.equal('helloWorld');
    });
  });

  describe('Constant', () => {
    it('Should put something in constant case', () => {
      expect(cases.constant(['Hello', 'World'])).to.equal('HELLO_WORLD');
    });
  });

  describe('display', () => {
    it('Should put something in display case', () => {
      expect(cases.display(['hello', 'world'])).to.equal('Hello World');
    });
  });

  describe('all', () => {
    it('Should return an object containing all cases', () => {
      const { display, camel, constant, pascal } = cases.all([
        'Hello',
        'World',
      ]);
      expect(display).to.equal('Hello World');
      expect(camel).to.equal('helloWorld');
      expect(constant).to.equal('HELLO_WORLD');
      expect(pascal).to.equal('HelloWorld');
    });
  });
});
