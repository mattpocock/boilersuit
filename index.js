#!/usr/bin/env node

const program = require('commander');
const ajax = require('./commands/ajax');
const single = require('./commands/single');
const addDomain = require('./commands/domain/addDomain');
const addField = require('./commands/domain/addField');

program.version('0.0.6');

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

program.parse(process.argv);
