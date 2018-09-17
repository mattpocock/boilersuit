#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const up = require('./commands/up');
const ajax = require('./commands/ajax');
const rm = require('./commands/rm');

program.version('0.2.11');

program
  .command('up')
  .option('-f, --force', 'Force suit to re-render')
  .action(cmd => {
    gaze(['**/suit.json', '!node_modules/**/*'], (err, watcher) => {
      // Resets the console
      process.stdout.write('\x1Bc');
      const watchedFiles = Object.keys(watcher.relative()).length;
      console.log(
        `Watching ${watchedFiles} suit.json ${
          watchedFiles > 1 && watchedFiles !== 0 ? 'files' : 'file'
        }...`.yellow,
      );
      /** This does it the first time */
      Object.entries(watcher.relative()).forEach(entry => {
        // This bit of fidgeting allows for suiting up from the same folder
        const schemaFile = (entry[0] === '.' ? './' : entry[0]) + entry[1][0];
        up(schemaFile, { force: cmd.force });
      });

      let relativePaths = watcher.relative();

      /** Add new suit.json files to the watched files */
      watcher.on('added', () => {
        relativePaths = watcher.relative();
      });

      /** Then this watches further changes */
      watcher.on('changed', () => {
        // Resets the console
        process.stdout.write('\x1Bc');
        console.log(
          `Watching ${watchedFiles} suit.json ${
            watchedFiles > 1 && watchedFiles !== 0 ? 'files' : 'file'
          }...`.yellow,
        );
        // Gets the relative path
        /** This does it the first time */
        Object.entries(relativePaths).forEach(entry => {
          // This bit of fidgeting allows for suiting up from the same folder
          const schemaFile = (entry[0] === '.' ? './' : entry[0]) + entry[1][0];
          up(schemaFile, { quiet: true, force: cmd.force });
        });
      });
    });
  });

program.command('ajax <folder> <name>').action((folder, name) => {
  ajax(folder, name);
});

program.command('remove <folder>').action(folder => {
  rm(folder);
});

program.command('rm <folder>').action(folder => {
  rm(folder);
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
