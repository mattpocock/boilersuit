const Cases = function() {};

Cases.prototype.capitalize = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

Cases.prototype.camel = function(array) {
  return array
    .map((item, index) => {
      if (index === 0) {
        return item.toLowerCase();
      }
      return this.capitalize(item);
    })
    .join('');
};

Cases.prototype.constant = function(array) {
  return array.map(item => item.toUpperCase()).join('_');
};

Cases.prototype.display = function(array) {
  return array.map(item => this.capitalize(item)).join(' ');
};

Cases.prototype.pascal = function(array) {
  return array.map(item => this.capitalize(item)).join('');
}

Cases.prototype.all = function(array) {
  return {
    display: this.display(array),
    pascal: this.pascal(array),
    constant: this.constant(array),
    camel: this.camel(array),
  };
};

module.exports = Cases;
