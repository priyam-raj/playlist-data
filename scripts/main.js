const axios = require("axios");
const toSeconds = require("./toSeconds");

let API_KEY = ``;
let gPlaylistId = "";
let finalTotalDuration = 0;
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
      console.log("Errow while fetching videos list.");
    } else {
      throw new Error(e.message);
    }
  }
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
    gVideoIdsPromises.push(getDetailsForVideoIds(videoIds));
    // console.log(videoIds);
    if (gNextPageToken) {
      await getPlaylistData();
    }
  } catch (e) {
    throw new Error(e.message);
    console.log("Error while navigating between video pages.");
  }
}

// Add the duration of all videos fetched.
async function getVideosDuration() {
  try {
    const videoGroups = await Promise.all(gVideoIdsPromises);

    for (const group of videoGroups) {
      for (const video of group) {
        finalTotalDuration += toSeconds.toSeconds(video.contentDetails.duration);
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

async function mainfun(playlistId, apiKey, formatted = false) {
  // console.log(playlistId,apiKey);
  if (!playlistId || !apiKey) {
    throw new Error(`Invalid Playlist ID or YouTube API Key.`);
  }

  // Final Formatting
  function formatDuration(duration) {
    let seconds = duration;

    let hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;

    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    seconds = Math.floor(seconds);

    return {hours, minutes, seconds};
  }


  try {
    gPlaylistId = extractID(playlistId);
    finalTotalDuration = 0;
    gVideoIdsPromises.length = 0;
    API_KEY = apiKey;
    await getPlaylistData();
    await getVideosDuration();

    TotalDurationTwo = Math.floor(finalTotalDuration / 1.25);
    TotalDurationThree = Math.floor(finalTotalDuration / 1.5);
    TotalDurationFour = Math.floor(finalTotalDuration / 1.75);
    TotalDurationFive = Math.floor(finalTotalDuration / 2.0);

    return (formattedDuration = formatDuration(finalTotalDuration));} 
	
	catch (e) {
    throw new Error(e.message);
    console.log("Formatting Error.");
  }


}

module.exports = { mainfun };
