#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const fromSchema = require('./commands/fromSchema');

program.version('0.1.0');

program.command('up').action(() => {
  console.log('Watching all suit.json files...'.yellow);
  gaze('**/suit.json', (err, watcher) => {
    /** This does it the first time */
    Object.entries(watcher.relative()).forEach(entry => {
      const schemaFile = entry[0] + entry[1][0];
      fromSchema(schemaFile);
    });

    /** Then this watches further changes */
    watcher.on('changed', schemaFile => {
      console.log('File changed, making changes...'.yellow);
      fromSchema(schemaFile);
    });
  });
});

program.parse(process.argv);
