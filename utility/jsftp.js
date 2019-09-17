const cron = require('node-cron');
const path = require('path');
const {
  readdir,
  writeFile,
  rename,
  open,
  close,
  createReadStream,
  createWriteStream,
  readFileSync
} = require('fs');
const { promisify } = require('util');
const jsftp = require('jsftp');

const readDirectory = promisify(readdir);

/**
 * Firing Corn job to move files from one folder to another one
 *
 * @function
 *
 * @return {undefined}
 */
module.exports = async () => {
  // schedule tasks to be run on the server
  // cron.schedule('*/5 * * * * *', async () => {
  const Ftp = new jsftp({
    host: process.env.HOST_NAME,
    port: 21,
    user: process.env.USER_NAME,
    pass: process.env.PASSWORD
  });
  Ftp.auth(process.env.USER_NAME, process.env.PASSWORD, async function(
    err,
    success
  ) {
    if (err) {
      console.error('Ftp Error');
    } else {
      console.log('Ftp login success');

      const directoryPathToMoveFrom = process.env.DIRECTORY_TO_MOVE_FROM;
      const current = new Date()
        .toISOString()
        .replace(':', '-')
        .replace('.', '-')
        .toString();
      console.log(`Running a task every 5 seconds, time now ${current}`);
      const buffer = readFileSync('./old/testsync.txt', { encoding: 'utf8' });
      console.log(buffer);
      Ftp.put('./old/testsync.txt', '/home/sk/ftp/upload/testsync.txt', err => {
        if (err) {
          // console.error(`File ${file} not moved, ${err}`);
          console.log('@put', { err });
        } else {
          // console.log(`${file} transferred successfully!`);
          console.log('File transferred');
        }
      });

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
      // const files = await readDirectory(directoryPathToMoveFrom);

      // files.forEach(async file => {
      //   console.log('@forEach');
      //   // check if file is open for editing by another process
      //   const moveFrom = path.normalize(
      //     path.join(directoryPathToMoveFrom, file)
      //   );
      //   const moveTo = path.normalize(
      //     path.join(process.env.DIRECTORY_TO_MOVE_TO, file)
      //   );
      //   open(moveFrom, 'r+', async (err, fileToMove) => {
      //     console.log('@open', { err });
      //     if (err && (err.code === 'EBUSY' || err.code === 'ENOENT')) {
      //       //do nothing till next loop
      //       console.log(`File ${file}  is EBUSY or ENOENT`);
      //       return;
      //     } else {
      //       close(fileToMove, async error => {
      //         console.log('@close', { error });
      //         Ftp.put('./' + moveFrom, moveTo, err => {
      //           console.log('@put', { err });

      //           if (err) {
      //             console.error(`File ${file} not moved, ${err}`);
      //           } else {
      //             console.log(`${file} transferred successfully!`);
      //           }
      //         });
      //       });
      //     }
      //   });
      // });
      // });
    }
  });
};
