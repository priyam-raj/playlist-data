const axios = require('axios');
const toSeconds = require('./toSeconds');
const formatDuration = require('./formatDuration');

let API_KEY = ``;
let gPlaylistId = "";
let gTotalDuration = 0;
let gNextPageToken = null;
const gVideoIdsPromises = [];

const gPlaylistItemsURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken`;
const gVideosDetailsURL = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&fields=items/contentDetails/duration`;

function getNextTokenURL() {
	
	return gNextPageToken
		? `${gPlaylistItemsURL}&playlistId=${gPlaylistId}&pageToken=${gNextPageToken}&key=${API_KEY}`
		: `${gPlaylistItemsURL}&playlistId=${gPlaylistId}&key=${API_KEY}`;
}

function getNextVideosDetailsURL(id) {
	return `${gVideosDetailsURL}&id=${id}&key=${API_KEY}`;
}

async function getVideoIdsForPageToken() {
	try {
		const { data } = await axios.get(getNextTokenURL());
		const nextPageToken = data.nextPageToken;

		const videoIds = data.items.map((video) => {
			return video.contentDetails.videoId;
		});

		return { videoIds, nextPageToken };
	} catch (e) {
		if (e.response) {
			const { code, message } = e.response.data.error;
			throw new Error(`StatusCode ${code}. Reason: ${message}`);
			console.log('error inside get video id');
		} else {
			throw new Error(e.message);
		}
	}
}

async function getDetailsForVideoIds(id) {
	try {
		const { data } = await axios.get(getNextVideosDetailsURL(id));
		return data.items;
	} catch (e) {
		throw new Error(e.message);
		console.log('error 2') ;
	}
}

async function getPlaylistData() {
	try {
		const { videoIds, nextPageToken } = await getVideoIdsForPageToken();
		gNextPageToken = nextPageToken;
		gVideoIdsPromises.push(getDetailsForVideoIds(videoIds));
        // console.log(videoIds);
		if (gNextPageToken) {
			await getPlaylistData();
		}
	} catch (e) {
		throw new Error(e.message);
		console.log('error 3 ') ;
}
}



async function getVideosDuraion() {
	try {
		const videoGroups = await Promise.all(gVideoIdsPromises);

		for (const group of videoGroups) {
			for (const video of group) {
				gTotalDuration += toSeconds.toSeconds(video.contentDetails.duration);
			}
		}
        
	} catch (e) {
		throw new Error(e.message);
		console.log('error 4') ;
	}
}

function extractID(playlist) {
	try {

	const scheme = `https://www.youtube.com/playlist?list=`;
	const isFullURL = playlist.startsWith(scheme);

	if (!isFullURL) return playlist;

	const fullURLRegex = /playlist\?list=(.*)/;
	const id = playlist.match(fullURLRegex)[1];
	return id;
	} catch (e) {
		throw new Error(e.message);
		console.log('error 5');
	}
}

 async function mainfun ( playlistId, apiKey, formatted = false ) {
    // console.log(playlistId,apiKey);
	if (!playlistId || !apiKey) {
		throw new Error(`Invalid Playlist ID or YouTube API Key.`);
	}

	try {
		gPlaylistId = extractID(playlistId);
		gTotalDuration = 0;
		gVideoIdsPromises.length = 0;
		API_KEY = apiKey;
		await getPlaylistData();
		await getVideosDuraion();
		return  formatDuration.formatDuration(gTotalDuration) ;
	} catch (e) {
		throw new Error(e.message);
		console.log('error 6') ;
	}
} 

module.exports = {mainfun}