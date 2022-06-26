const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT;
const axios = require("axios");
const API_KEY = process.env.YOUTUBE_API_KEY;
const {request} = require("express");
const videoDetailsURL = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&fields=items/contentDetails/duration`;
const playlistItemsURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken`;


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Serves the public folder all together.
app.use(express.static("views"));


//Generates URL for required videos. 
function generateVideosURL(id) {
	return `${videoDetailsURL}&id=${id}&key=${API_KEY}`;
}

let newPageToken = null;

// Next page for more results (Max 50 per page)
function getNextTokenURL() {
	return newPageToken
		? `${playlistItemsURL}&playlistId=${extractedPlaylistIDId}&pageToken=${newPageToken}&key=${API_KEY}`
		: `${playlistItemsURL}&playlistId=${extractedPlaylistIDId}&key=${API_KEY}`;
}


// Sets a token for next page request. 
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



// Returns details for videos in the playlist.
async function getDetailsForVideoIds(id) {
	try {
		const { data } = await axios.get(generateVideosURL(id));
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
		newPageToken = nextPageToken;
		const returnedVideoIds = [];
		returnedVideoIds.push(getDetailsForVideoIds(videoIds));
		const videoGroups = await Promise.all(returnedVideoIds);
		for (const group of videoGroups) {
			for (const video of group) {
				finalTotalDuration += returnedToSeconds(video.contentDetails.duration);
			}
		}

		// console.log(videoIds);
		if (nextPageToken) {
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
		const daysHrsMinsSecs = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
		let days = 0;
		let hours = 0;
		let minutes = 0;
		let seconds = 0;
		let totalSeconds;

		if (daysHrsMinsSecs.test(input)) {
			let toMatch = daysHrsMinsSecs.exec(input);
			if (toMatch[1]) days = Number(
        toMatch[1]);
			if (toMatch[2]) hours = Number(
        toMatch[2]);
			if (toMatch[3]) minutes = Number(
        toMatch[3]);
			if (toMatch[4]) seconds = Number(
        toMatch[4]);

			totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

		} else {
			console.log(returnedToSeconds);
		}

		return totalSeconds;
	} catch (e) {

		console.error(e);
		if (e.message.includes("Invalid date")) {
			return "Invalid date in returned data.";
		}
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


// Inputs from app.js
async function finalisedDuration(playlistId) {
	if (!playlistId) {
		throw new Error(`Invalid Playlist ID or YouTube API Key`);
	}


	try {
		extractedPlaylistIDId = extractID(playlistId);
		finalTotalDuration = 0;
		// returnedVideoIds.length = 0;
		newPageToken = null;
		await getPlaylistData();
		// await getVideosDuration();

		// Formatted Duration (For Update)
		// TotalDurationTwo = Math.floor(finalTotalDuration / 1.25);
		// TotalDurationThree = Math.floor(finalTotalDuration / 1.5);
		// TotalDurationFour = Math.floor(finalTotalDuration / 1.75);
		// TotalDurationFive = Math.floor(finalTotalDuration / 2.0);

		return (finalTotalDuration);
	}

	catch (e) {
		throw new Error(e.message);
		console.log("Formatting Error.");
	}

}



app.post("/search", async (req, res) => {
  const playlisturl = req.body.playlistID;

// resp = Final returned duration (in seconds)
let resp;  

// Function that checks if the playlist id is correct.
async function checkID(playlistID) {
  let checkRes;
  await axios
    .get(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=status&maxResults=1&playlistId=${playlistID}&key=${API_KEY}`
    )
    .then((res) => {
      checkRes = true;
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response.status);
        checkRes = false;
      }
    });
  return checkRes;
} 

// Checks for API error.
  if(await checkID(playlisturl)){
    resp = await finalisedDuration(playlisturl);
    res.send(resp.toString()); 
	console.log("Someone just fetched a playlist of " + resp + " seconds.")
    } else {
    res.send("API_Error");
  }
});



app.get("/", function (req, res) {
  res.render("index");
});



// Port Route.
app.listen(process.env.PORT || 3000, () => {
  console.log(`Playlist data is now running baby!)`);
});
