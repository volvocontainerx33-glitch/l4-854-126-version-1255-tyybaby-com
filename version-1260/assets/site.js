(() => {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const menuPanel = document.querySelector("[data-menu-panel]");

    if (menuButton && menuPanel) {
        menuButton.addEventListener("click", () => {
            menuPanel.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        const show = index => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(() => show(current + 1), 5000);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    document.querySelectorAll("[data-filter]").forEach(panel => {
        const scope = panel.closest("[data-catalog]") || document;
        const input = panel.querySelector("[data-search-input]");
        const year = panel.querySelector("[data-year-filter]");
        const type = panel.querySelector("[data-type-filter]");
        const cards = Array.from(scope.querySelectorAll("[data-card]"));

        const apply = () => {
            const keyword = (input?.value || "").trim().toLowerCase();
            const yearValue = year?.value || "";
            const typeValue = type?.value || "";

            cards.forEach(card => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.tags,
                    card.dataset.year
                ].join(" ").toLowerCase();
                const matchKeyword = !keyword || haystack.includes(keyword);
                const matchYear = !yearValue || card.dataset.year === yearValue;
                const matchType = !typeValue || card.dataset.type === typeValue;
                const target = card.closest("li") || card;
                target.classList.toggle("hidden-card", !(matchKeyword && matchYear && matchType));
            });
        };

        [input, year, type].forEach(control => {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q && input) {
            input.value = q;
            apply();
        }
    });

    document.querySelectorAll("[data-player]").forEach(player => {
        const video = player.querySelector("video");
        const button = player.querySelector(".play-overlay");
        const stream = player.getAttribute("data-stream");
        let attached = false;

        const attach = () => {
            if (attached || !video || !stream) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }

            video.src = stream;
        };

        const start = () => {
            attach();
            player.classList.add("is-playing");
            video.controls = true;
            const playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(() => {
                    player.classList.remove("is-playing");
                });
            }
        };

        if (button && video) {
            button.addEventListener("click", start);
            video.addEventListener("click", () => {
                if (video.paused) {
                    start();
                }
            });
        }
    });
})();
