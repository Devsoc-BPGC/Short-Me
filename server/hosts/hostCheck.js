const path = require('path');

// Read the hosts file and store it as a promise so we can be sure the file is read
const fileRead = require('fs').promises.readFile(path.resolve(__dirname, 'hosts.txt'), 'utf-8');

// Return false if URL is in hosts list
module.exports.checkSafeURL = async function (longURL) {
  const urlObj = new URL(longURL);
  const contents = await fileRead;
  return contents.indexOf(urlObj.hostname) >= 0 ? false : true;  
}
