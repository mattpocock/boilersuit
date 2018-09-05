#!/usr/bin/env node

const program = require('commander');
// const glob = require('glob');
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

/** Use this: https://github.com/shama/gaze */
program.command('up').action(() => {
  // const files = glob.sync('**/suit.json');
  // files
  //   .map(path => ({ folder: `./${path.slice(0, -9)}`, file: `./${path}` }))
  //   .forEach(({ file, folder }) => {

  //   });
  fs.watch('**/suit.json', (one, two) => {
    console.log(one, two);
    // fs.readFile(file, (err, buf) => {
    //   const schema = JSON.parse(buf.toString());
    //   console.log(file, schema);
    // });
  });
});

program.parse(process.argv);
