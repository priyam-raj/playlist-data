async function getData() {
  document.getElementById("submit").textContent = "Fetching";
  document.getElementById("showData").innerHTML = "Loading...";
  //    document.getElementById("submit").className = "btn text-center AnimatedEllipsis";
  var playlistEntered = document.getElementById("myText").value;
  var checkedPlaylistID = is_playlist_url(playlistEntered);
  console.log(playlistEntered);
  if (checkedPlaylistID != "NULL"){
    console.log(checkedPlaylistID);
    finalFetch(checkedPlaylistID);
  }
  else {
    document.getElementById("showData").innerHTML = "The URL is invalid.";
    document.getElementById("submit").className = "btn";
    document.getElementById("submit").textContent = "Fetch Again";
  }


}

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




function finalFetch(playlistEntered){
  $.post(
    "/search",
    {
      playlistID: playlistEntered,
    },
    function (fetchedData) {
      let fetchData = fetchedData;
      console.log(fetchedData);
      document.getElementById("showData").innerHTML = fetchData;
      document.getElementById("submit").className = "btn";
      document.getElementById("submit").textContent = "Fetch Again";
    }
  );
}
