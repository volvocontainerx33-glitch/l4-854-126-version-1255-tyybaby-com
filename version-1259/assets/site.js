import { H as Hls } from "./vendor/video-player-dru42stk.js";

const demoStreams = [
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8"
];

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMobileMenu() {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}

function setupHeaderSearch() {
  document.querySelectorAll("[data-site-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      const query = input ? input.value.trim() : "";

      if (query) {
        window.location.href = `${form.dataset.searchTarget || "search.html"}?q=${encodeURIComponent(query)}`;
      }
    });
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll(".hero-dot"));

  if (slides.length < 2) {
    return;
  }

  let active = 0;

  function show(index) {
    active = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === active);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === active);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => show(index));
  });

  setInterval(() => show(active + 1), 5600);
}

function setupFilters() {
  const filterRoot = document.querySelector("[data-filter-root]");

  if (!filterRoot) {
    return;
  }

  const cards = Array.from(filterRoot.querySelectorAll("[data-card]"));
  const keyword = document.querySelector("[data-filter-keyword]");
  const type = document.querySelector("[data-filter-type]");
  const year = document.querySelector("[data-filter-year]");
  const region = document.querySelector("[data-filter-region]");
  const empty = document.querySelector("[data-filter-empty]");

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function apply() {
    const keywordValue = normalize(keyword && keyword.value);
    const typeValue = normalize(type && type.value);
    const yearValue = normalize(year && year.value);
    const regionValue = normalize(region && region.value);
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize(card.dataset.searchText);
      const okKeyword = !keywordValue || text.includes(keywordValue);
      const okType = !typeValue || normalize(card.dataset.type) === typeValue;
      const okYear = !yearValue || normalize(card.dataset.year) === yearValue;
      const okRegion = !regionValue || normalize(card.dataset.region).includes(regionValue);
      const show = okKeyword && okType && okYear && okRegion;

      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  [keyword, type, year, region].forEach((control) => {
    if (control) {
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    }
  });

  apply();
}

function setupPlayers() {
  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    const status = player.querySelector("[data-player-status]");
    const playButton = player.querySelector(".play-button");
    const sourceIndex = Number.parseInt(player.dataset.sourceIndex || "0", 10);
    const stream = player.dataset.stream || demoStreams[sourceIndex % demoStreams.length];
    let hls = null;
    let initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    async function start() {
      if (!video) {
        return;
      }

      if (!initialized) {
        initialized = true;
        setStatus("正在初始化 HLS 播放源...");

        if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setStatus("播放源已就绪，正在播放。");
            video.play().catch(() => {
              setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
            });
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data && data.fatal) {
              setStatus("当前播放源加载失败，请检查网络或替换 m3u8 地址。");
              hls.destroy();
              hls = null;
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          setStatus("使用浏览器原生 HLS 播放。");
        } else {
          setStatus("当前浏览器不支持 HLS 播放，请更换浏览器访问。");
          return;
        }
      }

      if (overlay) {
        overlay.style.display = "none";
      }

      video.setAttribute("controls", "controls");
      video.play().catch(() => {
        setStatus("请再次点击播放器开始播放。");
      });
    }

    if (playButton) {
      playButton.addEventListener("click", start);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
  });
}

ready(() => {
  setupMobileMenu();
  setupHeaderSearch();
  setupHero();
  setupFilters();
  setupPlayers();
});
