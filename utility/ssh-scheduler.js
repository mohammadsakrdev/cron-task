const cron = require('node-cron');
const path = require('path');
const { readdir, writeFile, rename, open, close } = require('fs');
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
module.exports = () => {
  // schedule tasks to be run on the server
  cron.schedule('*/5 * * * * *', async () => {
    const Client = require('ssh2').Client;
    const connSettings = {
      host: process.env.HOST_NAME,
      port: 22, // Normal is 22 port
      username: process.env.USER_NAME,
      password: process.env.PASSWORD
      // You can use a key file too, read the ssh2 documentation
    };
    const conn = new Client();
    conn
      .on('ready', function() {
        conn.sftp(function(err, sftp) {
          if (err) {
            console.error(err);
          }
          console.log('SSH is running');
        });
      })
      .connect(connSettings);
  });
};
