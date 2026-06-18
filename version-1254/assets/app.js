(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var region = document.querySelector('[data-filter-region]');
        var year = document.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var count = document.querySelector('[data-result-count]');
        var empty = document.querySelector('[data-empty-state]');

        if (!cards.length || (!input && !region && !year)) {
            return;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var shouldShow = matchKeyword && matchRegion && matchYear;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var results = document.getElementById('searchResults');
        var status = document.querySelector('[data-search-status]');

        if (!form || !results || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var input = form.querySelector('input[name="q"]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function cardTemplate(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '' +
                '<article class="movie-card" data-card>' +
                    '<a href="' + escapeHtml(movie.link) + '" class="movie-card-link" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                        '<div class="movie-poster">' +
                            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                            '<span class="score-pill">' + escapeHtml(String(movie.score)) + '</span>' +
                        '</div>' +
                        '<div class="movie-card-body">' +
                            '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                            '<h3>' + escapeHtml(movie.title) + '</h3>' +
                            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                            '<div class="tag-row">' + tags + '</div>' +
                        '</div>' +
                    '</a>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function runSearch(query) {
            var keyword = query.trim().toLowerCase();
            var pool = window.MOVIE_SEARCH_DATA;
            var matches = keyword ? pool.filter(function (movie) {
                return [movie.title, movie.region, movie.year, movie.genre, movie.type, movie.oneLine, (movie.tags || []).join(' ')]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(keyword) !== -1;
            }) : pool.slice(0, 18);

            results.innerHTML = matches.slice(0, 120).map(cardTemplate).join('');
            if (status) {
                status.textContent = keyword ? '找到 ' + matches.length + ' 部相关影片，当前显示前 120 部。' : '可直接输入关键词进行筛选。';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var nextUrl = query ? window.location.pathname + '?q=' + encodeURIComponent(query) : window.location.pathname;
            window.history.replaceState(null, '', nextUrl);
            runSearch(query);
        });

        input.addEventListener('input', function () {
            runSearch(input.value);
        });

        runSearch(initial);
    }

    function setupPlayer() {
        var video = document.getElementById('moviePlayer');
        var overlay = document.querySelector('[data-play-target="#moviePlayer"]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;

        function attachSource() {
            return new Promise(function (resolve, reject) {
                if (!source) {
                    reject(new Error('missing source'));
                    return;
                }

                if (video.getAttribute('data-source-bound') === 'true') {
                    resolve();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.setAttribute('data-source-bound', 'true');
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                            reject(new Error('hls fatal error'));
                        }
                    });
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.setAttribute('data-source-bound', 'true');
                    resolve();
                    return;
                }

                video.src = source;
                video.setAttribute('data-source-bound', 'true');
                resolve();
            });
        }

        function playVideo() {
            attachSource().then(function () {
                return video.play();
            }).catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
}());
