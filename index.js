#!/usr/bin/env node

const program = require('commander');
const ajax = require('./commands/ajax');
const single = require('./commands/single');
const addDomain = require('./commands/domain/addDomain');

program.version('0.0.6');

program.command('ajax <file> <name>').action((folderName, name) => {
  ajax(name.split(' '), folderName);
});

program.command('single <file> <name>').action((folderName, name) => {
  single(name.split(' '), folderName);
});

program.command('domain <file> <name>').action((folderName, name) => {
  addDomain(name.split(' '), folderName);
});

program.parse(process.argv);
