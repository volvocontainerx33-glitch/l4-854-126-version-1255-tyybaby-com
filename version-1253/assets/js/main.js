(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = index;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === active);
      });
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        showSlide(idx);
      });
    });
    window.setInterval(function () {
      showSlide((active + 1) % slides.length);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-card-filter]');
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
    var empty = document.querySelector('[data-empty-state]');
    filterInput.addEventListener('input', function () {
      var q = filterInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var matched = !q || card.getAttribute('data-search').indexOf(q) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    });
  }

  var setupPlayers = function () {
    Array.prototype.slice.call(document.querySelectorAll('video[data-stream]')).forEach(function (video) {
      var stream = video.getAttribute('data-stream');
      var shell = video.closest('.player-shell');
      var overlay = shell ? shell.querySelector('.play-overlay') : null;
      var attached = false;
      var hlsInstance = null;
      var attach = function () {
        if (attached || !stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        attached = true;
      };
      var start = function () {
        attach();
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      };
      if (overlay) {
        overlay.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
      video.addEventListener('emptied', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
        hlsInstance = null;
        attached = false;
      });
    });
  };
  setupPlayers();

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var regionSelect = document.querySelector('[data-region-select]');
  var typeSelect = document.querySelector('[data-type-select]');
  var searchResults = document.querySelector('[data-search-results]');
  if (searchForm && searchInput && searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    var render = function () {
      var q = searchInput.value.trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var results = window.SEARCH_MOVIES.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
        var okText = !q || text.indexOf(q) !== -1;
        var okRegion = !region || item.region.indexOf(region) !== -1;
        var okType = !type || item.type.indexOf(type) !== -1;
        return okText && okRegion && okType;
      }).slice(0, 80);
      if (!results.length) {
        searchResults.innerHTML = '<div class="empty-state" style="display:block">没有找到匹配影片</div>';
        return;
      }
      searchResults.innerHTML = results.map(function (item) {
        return '<a class="movie-card" href="' + item.url + '">' +
          '<figure class="card-poster"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></figure>' +
          '<div class="card-content"><div class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</div>' +
          '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="card-tags"><span>' + escapeHtml(item.genre.split(/[，,、/]/)[0] || item.type) + '</span></div></div></a>';
      }).join('');
    };
    var escapeHtml = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (ch) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[ch];
      });
    };
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    [searchInput, regionSelect, typeSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', render);
        el.addEventListener('change', render);
      }
    });
    render();
  }
})();
