(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      stopHero();
      showSlide(index);
      startHero();
    });
  });

  var stage = document.querySelector(".hero-stage");

  if (stage) {
    stage.addEventListener("mouseenter", stopHero);
    stage.addEventListener("mouseleave", startHero);
  }

  showSlide(0);
  startHero();

  var searchInput = document.querySelector("[data-search-input]");
  var selectInput = document.querySelector("[data-category-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var selected = selectInput ? selectInput.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-region") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();

      var category = card.getAttribute("data-category") || "";
      var matchTerm = !term || haystack.indexOf(term) !== -1;
      var matchCategory = !selected || category === selected;
      var show = matchTerm && matchCategory;

      card.style.display = show ? "" : "none";

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }

  if (selectInput) {
    selectInput.addEventListener("change", filterCards);
  }

  filterCards();
})();
