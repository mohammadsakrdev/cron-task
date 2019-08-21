const cron = require('node-cron');
const path = require('path');
const { readdir, writeFile, rename, open, close } = require('fs');
const { promisify } = require('util');

const readDirectory = promisify(readdir);
const renameAsync = promisify(rename);

/**
 * Firing Corn job to move files from one folder to another one
 */
module.exports = () => {
  // schedule tasks to be run on the server
  cron.schedule('*/5 * * * * *', async () => {
    const current = new Date().toISOString();
    console.log(`Running a task every 5 seconds, time now ${current}`);
    // writeFile function with filename, content and callback function
    // writeFile(
    //   `old/${current}.txt`,
    //   `This file is created at ${current}`,
    //   err => {
    //     if (err) {
    //       console.error(err);
    //     }
    //     console.log(`File ${current} is created successfully.`);
    //   }
    // );
    const directoryPathToMoveFrom =
      process.env.DIRECTORY_TO_MOVE_FROM || path.join('old');
    const files = await readDirectory(directoryPathToMoveFrom);

    files.forEach(async file => {
      // check if file is open for editing by another process
      const moveFrom = path.join(directoryPathToMoveFrom, file);
      const moveTo = path.join(process.env.DIRECTORY_TO_MOVE_TO, file);
      open(moveFrom, 'r+', async (err, fileToMove) => {
        if (err && (err.code === 'EBUSY' || err.code === 'ENOENT')) {
          //do nothing till next loop
          console.log(`File ${file}  is ${err.code}`);
          return;
        } else {
          close(fileToMove, async () => {
            // remove function with old file, newFile and callback function
            await renameAsync(moveFrom, moveTo, err => {
              if (err) {
                console.error(err);
                return;
              }
              console.log(`File ${file} Moving complete!`);
            });
          });
        }
      });
    });
  });
};
