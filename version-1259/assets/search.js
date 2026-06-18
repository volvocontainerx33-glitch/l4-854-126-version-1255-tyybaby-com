import { movies } from "./movies-data.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function renderMovie(movie) {
  return `
    <article class="movie-card">
      <a class="card-cover" href="${escapeHtml(movie.url)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="badge card-badge">${escapeHtml(movie.type)}</span>
        <span class="card-year">${escapeHtml(movie.year)}</span>
      </a>
      <div class="card-body">
        <h2 class="card-title"><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h2>
        <p class="card-line">${escapeHtml(movie.oneLine)}</p>
        <div class="card-meta">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.genre)}</span>
        </div>
      </div>
    </article>
  `;
}

function getQueryParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

function runSearch(query) {
  const trimmed = normalize(query);

  if (!trimmed) {
    return movies.slice(0, 80);
  }

  return movies.filter((movie) => {
    const text = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      ...(movie.tags || [])
    ].join(" "));

    return text.includes(trimmed);
  }).slice(0, 300);
}

function init() {
  const input = document.querySelector("[data-search-input]");
  const result = document.querySelector("[data-search-result]");
  const count = document.querySelector("[data-search-count]");
  const form = document.querySelector("[data-search-form]");
  const initialQuery = getQueryParam();

  if (!input || !result) {
    return;
  }

  input.value = initialQuery;

  function apply() {
    const items = runSearch(input.value);
    result.innerHTML = items.map(renderMovie).join("");

    if (count) {
      count.textContent = input.value.trim()
        ? `找到 ${items.length} 条相关影片，最多显示前 300 条。`
        : `默认展示 ${items.length} 条影片，可输入片名、类型、地区、年份或标签搜索。`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
    window.history.replaceState(null, "", url);
    apply();
  });

  input.addEventListener("input", apply);
  apply();
}

document.addEventListener("DOMContentLoaded", init);
