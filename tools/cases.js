const Cases = function(array) {
  this.array = array;
};

Cases.prototype.capitalize = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

Cases.prototype.camel = function() {
  return this.array
    .map((item, index) => {
      if (index === 0) {
        return item.toLowerCase();
      }
      return this.capitalize(item);
    })
    .join('');
};

Cases.prototype.constant = function() {
  return this.array.map(item => item.toUpperCase()).join('_');
};

Cases.prototype.display = function() {
  return this.array.map(item => this.capitalize(item)).join(' ');
};

Cases.prototype.pascal = function() {
  return this.array.map(item => this.capitalize(item)).join('');
};

Cases.prototype.all = function() {
  return {
    display: this.display(this.array),
    pascal: this.pascal(this.array),
    constant: this.constant(this.array),
    camel: this.camel(this.array),
  };
};

module.exports = Cases;
