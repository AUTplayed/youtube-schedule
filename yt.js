//External dependencies
var https = require("https");
var ytdl = require('ytdl-core');

//Internal dependencies

//Declarations
var baseurl = "https://www.googleapis.com/youtube/v3/";
var key = process.env.YTAPIKEY;

//Module exports
module.exports.get = get;

function get(q, followup, finished) {
    if (q.startsWith("https://www.youtube.com/")) {
        if (q.startsWith("https://www.youtube.com/watch?v=")) {
            getVideo(filterId(q, "v"), followup, finished);
        } else if (q.startsWith("https://www.youtube.com/playlist?list=")) {
            getPlaylist(filterId(q, "list"), followup, finished);
        }
    }
    else {
        getBody(baseurl + "search?part=snippet&q=" + q + "&type=video,playlist&key=" + key, function (body) {
            //console.log(body.items.length);
            if (body.items.length < 1) {
                finished(1, 0);
                return;
            }
            var id = body.items[0].id;
            if (id.videoId) {
                getVideo(id.videoId, followup, finished);
            } else if (id.playlistId) {
                getPlaylist(id.playlistId, followup, finished);
            }
        });
    }
}

function filterId(q, filter) {
    q = q.split("?" + filter + "=")[1];
    q = q.split("&")[0];
    return q;
}

function getVideo(id, followup, finished) {
    downloadInfo("https://www.youtube.com/watch?v=" + id, 0, function (info) {
        followup(info);
        if (finished)
            finished(1, 1);
    });
}

function getPlaylist(id, followup, finished) {
    var progress = 0;
    var success = 0;
    var length;
    getAllPlaylistElements(id, function (len) {
        length = len
    }, function (videoId) {
        downloadInfo("https://www.youtube.com/watch?v=" + videoId, 0, function (info) {
            progress++;
            followup(info);
            if (info.title) success++;
            if (progress == length) {
                if (finished)
                    finished(length, success);
            }
        });
    });
}

function getAllPlaylistElements(id, len, followup) {
    getBody(baseurl + "playlistItems?part=snippet&maxResults=50&playlistId=" + id + "&key=" + key, function (body) {
        var iterations = Math.ceil(body.pageInfo.totalResults / 50);
        len(body.pageInfo.totalResults);
        body.items.forEach(function (item) {
            followup(item.snippet.resourceId.videoId);
        });
        if (iterations > 1) {
            recursiveGetElements(id, body.nextPageToken, iterations, followup);
        }
    });
}

function recursiveGetElements(id, pageToken, iterations, followup) {
    getBody(baseurl + "playlistItems?part=snippet&maxResults=50&playlistId=" + id + "&pageToken=" + pageToken + "&key=" + key, function (body) {
        body.items.forEach(function (item) {
            followup(item.snippet.resourceId.videoId);
        });
        if (--iterations > 1) {
            recursiveGetElements(id, body.nextPageToken, iterations, followup);
        }
    });
}

function downloadInfo(url, failcount, followup) {
    ytdl.getInfo(url, function (err, info) {
        if (!info || err) {
            if(err.message == "Video does not contain any available formats"){
                failcount = 10;
            }else if(failcount > 0){
                console.log(err);
            }
            failcount++;
            if (failcount > 1)
                followup("Failed to download: " + url + "\nReason: " + err.message);
            else
                downloadInfo(url, failcount, followup);
        } else {
            followup(info);
        }
    });
}

function getBody(url, followup) {
    https.get(url, function (res) {
        var html = '';
        res.on('data', function (data) {
            html += data;
        });
        res.once('end', function () {
            followup(JSON.parse(html));
        })
    }).end();
}