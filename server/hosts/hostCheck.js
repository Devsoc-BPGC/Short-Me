const path = require('path');

// Read the hosts file and store it as a promise so we can be sure the file is read
const fileRead = require('fs').promises.readFile(path.resolve(__dirname, 'hosts.txt'), 'utf-8');

// Return false if URL is in hosts list and send response code accordingly
module.exports.isURLBlocked = async function (longURL, response) {
  const urlObj = new URL(longURL);
  const contents = await fileRead;
  if(contents.indexOf(urlObj.hostname) >= 0){
    response.status(400).json({"error": "This URL was blocked"});
    return true
  }
  return false;  
}
