$(".resultArea").hide();
$(".successMessage").hide();

1;

$("#myText").keypress(function (event) {
  if (event.keyCode == 13) {
    $("#submit").click();
    return false;
  }
});

$('#myText').each(function() {
  var form_data = new FormData('form');
  $(this).data('serialized', form_data);
}).on('change input', function() {
  var form_data1 = new FormData('form');
  $(this).find('#submits').attr('disabled', form_data1 == $(this).data('serialized'));
});





async function getData() {
  
  document.getElementById("submit").textContent = "Fetching..";
  document.getElementById("showData").innerHTML = "";
  document.getElementById("showData").className = "";
  document.getElementById("gif-container").innerHTML = "";
  document.getElementById("loader").className = "AnimatedEllipsis";

  var getPlaylistLink = document.getElementById("myText").value;
  let playlistEntered = getPlaylistLink.trim(); //removes accidental spaces during copying
  var checkedPlaylistID = is_playlist_url(playlistEntered);


  
  if (checkedPlaylistID != "NULL") {
    
    finalFetch(checkedPlaylistID);
    
  document.getElementById("myText").setAttribute("disabled", "disabled"); 
  document.getElementById("submit").setAttribute("disabled", "disabled"); 

  
  }
  
  
  


  else {

    document.getElementById("showData").innerHTML =
      "You sure that playlist URL is correct?";
    document.getElementById("showData").className = "flash mt-3 flash-error ";
    document.getElementById("submit").textContent = "Fetch Again";
    document.getElementById("gif-container").innerHTML =
      '<img src="assets/dustin-boom.gif" class="img-responsive"></img>';
    document.getElementById("loader").className = "";
    $(".successMessage").show();
    document.getElementById("statusMessageText").className = "color-bg-closed-emphasis color-fg-on-emphasis p-2 rounded mb-4";
    document.getElementById("statusMessageText").innerHTML = "Fetching failed!";
    $("#myText").removeAttr("disabled"); 
    $("#submit").removeAttr("disabled"); 
    
    $(".resultArea").hide();


  }
}

//Preventing default form action
document.querySelector("#formSubmitted").addEventListener("submit", (e) => {
  e.defaultPrevented;
});

// URL Validator
function is_url(myURL) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
      "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return pattern.test(myURL);
}
//to check if input url contains "list=" or not
function list_check(a, b, c, d, e) {
  if (a == "l" && b == "i" && c == "s" && d == "t" && e == "=") {
    return true;
  } else {
    return false;
  }
}

function is_playlist_url(str) {
  if (str[str.length - 1] == "/") {
    str = str.slice(0, str.length - 1);
  }
  var i = 0,
    low = -1,
    high = -1,
    ans = "NULL";
  if (!is_url(str)) {
    return ans;
  }
  while (i <= 5000) {
    if (list_check(str[i], str[i + 1], str[i + 2], str[i + 3], str[i + 4])) {
      low = i + 5;
      break;
    }
    i++;
  }
  if (low != -1) {
    high = str.length;
    ans = str.slice(low, high);
  }
  return ans;
}

//console.log(is_playlist_url());

// DOM
function finalFetch(playlistEntered) {
  $.post(
    "/search",
    { playlistID: playlistEntered },

    function (response) {
      if (response === "API_Error") {
        document.getElementById("showData").innerHTML =
          "Great Scott! Are you sure this playlist is in the right time and in the right universe?";
        document.getElementById("showData").className = "flash mt-3 flash-warn";
        document.getElementById("gif-container").innerHTML =
          '<img src="assets/great-scott.gif"></img>';
        document.getElementById("submit").textContent = "Fetch Again";
        document.getElementById("loader").className = "";
        $(".successMessage").show();
        document.getElementById("statusMessageText").className = "color-bg-attention-emphasis color-fg-on-emphasis p-2 rounded mb-4";
        document.getElementById("statusMessageText").innerHTML = "Fetching failed!";
        $("#myText").removeAttr("disabled"); 
        $("#submit").removeAttr("disabled"); 
        
        $(".resultArea").hide();

      } else {

        let fetchedData = formatDurationWithSpeeds(parseInt(response));
        
  $("#myText").removeAttr("disabled"); 
  $("#submit").removeAttr("disabled"); 
  
        document.getElementById("statusMessageText").className = "color-bg-success-emphasis color-fg-on-emphasis p-2 rounded mb-4";
        document.getElementById("statusMessageText").innerHTML = "Fetching successful!";
        // document.getElementById("showData").className = "flash mt-3 flash-success Box anim-hover-grow";
        // document.getElementById("showData").innerHTML = "Successfully fetched!";
        
        document.getElementById("showDuration").innerHTML =
          "The length of this playlist is<br>" +
          fetchedData.oneX.hours +
          " hours " +
          fetchedData.oneX.minutes +
          " minutes " +
          fetchedData.oneX.seconds +
          " seconds";
        document.getElementById("saveTimeMessage").innerHTML =
          "But you can save some time if you watch it in:";
        document.getElementById("onePointTwoFiveX").innerHTML =
          "1.25x: " +
          fetchedData.onePointTwoFiveX.hours +
          " hours " +
          fetchedData.onePointTwoFiveX.minutes +
          " minutes " +
          fetchedData.onePointTwoFiveX.seconds +
          " seconds";
        document.getElementById("onePointFiveX").innerHTML =
          "1.50x: " +
          fetchedData.onePointFiveX.hours +
          " hours " +
          fetchedData.onePointFiveX.minutes +
          " minutes " +
          fetchedData.onePointFiveX.seconds +
          " seconds";
        document.getElementById("onePointSevenFiveX").innerHTML =
          "1.75x: " +
          fetchedData.onePointSevenFiveX.hours +
          " hours " +
          fetchedData.onePointSevenFiveX.minutes +
          " minutes " +
          fetchedData.onePointSevenFiveX.seconds +
          " seconds";
        document.getElementById("twoX").innerHTML =
          "2.00x: " +
          fetchedData.twoX.hours +
          " hours " +
          fetchedData.twoX.minutes +
          " minutes " +
          fetchedData.twoX.seconds +
          " seconds";

        document.getElementById("submit").className = "btn";
        document.getElementById("submit").textContent = "Fetch Again";
        document.getElementById("loader").className = "";

        $(".resultArea").show();
        $(".successMessage").show();
        
        // $(".header").hide();
      }
    }
  );
}

// Formatting seconds into Hours, Minutes and Seconds.
function formatDuration(duration) {
  let seconds = duration;
  let hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  seconds = Math.floor(seconds);
  return { hours, minutes, seconds };
}

function formatDurationWithSpeeds(duration) {
  let oneX, onePointTwoFiveX, onePointFiveX, onePointSevenFiveX, twoX;

  oneX = formatDuration(duration);
  // console.log(oneX);

  onePointTwoFiveX = formatDuration(duration / 1.25);
  // console.log(onePointTwoFiveX);

  onePointFiveX = formatDuration(duration / 1.5);
  // console.log(onePointFiveX);

  onePointSevenFiveX = formatDuration(duration / 1.75);
  // console.log(onePointSevenFiveX);

  twoX = formatDuration(duration / 2);
  // console.log(twoX);

  return { oneX, onePointTwoFiveX, onePointFiveX, onePointSevenFiveX, twoX };
}

// let x = formatDurationWithSpeeds(11700); //3h 15m

// console.log(x.oneX);
// console.log(x.onePointTwoFiveX);
// console.log(x.onePointFiveX);
// console.log(x.onePointSevenFiveX);
// console.log(x.twoX);
