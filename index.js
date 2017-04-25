var pj = require('path').join;
require('dotenv').config({path: pj(__dirname,".env")});
var yt = require('./yt.js');
var ytdl = require('ytdl-core');
var drive = require('./drive.js');
var fs = require('fs');
var deasync = require('deasync');
var drive = require('./drive.js');
var bash = require('child_process');

var pathlist = pj(__dirname, "playlist");
var pathdownload = pj(__dirname, "downloads");
var todo = [];
var exists = [];

drive.init(function () {
	readList();
	getDifference(function () {
		console.log("Videos to be downloaded: ", todo.length);
		downloadDifference();
		rmDownloads();
		console.log("done and done");
	});
});


function readList() {
	if (fs.existsSync(pathlist)) {
		var content = fs.readFileSync(pathlist, "utf-8");
		content = content.split("\n");
		var temptitle;
		for (var i = 0; i < content.length; i++) {
			if (i % 2 !== 0) {
				exists.push({ title: temptitle, video_id: content[i] });
			} else {
				temptitle = content[i];
			}
		}
	} else {
		exists = [];
	}
}

function getDifference(callback) {
	yt.get(process.env.PLAYLISTURL, function (info) {
		if (isNew(info.video_id)) {
			todo.push(info);
		}
	}, callback);
}

function isNew(video_id) {
	if (exists.find(function (s) { return s.video_id == video_id; })) {
		return false;
	}
	return true;
}

function downloadDifference() {
	if(!fs.existsSync(pathdownload)){
		fs.mkdirSync(pathdownload);
	}
	todo.forEach(function (info) {
		downloadSingle(info);
	});
}

function downloadSingle(info) {
	var time = Date.now();
	var finished = false;
	var readstream = ytdl.downloadFromInfo(info);
	var writestream = fs.createWriteStream(pj(pathdownload, info.title + ".mp4"));
	var downloadstream = readstream.pipe(writestream);
	readstream.on('end', function () {
		finished = true;
	});
	deasync.loopWhile(function () { return !finished; });
	console.log("downloaded: ", info.title, (Date.now() - time) / 1000, "s");
	time = Date.now();
	finished = false;
	convertToAac(info, function (succ) {
		finished = true;
	});
	deasync.loopWhile(function () { return !finished; });
	console.log("converted: ", info.title, (Date.now() - time) / 1000, "s");
	time = Date.now();
	finished = false;
	registerDownloaded(info);
	uploadToDrive(info, function () {
		finished = true;
	});
	deasync.loopWhile(function () { return !finished; });
	console.log("uploaded: ", info.title, (Date.now() - time) / 1000, "s");
}

function registerDownloaded(info) {
	var data = info.title + "\n" + info.video_id + "\n";
	fs.appendFileSync(pathlist, data, 'utf-8');
}

function uploadToDrive(info, callback) {
	drive.uploadFileWithParent(info.title+".aac",process.env.PARENTFOLDERID,fs.createReadStream(pj(pathdownload,info.title+".aac")),callback);
}

function convertToAac(info, callback) {
	var ffmpeg = bash.spawn("ffmpeg", ["-i", pj(pathdownload,info.title + ".mp4"), pj(pathdownload,info.title + ".aac")]);
	ffmpeg.on('close', function (code) {
		callback(code === 0);
	});
}

function rmDownloads(){
	bash.exec("rm -R "+pathdownload);
}