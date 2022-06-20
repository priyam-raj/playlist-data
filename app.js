const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 2800;
const axios = require('axios');
const baseApiURL = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=500';
const apiKey = ''; 
const playlistID = 'PLhTm4jreEBz9G2eYFIePmMbyVmeoLeSMF';
const main = require('./scripts/main');
const { request } = require('express');

app.use(express.urlencoded({ extended: true }));

// Serves the public folder all together. 
app.use(express.static("public"));


app.get("/", function(req, res){
res.sendFile(__dirname + "/public/index.html");
}) ;

app.post('/search', async (req, res) => {
  //const searchQuery = req.search.search_query;
  // const url = `${baseApiURL}&playlistId=${playlistID}&key=${apiKey}`
  // const response = await axios.get(url);
   const playlisturl = req.body.playlisturl;
  //console.log(response.data.items);
   const resp = await main.mainfun(playlisturl,apiKey);
   console.log(resp);
   res.send("This playlist is "+ resp + " seconds long.");
   res.render('/index.html',{email:data.email,password:data.password});

   
})



// app.post("/", express.static("public"));





app.listen(port, () => {
  console.log(`Playlist data is now running baby! (port ${port})`)
})