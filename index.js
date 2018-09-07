#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const fromSchema = require('./commands/fromSchema');

program.version('0.1.1');

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

program.command('ajax').action(() => {
  console.log('The ajax command has been deprecated');
});

program.command('field').action(() => {
  console.log('The field command has been deprecated');
});

program.command('domain').action(() => {
  console.log('The domain command has been deprecated');
});

program.command('single').action(() => {
  console.log('The single command has been deprecated');
});

program.parse(process.argv);
