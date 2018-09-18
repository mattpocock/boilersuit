const { indexesOf, transforms } = require('./utils');

module.exports = (toRemove, toAdd) => buffer =>
  transforms(buffer, [
    ...indexesOf('// @suit-name-only-start', buffer)
      .map(startIndex => ({
        startIndex,
        endIndex: buffer.indexOf('// @suit-name-only-end', startIndex),
      }))
      .map(sliceObject => ({
        ...sliceObject,
        slice: buffer.slice(sliceObject.startIndex, sliceObject.endIndex),
      }))
      .map(({ slice }) => buf =>
        buf.slice(0, buf.indexOf(slice)) +
        slice.replace(new RegExp(toRemove, 'g'), toAdd) +
        buf.slice(buf.indexOf(slice) + slice.length),
      ),
  ]);
