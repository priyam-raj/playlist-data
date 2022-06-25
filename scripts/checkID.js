const axios = require('axios');
let API_KEY = process.env.YOUTUBE_API_KEY;

async function checkID (playlistID){
	let checkRes;
    await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=status&maxResults=1&playlistId=${playlistID}&key=${API_KEY}`)
    .then((res)=>{
      // console.log(res.data);
      checkRes = true;
      
    })
    .catch((error)=> {
      if (error.response) {
        console.log(error.response.status);
		checkRes = false;
        } 
    })
  return checkRes;
  } 

  module.exports = {checkID}