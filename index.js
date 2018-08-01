#!/usr/bin/env node

const program = require('commander');
const writeToFile = require('./writeToFile');

program
  .version('0.0.1')
  .command('create <file> <name>')
  .action((folderName, name) => {
    writeToFile(name.split(' '), folderName);
  });

program.parse(process.argv);
