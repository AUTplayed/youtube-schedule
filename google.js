var google = require('googleapis');
var readline = require('readline');
var fs = require("fs");

module.exports = function (scope, callback) {
  var OAuth2 = google.auth.OAuth2;
  var oauth2Client = new OAuth2(
    process.env.CLIENTID,
    process.env.CLIENTSECRET,
    process.env.REDIRECTURL
  );

  fs.readFile(process.env.TOKENPATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, scope, function (oa2c) {
        google.options({
          auth: oa2c
        });
        callback(google);
      });
    } else {
      oauth2Client.credentials = JSON.parse(token);
      google.options({
        auth: oauth2Client
      });
      callback(google);
    }
  });
};

function getNewToken(oauth2Client, scope, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scope
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      fs.writeFile(process.env.TOKENPATH, JSON.stringify(token));
      oauth2Client.credentials = token;
      callback(oauth2Client);
    });
  });
}