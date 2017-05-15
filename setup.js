//External Dependencies
var express = require('express');
var app = express();
var pj = require('path').join;
var argv = require('argv');
argv.option(getOptions());
argv.info('Either provide clientid, clientsecret and scope via a .env file in the root directory like this: \nclientid="<id>"\nclientsecret="<secret>"\nscope=<scope1> <scope2>\nor via the arguments explained below');
var args = argv.run();
require('dotenv').config({ path: pj(__dirname, ".env") });

//Internal Dependencies
var google = require("./google.js");

app.get('/', function (req, res) {
    var info = getInfo();
    if (info.clientid) {
        var url = google.initUrl(info.scope, info.clientid, info.clientsecret, req.headers.host);
        console.log("redirecting...");
        res.redirect(url);
    } else {
        res.send(info);
    }
});
app.get('/callback', function (req, res) {
    google.saveToken(req.query.code, function (msg) {
        res.send(msg);
        console.log("Setup finished");
        process.exit();
    });
});

var server = app.listen(args.options.port || process.env.PORT || 8080);

var infolog = "Please visit the root url of your app (most likely localhost:";
if (args.options.port) console.log(infolog + args.options.port + ")");
else if (process.env.PORT) console.log(infolog + process.env.PORT + ")");
else console.log(infolog + "8080)");

function getInfo() {
    if (args.options.scope) {
        if(args.options.scope.constructor == Array)
            args.options.scope = args.options.scope.join(" ");
    }
    Object.assign(args.options, process.env);
    if (args.options.clientid && args.options.clientsecret && args.options.scope) {
        return args.options;
    }
    return "Please provide clientid, clientsecret and a scope via .env or arguments. See --help for further information.";
}

function getOptions() {
    return [
        {
            name: 'clientid',
            short: 'i',
            type: 'string',
            description: 'Your oauth client id'
        }, {
            name: 'clientsecret',
            short: 's',
            type: 'string',
            description: 'Your oauth client secret'
        }, {
            name: 'scope',
            short: 'c',
            type: 'list,string',
            description: 'The scope used',
            example: '-c <scopeurl1> -c <scopeurl2>'
        }, {
            name: 'port',
            short: 'p',
            type: 'int',
            description: 'The port used'
        }
    ];
}