const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
const API_KEY = process.env.YOUTUBE_API_KEY;

const videoDetailsURL = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&fields=items/contentDetails/duration`;
const playlistItemsURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken`;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Serves the public folder all together.
app.use(express.static('views'));

//Generates URL for required videos.
function generateVideosURL(id) {
  return `${videoDetailsURL}&id=${id}&key=${API_KEY}`;
}

// Requests for videoIDS and nextPageToken(s)
async function getVideoIdsForPageToken(url) {
  try {
    const { data } = await axios.get(url);
    const nextPageToken = data.nextPageToken;
    const videoIds = data.items.map((video) => {
      return video.contentDetails.videoId;
    });
    return { videoIds, nextPageToken };
  } catch (e) {
    if (e.response) {
      const { code, message } = e.response.data.error;
      console.log('Errow while fetching videos list.');
      throw new Error(`StatusCode ${code}. Reason: ${message}`);
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
    console.log('Error while fetching video details. ');
    throw new Error(e.message);
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
    let totalSeconds = 0;

    if (daysHrsMinsSecs.test(input)) {
      let toMatch = daysHrsMinsSecs.exec(input);
      if (toMatch[1]) days = Number(toMatch[1]);
      if (toMatch[2]) hours = Number(toMatch[2]);
      if (toMatch[3]) minutes = Number(toMatch[3]);
      if (toMatch[4]) seconds = Number(toMatch[4]);

      totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    } else {
      console.log(returnedToSeconds);
    }

    return totalSeconds;
  } catch (e) {
    console.error(e);
    if (e.message.includes('Invalid date')) {
      return 'Invalid date in returned data.';
    }
  }
}

async function getPlaylistTotalDuration(extractedPlaylistIDId, newPageToken) {
  try {
    // Step 1: Create the required query URL based on the newPageToken parameter
    let url = newPageToken
      ? `${playlistItemsURL}&playlistId=${extractedPlaylistIDId}&pageToken=${newPageToken}&key=${API_KEY}`
      : `${playlistItemsURL}&playlistId=${extractedPlaylistIDId}&key=${API_KEY}`;

    // Step 2: Start a local duration counter
    let totalDuration = 0;

    // Step 3: Get the video details based on the URL created in Step 1
    const { videoIds, nextPageToken } = await getVideoIdsForPageToken(url);
    const returnedVideoIds = [];
    returnedVideoIds.push(getDetailsForVideoIds(videoIds));
    const videoGroups = await Promise.all(returnedVideoIds);

    for (const group of videoGroups) {
      for (const video of group) {
        // Step 4: Get the durations in seconds and add it to the local duration counter created in Step 2
        totalDuration += returnedToSeconds(video.contentDetails.duration);
      }
    }

    // Step 5: Check if the return of Step 3 has a nextPageToken, if so do a recursive call to self with the new token
    if (nextPageToken) {
      totalDuration += await getPlaylistTotalDuration(extractedPlaylistIDId, nextPageToken);
    }

    // Step 6: Return the final value, which will propogate back in a recursive function
    return totalDuration;
  } catch (e) {
    console.log('Error while navigating between video pages.');
    throw new Error(e.message);
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
    console.log('The playlist id is: ' + id);
    return id;
  } catch (e) {
    console.log('Error while extracting playlistID in the backend.');
    throw new Error(e.message);
  }
}

// Inputs from app.js
async function finalisedDuration(playlistId) {
  if (!playlistId) {
    throw new Error(`Invalid Playlist ID or YouTube API Key`);
  }
  try {
    // Could be the issue
    const extractedPlaylistIDId = extractID(playlistId);
    return getPlaylistTotalDuration(extractedPlaylistIDId);
  } catch (e) {
    console.log('Formatting Error.');
    throw new Error(e.message);
  }
}

app.post('/search', async (req, res) => {
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

  (async () => {
    extractedPlaylistIDId = null;
    const playlisturl = req.body.playlistID;
    if (await checkID(playlisturl)) {
      let resp = await finalisedDuration(playlisturl);
      console.log('Someone just fetched a playlist of ' + resp + ' seconds.');
      res.send(resp.toString());
    } else {
      res.send('API_Error');
    }
  })();
});

app.get('/', function (req, res) {
  res.render('index');
});

// Port Route.
app.listen(process.env.PORT || 3000, () => {
  console.log(`Playlist data is now running baby!)`);
});
