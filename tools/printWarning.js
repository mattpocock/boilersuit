module.exports = warnings => {
  if (!warnings.length) return;
  console.log(warnings);
  warnings.forEach(error => console.log('\nWARNING: '.yellow + error));
};
