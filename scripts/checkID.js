const axios = require('axios');

async function checkID (playlistID, apiKey){
	let checkRes;
    await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=status&maxResults=1&playlistId=${playlistID}&key=${apiKey}`)
    .then((res)=>{
      console.log(res.data);
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