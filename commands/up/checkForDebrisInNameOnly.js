const { indexesOf } = require('../../tools/utils');

/** Check if any debris in buffer */

module.exports = ({ buffer, searchTerms = [], domains, trimFunction }) =>
  indexesOf('// @suit-name-only-start', buffer)
    .map(startIndex => ({
      startIndex,
      endIndex: buffer.indexOf('// @suit-name-only-end', startIndex),
    }))
    .map(sliceObject => ({
      ...sliceObject,
      slice: buffer.slice(sliceObject.startIndex, sliceObject.endIndex),
    }))
    .map(({ slice }) => {
      const lines = slice.split('\n');
      const arrayOfDomainNames = domains.map(({ domainName }) => domainName);
      /** Returns only the reducers that are in the  */
      const reducers = lines.filter(
        line =>
          searchTerms.every(term => line.includes(term)) &&
          arrayOfDomainNames.filter(name => line.includes(name)).length === 0,
      );
      return reducers.map(trimFunction);
    })
    // Weeds out any empty errors
    .filter(input => input.length > 0);
