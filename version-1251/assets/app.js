(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(heroIndex - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(heroIndex + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
      startHero();
    });
  });

  showHero(0);
  startHero();

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function fillFilterOptions() {
    if (!cards.length) {
      return;
    }

    if (yearSelect && yearSelect.options.length <= 1) {
      var years = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      }).filter(Boolean))).sort().reverse();

      years.slice(0, 80).forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    if (typeSelect && typeSelect.options.length <= 1) {
      var types = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-type') || '';
      }).filter(Boolean))).sort();

      types.slice(0, 80).forEach(function (type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput && filterInput.value);
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchType = !type || card.getAttribute('data-type') === type;
      card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchType));
    });
  }

  fillFilterOptions();

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener('input', applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', applyFilters);
  }

  applyFilters();

  function bindPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var source = shell.getAttribute('data-video-url');
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      ready = true;
    }

    function play() {
      prepare();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bindPlayer);
})();
