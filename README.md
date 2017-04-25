# youtube-schedule

### Downloads all new songs from a playlist, extracts their audio and uploads it to your google drive.

This program is best used with a daily chrontab.

To use this program you need to clone or download this repo and execute `npm i`.

**ffmpeg** is required.

Also required is a file with the name `.env` in the root directory of the cloned repo.

Values for .env are:
- GOOGLEAPIKEY=".."   your google api key for youtube data v3
- CLIENTID="..."   your client id for google drive oauth
- CLIENTSECRET="..." your client secret for google drive oauth
- REDIRECTURL="..." your redirect url for oauth (pretty much useless, just input the query params from the url"
- TOKENPATH="..." your path to the .token file where a oauth token will be saved (relative to root dir of repo)
- PARENTFOLDERID="..." your id of the folder on your google drive where the songs are being uploaded to
- PLAYLISTURL="..." your full playlist url from where the program will download new songs
