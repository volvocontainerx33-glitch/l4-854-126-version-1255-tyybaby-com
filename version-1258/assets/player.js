(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell[data-stream]"));

  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-layer");
    var stream = shell.getAttribute("data-stream");
    var attached = false;
    var hls = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function playVideo() {
      attachStream();
      shell.classList.add("is-playing");

      if (video) {
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
