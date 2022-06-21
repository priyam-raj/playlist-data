async function getData() {
   
   document.getElementById("submit").textContent="Fetching";
//    document.getElementById("submit").className = "btn text-center AnimatedEllipsis";
  var playlistEntered = document.getElementById("myText").value;
  console.log(playlistEntered);


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
      document.getElementById("submit").textContent="Fetch Again";
    }
  );
}
