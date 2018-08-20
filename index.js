#!/usr/bin/env node

const program = require('commander');
const ajax = require('./ajax');

program
  .version('0.0.5')
  .command('ajax <file> <name>')
  .action((folderName, name) => {
    ajax(name.split(' '), folderName);
  });

program.parse(process.argv);
