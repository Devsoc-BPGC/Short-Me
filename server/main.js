document.querySelector("#form").addEventListener("submit", async e => {
  e.preventDefault();
  var url = document.querySelector("#input-field").value;
  var urlCustom = document.querySelector("#custom-field").value;
  var resultLink = document.querySelector("#result-link");
  if (
    url.substring(0, 4) != "http" &&
    url.substring(0, 4) != "HTTP" &&
    url.substring(0, 4) != "Http"
  ) {
    resultLink.innerHTML = `<h3 id="result-link" style="display:inline"> <span id="result">Make sure your url starts with http or https</span></h3>`;
    return;
  }
  var data = {
    longUrl: url
  };
  if (urlCustom)
    data = {
      longUrl: url,
      customCode: urlCustom
    };
  axios
    .post("/api/url/shorten", data)
    .then(res => {
      resultLink.innerHTML = `<h3 id="result-link" style="display:inline">Here is your short link by devSoc : <span id="result"><a href="${res.data.shortUrl}" id="a-style" target="_blank">${res.data.shortUrl}</a></span></h3> <br/> <button id="copy"
		>Copy</button>`;
      document.querySelector("#copy").addEventListener("click", e => {
        ClipBoard(res.data.shortUrl);
      });
    })
    .catch(err => {
      resultLink.innerHTML = `<h3 id="result-link" style="display:inline"> <span id="result">Custom Url is already in use.</span></h3>`;
    });
});

function ClipBoard(result) {
  navigator.clipboard.writeText(result);
  $("#copied").slideToggle(200);
  setTimeout(
    function () {
      $("#copied").slideToggle(200);
    }
    , 1000
  )
}
