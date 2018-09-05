#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const fs = require('fs');
const ajax = require('./commands/ajax');
const single = require('./commands/single');
const addDomain = require('./commands/domain/addDomain');
const addField = require('./commands/domain/addField');

program.version('0.0.7');

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
    Object.entries(watcher.watched()).forEach(entry => {
      const file = entry[1][0];
      fs.readFile(file, (_, buf) => {
        const schema = JSON.parse(buf.toString());
        console.log(file, schema);
      });
    });
    /** Then this watches further changes */
    watcher.on('changed', file => {
      console.log('changed!');
      // const folder = file.slice(0, -9);
      fs.readFile(file, (_, buf) => {
        const schema = JSON.parse(buf.toString());
        console.log(file, schema);
      });
    });
  });
});

program.parse(process.argv);
