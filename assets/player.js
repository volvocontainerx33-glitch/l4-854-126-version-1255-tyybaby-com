(function () {
  function setupMoviePlayer(source) {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    if (!video) {
      return;
    }
    var started = false;
    var hls = null;
    function begin() {
      if (!started) {
        started = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        begin();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }
  window.setupMoviePlayer = setupMoviePlayer;
})();
