(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-site-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      const input = form.querySelector("input[name='q']");

      form.addEventListener("submit", function (event) {
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initHero() {
    const carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    prev && prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });

    next && next.addEventListener("click", function () {
      show(index + 1);
      start();
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    const panel = document.querySelector("[data-filter-panel]");
    const grid = document.querySelector("[data-card-grid]");

    if (!panel || !grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll("[data-card]"));
    const search = panel.querySelector("[data-filter-search]");
    const region = panel.querySelector("[data-filter-region]");
    const type = panel.querySelector("[data-filter-type]");
    const genre = panel.querySelector("[data-filter-genre]");
    const year = panel.querySelector("[data-filter-year]");
    const sort = panel.querySelector("[data-sort-select]");
    const count = panel.querySelector("[data-result-count]");
    const reset = panel.querySelector("[data-filter-reset]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function matchCard(card) {
      const query = normalize(search && search.value);
      const selectedRegion = normalize(region && region.value);
      const selectedType = normalize(type && type.value);
      const selectedGenre = normalize(genre && genre.value);
      const selectedYear = normalize(year && year.value);
      const cardText = normalize(card.dataset.search);
      const cardRegion = normalize(card.dataset.region);
      const cardRegionGroup = normalize(card.dataset.regionGroup);
      const cardType = normalize(card.dataset.type);
      const cardGenre = normalize(card.dataset.genre);
      const cardYear = normalize(card.dataset.year);

      const matchesQuery = !query || cardText.includes(query);
      const matchesRegion = !selectedRegion || cardRegion.includes(selectedRegion) || cardRegionGroup === selectedRegion;
      const matchesType = !selectedType || cardType === selectedType;
      const matchesGenre = !selectedGenre || cardGenre.includes(selectedGenre);
      const matchesYear = !selectedYear || cardYear.includes(selectedYear);

      return matchesQuery && matchesRegion && matchesType && matchesGenre && matchesYear;
    }

    function compareCards(a, b) {
      const mode = sort ? sort.value : "default";

      if (mode === "score") {
        return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
      }

      if (mode === "views") {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }

      if (mode === "year") {
        return Number((b.dataset.year || "").match(/\d{4}/)?.[0] || 0) - Number((a.dataset.year || "").match(/\d{4}/)?.[0] || 0);
      }

      if (mode === "title") {
        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
      }

      return 0;
    }

    function apply() {
      let visible = 0;
      const sortedCards = cards.slice().sort(compareCards);

      sortedCards.forEach(function (card) {
        grid.appendChild(card);
        const ok = matchCard(card);
        card.classList.toggle("is-hidden", !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [search, region, type, genre, year, sort].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply);
    });

    reset && reset.addEventListener("click", function () {
      [search, region, type, genre, year, sort].forEach(function (control) {
        if (control) {
          control.value = "";
        }
      });

      if (sort) {
        sort.value = "default";
      }

      apply();
    });

    apply();
  }

  function initPlayer() {
    document.querySelectorAll(".movie-player").forEach(function (shell) {
      const video = shell.querySelector("video");
      const button = shell.querySelector("[data-player-button]");
      const source = shell.dataset.videoSrc;
      let hls = null;
      let initialized = false;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;
        shell.classList.add("is-ready");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          return Promise.resolve();
        }

        video.src = source;
        return Promise.resolve();
      }

      function play() {
        attachSource().then(function () {
          const result = video.play();

          if (result && typeof result.catch === "function") {
            result.catch(function () {
              shell.classList.remove("is-ready");
            });
          }
        });
      }

      button && button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!initialized) {
          play();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initImageFallback() {
    document.addEventListener("error", function (event) {
      const target = event.target;

      if (!target || target.tagName !== "IMG") {
        return;
      }

      target.classList.add("is-missing");

      const holder = target.closest(".poster-wrap, .hero-poster, .overview-card, .detail-poster");
      if (holder) {
        holder.classList.add("has-missing-image");
      }
    }, true);
  }

  ready(function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initFilters();
    initPlayer();
    initImageFallback();
  });
})();
