var google;
var drive;

module.exports.init = init;
module.exports.uploadFile = uploadFile;
module.exports.uploadFileWithParent = uploadFileWithParent;

function init(callback) {
	require('./google.js')(['https://www.googleapis.com/auth/drive'], function (gl) {
		google = gl;
		drive = google.drive({
			version: 'v3'
		});
		callback();
	});
}

function uploadFileWithParent(filename,parent,readstream,callback){
	var resource = {
		name:filename,
		parents:[parent]
	};
	var media = {
		body: readstream
	};
	uploadFile(resource,media,callback);
}

function uploadFile(resource,media,callback) {
	drive.files.create({
		resource: resource,
		media: media
	}, function (err, res) {
		if (err) console.log("error", err);
		if (res) console.log("uploaded: ", res.name);
		callback();
	});
}