const axios = require("axios");
require('dotenv').config();

let API_KEY = process.env.YOUTUBE_API_KEY;
let gNextPageToken = null;
const returnedVideoIds = [];

const playlistItemsURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken`;
const videoDetailsURL = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&fields=items/contentDetails/duration`;



function getNextVideosDetailsURL(id) {
	return `${videoDetailsURL}&id=${id}&key=${API_KEY}`;
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
			console.log("Errow while fetching videos list.");
		} else {
			throw new Error(e.message);
		}
	}
}

// Next page for more results (Max 50 per page)
function getNextTokenURL() {
	return gNextPageToken
		? `${playlistItemsURL}&playlistId=${gPlaylistId}&pageToken=${gNextPageToken}&key=${API_KEY}`
		: `${playlistItemsURL}&playlistId=${gPlaylistId}&key=${API_KEY}`;
}

// Returns details for videos in the playlist.
async function getDetailsForVideoIds(id) {
	try {
		const { data } = await axios.get(getNextVideosDetailsURL(id));
		return data.items;
	} catch (e) {
		throw new Error(e.message);
		console.log("Error while fetching video details. ");
	}
}

// Navigates between the videos per page and stores them. (Maximum 50)
async function getPlaylistData() {
	try {
		const { videoIds, nextPageToken } = await getVideoIdsForPageToken();
		gNextPageToken = nextPageToken;
		returnedVideoIds.push(getDetailsForVideoIds(videoIds));
		// console.log(videoIds);
		if (gNextPageToken) {
			await getPlaylistData();
		}
	} catch (e) {
		throw new Error(e.message);
		console.log("Error while navigating between video pages.");
	}
}


// Formats all the returned duration info into seconds. 
function returnedToSeconds(input) {
	try {
		const regex = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
		let days = 0;
		let hours = 0;
		let minutes = 0;
		let seconds = 0;
		let totalSeconds;

		if (regex.test(input)) {
			let matches = regex.exec(input);

			if (matches[1]) days = Number(matches[1]);
			if (matches[2]) hours = Number(matches[2]);
			if (matches[3]) minutes = Number(matches[3]);
			if (matches[4]) seconds = Number(matches[4]);

			totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
		} else {
			console.log(returnedToSeconds);
		}
		// totalSecondsTwo /= 1.25;
		// totalSecondsThree /= 1.50;
		// totalSecondsFour /= 1.75;
		// totalSecondsFive /= 2.0;

		return totalSeconds;
	} catch (e) {

		console.error(e);
		if (e.message.includes("Invalid date")) {
			return "Invalid date";
		}
	}
}



// Add the duration of all videos fetched.
async function getVideosDuration() {
	try {
		const videoGroups = await Promise.all(returnedVideoIds);

		for (const group of videoGroups) {
			for (const video of group) {
				finalTotalDuration += returnedToSeconds(video.contentDetails.duration);
			}
		}
	} catch (e) {
		throw new Error(e.message);
		console.log("Error while adding the duration of all videos fetched.");
	}
}

// Ensures only PlaylistID is entered.
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
		console.log("Error while extracting playlistID in the backend.");
	}
}

async function finalisedDuration(playlistId, apiKey) {
	if (!playlistId || !apiKey) {
		throw new Error(`Invalid Playlist ID or YouTube API Key`);
	}


	// Final Formatting
	function formatDuration(duration) {
		let seconds = duration;
		let hours = Math.floor(seconds / 3600);
		seconds -= hours * 3600;
		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;
		seconds = Math.floor(seconds);
		return { hours, minutes, seconds };
	}


	try {
		gPlaylistId = extractID(playlistId);
		finalTotalDuration = 0;
		returnedVideoIds.length = 0;
		await getPlaylistData();
		await getVideosDuration();

		// Formatted Duration (For Update)
		TotalDurationTwo = Math.floor(finalTotalDuration / 1.25);
		TotalDurationThree = Math.floor(finalTotalDuration / 1.5);
		TotalDurationFour = Math.floor(finalTotalDuration / 1.75);
		TotalDurationFive = Math.floor(finalTotalDuration / 2.0);

		return (formattedDuration = formatDuration(finalTotalDuration));
	}

	catch (e) {
		throw new Error(e.message);
		console.log("Formatting Error.");
	}


}

module.exports = { finalisedDuration };
