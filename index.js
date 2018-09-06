#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const ajax = require('./commands/ajax');
const single = require('./commands/single');
const addDomain = require('./commands/domain/addDomain');
const addField = require('./commands/domain/addField');
const fromSchema = require('./commands/fromSchema');

program.version('0.1.0');

program
  .command('ajax <file> <name>')
  .alias('a')
  .action((folderName, name) => {
    ajax(name.split(' '), folderName);
  });

program
  .command('single <file> <name>')
  .alias('s')
  .action((folderName, name) => {
    single(name.split(' '), folderName);
  });

program
  .command('domain <file> <name>')
  .alias('d')
  .action((folderName, name) => {
    addDomain(name.split(' '), folderName);
  });

program
  .command('field <domain> <file> <name>')
  .alias('f')
  .action((domain, folderName, name) => {
    addField(name.split(' '), folderName, domain.split(' '));
  });

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
