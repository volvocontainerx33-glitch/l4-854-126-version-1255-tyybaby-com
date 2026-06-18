(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });
    show(0);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
  }

  function setupFilters() {
    var toolbars = Array.prototype.slice.call(document.querySelectorAll(".toolbar"));
    toolbars.forEach(function (toolbar) {
      var fields = Array.prototype.slice.call(toolbar.querySelectorAll(".site-filter"));
      var scope = document.querySelector(toolbar.getAttribute("data-target") || ".movie-grid");
      if (!fields.length || !scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      function apply() {
        var text = "";
        var region = "";
        var type = "";
        var year = "";
        fields.forEach(function (field) {
          var key = field.getAttribute("data-filter");
          var value = (field.value || "").trim().toLowerCase();
          if (key === "text") {
            text = value;
          }
          if (key === "region") {
            region = value;
          }
          if (key === "type") {
            type = value;
          }
          if (key === "year") {
            year = value;
          }
        });
        cards.forEach(function (card) {
          var ok = true;
          if (text && textOf(card).indexOf(text) === -1) {
            ok = false;
          }
          if (region && (card.getAttribute("data-region") || "").toLowerCase() !== region) {
            ok = false;
          }
          if (type && (card.getAttribute("data-type") || "").toLowerCase() !== type) {
            ok = false;
          }
          if (year && (card.getAttribute("data-year") || "").toLowerCase() !== year) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
        });
      }
      fields.forEach(function (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });
    });
  }

  function cardHtml(movie) {
    var tags = (movie.tags || "").split(" ").filter(Boolean).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeAttr(movie.title) + "\" data-region=\"" + escapeAttr(movie.region) + "\" data-type=\"" + escapeAttr(movie.type) + "\" data-year=\"" + escapeAttr(movie.year) + "\" data-genre=\"" + escapeAttr(movie.genre) + "\" data-tags=\"" + escapeAttr(movie.tags || "") + "\">",
      "<a class=\"movie-poster\" href=\"./" + movie.url + "\"><img src=\"./" + movie.cover + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\"></a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.year) + "</div>",
      "<h3><a href=\"./" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>]/g, function (char) {
      return {"&": "&amp;", "<": "&lt;", ">": "&gt;"}[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function setupSearchPage() {
    var page = document.querySelector(".search-page");
    var results = document.querySelector(".search-results");
    var input = document.querySelector(".search-input");
    if (!page || !results || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var query = input.value.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 96);
      if (!list.length) {
        results.innerHTML = "<div class=\"empty-note\">暂无匹配影片</div>";
        return;
      }
      results.innerHTML = "<div class=\"movie-grid\">" + list.map(cardHtml).join("") + "</div>";
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
