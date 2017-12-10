# youtube-schedule

### Downloads all new songs from a playlist, extracts their audio and uploads it to your google drive.

This program is best used with a daily chrontab.

To use this program you need to clone or download this repo and execute `npm i`.

**ffmpeg** is required.

## How to run

**Before starting you have to set up oauth with your credidentials**

You can get google oauth credentials <a href="https://console.developers.google.com/apis/credentials">here</a>

**NOTE: the required scope is https://www.googleapis.com/auth/drive**

Here's how to do it, quote from `node setup.js --help`
```
Either provide clientid, clientsecret and scope via a .env file in the root directory like this:
clientid=<id>
clientsecret=<secret>
scope=<scope1> <scope2>
or via the arguments explained below

        --clientid, -i
                Your oauth client id

        --clientsecret, -s
                Your oauth client secret

        --scope, -c
                The scope used
                -c <scopeurl1> -c <scopeurl2>

        --port, -p
                The port used

```

**After a successful setup you can continue with the main program**

Quote from `node index.js --help`: 
```
Make sure you run setup.js once before! 
Either provide folderid and playlisturl via a .env file in the root directory like this: 
parentfolderid=<id>
playlisturl=<url>
apikey=<key>
or via the arguments explained below

	--url, -u
		Your public playlist url

	--folderid, -f
		Your folder id where the music ends up in

    	--apikey, -k
	    	Your youtube data v3 api key

```

To get the folderid just go to https://drive.google.com and open a folder. The id is now in the url: https://drive.google.com/drive/folders/<id>
