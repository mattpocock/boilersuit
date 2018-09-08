module.exports = warnings => {
  warnings.forEach(error => console.log('\nWARNING: '.yellow + error));
};
