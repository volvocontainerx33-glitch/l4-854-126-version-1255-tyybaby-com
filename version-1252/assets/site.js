(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var inputs = document.querySelectorAll(".search-input");
    inputs.forEach(function (input) {
        input.addEventListener("input", function () {
            var value = input.value.trim().toLowerCase();
            document.querySelectorAll("[data-card]").forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                card.classList.toggle("hidden", value !== "" && text.indexOf(value) === -1);
            });
        });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer;

        var showSlide = function (nextIndex) {
            index = nextIndex % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        };

        var startTimer = function () {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll(".player-box").forEach(function (box) {
        var video = box.querySelector("video");
        var button = box.querySelector(".player-cover");
        var src = box.getAttribute("data-hls");
        var loaded = false;

        var attach = function () {
            if (!video || !src || loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }

            loaded = true;
        };

        var play = function () {
            attach();
            box.classList.add("is-playing");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        };

        if (button && video) {
            button.addEventListener("click", play);
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
        }
    });
})();
