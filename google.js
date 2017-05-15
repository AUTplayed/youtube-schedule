var google = require('googleapis');
var fs = require("fs");
var pj = require('path').join;

module.exports.initUrl = initUrl;
module.exports.saveToken = saveToken;
module.exports.getSavedClient = getSavedClient;

var client = {};

function initUrl(scope, clientid, clientsecret, hostname) {
  var oauth2Client = getOA2C(scope, clientid, clientsecret, hostname);
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scope
  });
  client.oauth2Client = oauth2Client;
  client.scope = scope;
  return authUrl;
}

function saveToken(code, callback) {
  console.log("code recieved");
  client.oauth2Client.getToken(code, function (err, token) {
    if (err) {
      callback(err);
      return;
    }
    console.log("authorized");
    client.oauth2Client.setCredentials(token);
    fs.writeFile(pj(__dirname, ".token"), JSON.stringify(client), function (err) {
      if (err) {
        callback(err);
        return;
      }
      console.log("credentials saved");
      callback("authorized");
    });
  });
}

function getOA2C(scope, clientid, clientsecret, hostname) {
  return new google.auth.OAuth2(
    clientid,
    clientsecret,
    "http://" + hostname + "/callback"
  );
}

function getSavedClient(callback) {
  fs.readFile(pj(__dirname, ".token"), "utf8", function (err, gc) {
    if (err) {
      console.log(err);
      process.exit();
    }
    gc = JSON.parse(gc);
    var oauth2Client = getOA2C(gc.scope, gc.oauth2Client.clientId_, gc.oauth2Client.clientSecret_, gc.oauth2Client.redirectUri_);
    oauth2Client.setCredentials(gc.oauth2Client.credentials);
    google.options({
      auth: oauth2Client
    });
    callback(google,gc.scope);
  });
}

