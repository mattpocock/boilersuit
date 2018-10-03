#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const fs = require('fs');
const path = require('path');
const up = require('./commands/up');
const ajax = require('./commands/ajax');
const rm = require('./commands/rm');

program.version('0.3.6');

program
  .command('up')
  .option('-f, --force', 'Force suit to re-render')
  .action(cmd => {
    let watchedDirectories = ['!node_modules/**/*'];
    if (fs.existsSync(path.resolve('./.suitrc'))) {
      const config = JSON.parse(
        fs.readFileSync(path.resolve('./.suitrc')).toString(),
      );
      if (config.include && config.include.length) {
        watchedDirectories = [
          ...watchedDirectories,
          config.include.map(suitPath =>
            path.resolve(`${suitPath}/**/suit.json`),
          ),
        ];
      } else {
        watchedDirectories.push(['app/containers/**/suit.json']);
      }
    } else {
      watchedDirectories.push(['app/containers/**/suit.json']);
    }
    gaze(watchedDirectories, (err, watcher) => {
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
        up(schemaFile, { force: cmd.force }, watcher);
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
          up(schemaFile, { quiet: true, force: cmd.force }, watcher);
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
