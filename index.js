#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const up = require('./commands/up');
const ajax = require('./commands/ajax');

program.version('0.1.13');

program.command('up').action(() => {
  gaze('**/suit.json', (err, watcher) => {
    // Resets the console
    process.stdout.write('\x1Bc');
    const watchedFiles = Object.keys(watcher.relative()).length;
    console.log(
      `Watching ${watchedFiles} suit.json ${
        watchedFiles > 1 ? 'files' : 'file'
      }...`.yellow,
    );
    /** This does it the first time */
    Object.entries(watcher.relative()).forEach(entry => {
      // This bit of fidgeting allows for suiting up from the same folder
      const schemaFile = (entry[0] === '.' ? './' : entry[0]) + entry[1][0];
      up(schemaFile);
    });

    const relativePaths = watcher.relative();

    /** Then this watches further changes */
    watcher.on('changed', schemaFile => {
      // Resets the console
      process.stdout.write('\x1Bc');
      const relativePath = Object.keys(relativePaths).filter(path =>
        schemaFile.includes(path),
      )[0];

      up((relativePath === '.' ? './' : relativePath) + 'suit.json');
    });
  });
});

program.command('ajax <folder> <name>').action((folder, name) => {
  ajax(folder, name);
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
