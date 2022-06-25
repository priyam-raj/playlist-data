const express = require("express");
const bodyParser = require("body-parser");

require('dotenv').config();

const app = express();
const port = process.env.PORT;
const axios = require("axios");
const apiKey = process.env.YOUTUBE_API_KEY;
const main = require("./scripts/main");
const checkID = require("./scripts/checkID");
const { request } = require("express");
const { json } = require("body-parser");
var resp;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Serves the public folder all together.
app.use(express.static("views"));

app.post("/search", async (req, res) => {
  const playlisturl = req.body.playlistID;

  if(await checkID.checkID(playlisturl, apiKey)){
    resp = await main.finalisedDuration(playlisturl, apiKey);
    res.send(
      "This playlist is " +
        resp.hours +
        " hours " +
        resp.minutes +
        " minutes " +
        resp.seconds +
        " seconds long"
    );
  }else {
    res.send("Great Scott! You sure this playlist exists in this Time and Universe?");
  }
});

app.get("/", function (req, res) {
  displaySeconds = resp;
  res.render("index", { printedSeconds: displaySeconds });
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Playlist data is now running baby!)`);
});
