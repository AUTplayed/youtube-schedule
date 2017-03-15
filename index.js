require('dotenv').load();
var yt = require('./yt.js');
var pj = require('path').join;
var ytdl = require('ytdl-core');
var fs = require('fs');
var deasync = require('deasync');

var pathlist = pj(__dirname,"playlist");
var pathdownload = pj(__dirname,"downloads");
var todo = [];
var exists = [];

readList();
getDifference(function(){
	console.log("Videos to be downloaded: ",todo.length);
	downloadDifference();
	console.log("done and done");
});

console.log("");


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
	yt.get("xXhemm99Xx downloads", function (info) {
		if(isNew(info.video_id)){
			//console.log(info.title);
			todo.push(info);
		}
	}, callback);
}

function isNew(video_id){
	if(exists.find(function(s){return s.video_id==video_id;})){
		return false;
	}
	return true;
}

function downloadDifference(){
	todo.forEach(function(info){
		downloadSingle(info);
	});
}

function downloadSingle(info){
	var time = Date.now();
	var finished = false;
	var readstream = ytdl.downloadFromInfo(info,{filter:'audioonly'});
	var writestream = fs.createWriteStream(pj(pathdownload,info.title+".mp3"));
	var downloadstream = readstream.pipe(writestream);
	readstream.on('finish',function(){
		finished = true;
	});
	deasync.loopWhile(function(){return !finished;});
	console.log(info.title,(Date.now()-time)/1000);
	registerDownloaded(info);
}

function registerDownloaded(info){
	var data = info.title+"\n"+info.video_id+"\n";
	fs.appendFileSync(pathlist,data,'utf-8');
}