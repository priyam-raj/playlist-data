const express = require('express')
const app = express()
const port = 3000
const axios = require('axios');
const baseApiURL = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=500';
const apiKey = '';
console.log(apiKey);
const playlistID = 'PLpQQipWcxwt9U7qgyYkvNH3Mp8XHXCMmQ';
const main = require('./scripts/main');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send("hello");
})

app.get('/search', async (req, res) => {
  //const searchQuery = req.search.search_query;
  const url = `${baseApiURL}&playlistId=${playlistID}&key=${apiKey}`
  const response = await axios.get(url);
  //console.log(response.data.items);
   const resp = await main.mainfun(playlistID,apiKey);
  res.send('lets see');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})