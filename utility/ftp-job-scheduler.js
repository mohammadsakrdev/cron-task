const cron = require('node-cron');
const path = require('path');
const { readdir, writeFile, rename, open, close } = require('fs');
const { promisify } = require('util');

const readDirectory = promisify(readdir);
const chilkat = require('@chilkat/ck-node10-linux64');

/**
 * Firing Corn job to move files from one folder to another one
 *
 * @function
 *
 * @return {undefined}
 */
module.exports = () => {
  // schedule tasks to be run on the server
  cron.schedule('*/5 * * * * *', async () => {
    const current = new Date().toISOString().replace(':', '-');
    const directoryPathToMoveFrom = process.env.DIRECTORY_TO_MOVE_FROM;
    console.log(`Running a task every 5 seconds, time now ${current}`);
    // writeFile function with filename, content and callback function
    // writeFile(
    //   path.normalize(path.join(directoryPathToMoveFrom, `${current}.txt`)),
    //   `This file is created at ${current}`,
    //   err => {
    //     if (err) {
    //       console.error(err);
    //     } else {
    //       console.log(`File ${current} is created successfully.`);
    //     }
    //   }
    // );
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
            // This example requires the Chilkat API to have been previously unlocked.

            const ftp = new chilkat.Ftp2();

            ftp.Hostname = process.env.HOST_NAME;
            ftp.Username = process.env.USER_NAME;
            ftp.Password = process.env.PASSWORD;
            ftp.Port = 21;

            // Connect and login to the FTP server.
            let success = ftp.Connect();
            if (success !== true) {
              console.log(ftp.LastErrorText);
              return;
            }

            // Rename the remote file (or directory)
            success = ftp.RenameRemoteFile(moveFrom, moveTo);
            if (success !== true) {
              console.log(ftp.LastErrorText);
              return;
            }

            success = ftp.Disconnect();
          });
        }
      });
    });
  });
};
