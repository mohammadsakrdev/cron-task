const cron = require('node-cron');
const path = require('path');
const { readdir, writeFile, rename, open, close } = require('fs');
const { promisify } = require('util');

const readDirectory = promisify(readdir);
// const chilkat = require('@chilkat/ck-node11-linux64');
const chilkat = require('@chilkat/ck-node11-win64');

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
    const current = new Date().toISOString();
    console.log(`Running a task every 5 seconds, time now ${current}`);
    // writeFile function with filename, content and callback function
    writeFile(
      `old/${current}.txt`,
      `This file is created at ${current}`,
      err => {
        if (err) {
          console.error(err);
        }
        console.log(`File ${current} is created successfully.`);
      }
    );
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
            // This example requires the Chilkat API to have been previously unlocked.

            const sftp = new chilkat.SFtp();

            let success = sftp.Connect('54.93.69.181', 22);
            if (success == true) {
              success = sftp.AuthenticatePw('root', 'cl0ud24418WED');
            }

            if (success == true) {
              success = sftp.InitializeSftp();
            }

            if (success !== true) {
              console.log(sftp.LastErrorText);
              return;
            }

            // Synchronize (by uploading) the local directory tree rooted at "qa_data/sftpUploadTree"
            // with the remote directory tree rooted at "syncUploadTest"
            // Both directories are relative paths.  The remote directory
            // is relative to the HOME directory of the SSH user account.
            // The local directory is relative to the current working directory of the process.
            // It is also possible to use absolute paths.

            const remoteDir = moveFrom;
            const localDir = moveTo;

            // Possible modes that can be passed to the SyncTreeUpload method are:
            // mode=0: Upload all files
            // mode=1: Upload all files that do not exist on the server.
            // mode=2: Upload newer or non-existant files.
            // mode=3: Upload only newer files. If a file does not already exist on the server, it is not uploaded.
            // mode=4: transfer missing files or files with size differences.
            // mode=5: same as mode 4, but also newer files.

            // This example will use mode 5 to upload missing, newer, or files with size differences.
            const mode = 5;

            // This example turns on recursion to synchronize the entire tree.
            // Recursion can be turned off to synchronize the files of a single directory.
            const recursive = true;
            // success = sftp.SyncTreeUpload(localDir, remoteDir, mode, recursive);
            success = sftp.SyncTreeUpload(
              localDir,
              '/home/lyticshub/Field_Logs/Test',
              mode,
              recursive
            );
            if (success !== true) {
              console.log(sftp.LastErrorText);
              return;
            }

            console.log('Success.');
          });
        }
      });
    });
  });
};
