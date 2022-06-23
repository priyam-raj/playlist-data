const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const axios = require("axios");
const apiKey = "";
const main = require("./scripts/main");

const { request } = require("express");
const { json } = require("body-parser");
var resp;



app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Serves the public folder all together.
app.use(express.static("views"));

app.post("/search", async (req, res) => {
  const playlisturl = req.body.playlistID;
  
  resp = await main.mainfun(playlisturl, apiKey);
  res.send(
    "This playlist is " +
      resp.hours +
      " hours " +
      resp.minutes +
      " minutes " +
      resp.seconds +
      " seconds long"
  );
});

app.get("/", function (req, res) {
  displaySeconds = resp;
  res.render("index", { printedSeconds: displaySeconds });
});



app.listen(port, () => {
  console.log(`Playlist data is now running baby! (port ${port})`);
});
