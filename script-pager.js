(function () {
    "use strict";

    const CURRENT_URL = window.location.href.split('#')[0];
    const map = window.labelMap;
    const groups = window.scrollGroups;
    const grid = document.getElementById('series-cards');

    // --- Build series card(s) using the precomputed scrollGroups index ---
    // (instead of scanning the entire labelMap on every page load)
    function buildSeriesCards() {
        if (!map || !groups || !grid) {
            console.warn('script-pager: labelMap / scrollGroups / #series-cards missing — check script order or markup.');
            return;
        }

        const currentEntry = map[CURRENT_URL];
        const seriesIds = (currentEntry && currentEntry.series && currentEntry.series.length)
            ? currentEntry.series
            : Object.keys(groups); // page not in the map (e.g. index.html) — show everything

        const seen = new Set([CURRENT_URL]);
        const fragment = document.createDocumentFragment();

        seriesIds.forEach(function (seriesId) {
            const urls = groups[seriesId];
            if (!urls || !urls.length) return;

            const ul = document.createElement('ul');

            urls.forEach(function (url) {
                const cleanUrl = url.split('#')[0];
                const entry = map[url];
                if (!entry || seen.has(cleanUrl)) return;
                seen.add(cleanUrl);

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = url;
                a.textContent = entry.title;
                li.appendChild(a);
                ul.appendChild(li);
            });

            if (!ul.children.length) return;

            const card = document.createElement('div');
            card.className = 'card';

            const h3 = document.createElement('h3');
            h3.textContent = (map[seriesId] && map[seriesId].title) || 'Related';
            card.appendChild(h3);
            card.appendChild(ul);

            fragment.appendChild(card);
        });

        grid.appendChild(fragment);
    }

    buildSeriesCards();

    // --- Patch the JSON-LD schema once the relevant links exist in the DOM ---
    function updateSchema() {
        const schemaScript = document.querySelector('#main-schema');
        if (!schemaScript) return;

        let graph;
        try {
            graph = JSON.parse(schemaScript.textContent);
        } catch (e) { return; }

        const nodes = graph["@graph"] ? graph["@graph"] : [graph];
        const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
        if (!mainNode) return;

        const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
        if (isIndexPage) {
            const postsContainer = document.getElementById("modi-posts");
            if (postsContainer) {
                const postLinks = Array.from(postsContainer.querySelectorAll("a"));
                if (postLinks.length) {
                    mainNode.mainEntity = {
                        "@type": "ItemList",
                        "name": "Latest Updated Articles",
                        "itemListElement": postLinks.map((a, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "url": a.href,
                            "name": a.textContent.trim()
                        }))
                    };
                }
            }
        }

        if (grid) {
            const seriesLinks = Array.from(grid.querySelectorAll("a"));
            if (seriesLinks.length) {
                if (mainNode["@type"] === "BlogPosting") {
                    mainNode.hasPart = {
                        "@type": "ItemList",
                        "name": "Related Series Articles",
                        "itemListElement": seriesLinks.map((a, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "url": a.href,
                            "name": a.textContent.trim()
                        }))
                    };
                } else {
                    mainNode.mentions = seriesLinks.map((a) => ({
                        "@type": "CreativeWorkSeries",
                        "name": a.textContent.trim(),
                        "url": a.href
                    }));
                }
            }
        }

        schemaScript.textContent = JSON.stringify(graph, null, 2);
    }

    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";

    if (isIndexPage && document.getElementById('modi-posts')) {
        // Schema needs the latest-posts fetch to finish first.
        // latest-arts.js already fires this event — listen for it instead of guessing a delay.
        let done = false;
        const finish = function () {
            if (done) return;
            done = true;
            updateSchema();
        };
        document.addEventListener('latestPostsReady', finish, { once: true });
        setTimeout(finish, 5000); // safety net if the fetch stalls or errors out silently
    } else {
        // Nothing async to wait for — the series links are already in the DOM.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateSchema, { once: true });
        } else {
            updateSchema();
        }
    }
})();



/**
 * search-popup.js
 * Site-wide popup search modal. Include this script on every page
 * (e.g. from your shared header) and add a trigger button anywhere:
 *
 *   <button id="search-trigger" aria-label="Search">ðŸ”</button>
 *   <script src="/search-popup.js" defer></script>
 *
 * Works from any page depth because searchIndex.json is fetched from
 * the site root ("/searchIndex.json").
 */
(function () {
  const INDEX_URL = "/searchIndex.json";
  const RESULT_LIMIT = 30;

  let indexData = null;
  let indexPromise = null;

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load search index: " + res.status);
        return res.json();
      })
      .then((data) => {
        indexData = data;
        return data;
      })
      .catch((err) => {
        console.error("search-popup:", err);
        indexData = [];
        return indexData;
      });
    return indexPromise;
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #search-popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: none;
        align-items: flex-start;
        justify-content: center;
        z-index: 9999;
        padding: 8vh 1rem 1rem;
      }
      #search-popup-overlay.open {
        display: flex;
      }
      #search-popup-box {
        background: var(--search-popup-bg, #fff);
        color: var(--search-popup-fg, #111);
        width: 100%;
        max-width: 560px;
        max-height: 70vh;
        border-radius: 10px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      #search-popup-input {
        border: none;
        outline: none;
        font-size: 1.1rem;
        padding: 1rem 1.1rem;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        background: transparent;
        color: inherit;
      }
      #search-popup-results {
        list-style: none;
        margin: 0;
        padding: 0.4rem 0;
        overflow-y: auto;
      }
      #search-popup-results li {
        border-bottom: 1px solid rgba(0,0,0,0.06);
      }
      #search-popup-results a {
        display: block;
        padding: 0.65rem 1.1rem;
        text-decoration: none;
        color: inherit;
      }
      #search-popup-results a:hover,
      #search-popup-results a.active {
        background: rgba(0,0,0,0.06);
      }
      #search-popup-empty {
        padding: 1rem 1.1rem;
        opacity: 0.6;
        font-size: 0.95rem;
      }
      #search-popup-close {
        position: absolute;
        top: 8px;
        right: 12px;
        background: none;
        border: none;
        font-size: 1.3rem;
        cursor: pointer;
        color: inherit;
        opacity: 0.6;
      }
      #search-popup-close:hover {
        opacity: 1;
      }
      @media (prefers-color-scheme: dark) {
        #search-popup-box {
          background: var(--search-popup-bg, #1c1c1c);
          color: var(--search-popup-fg, #eee);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    const overlay = document.createElement("div");
    overlay.id = "search-popup-overlay";
    overlay.innerHTML = `
      <div id="search-popup-box" role="dialog" aria-modal="true" aria-label="Site search">
        <button id="search-popup-close" aria-label="Close search">âœ•</button>
        <input id="search-popup-input" type="text" placeholder="Enter Keyword or Bible Reference ..." autocomplete="off">
        <ul id="search-popup-results"></ul>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function search(query) {
    if (!indexData || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const scored = [];

    for (const page of indexData) {
      const title = (page.title || "").toLowerCase();
      const content = (page.content || "").toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 10;
      if (content.includes(q)) score += 1;
      if (score > 0) scored.push({ page, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, RESULT_LIMIT).map((s) => s.page);
  }

  function renderResults(listEl, results, query) {
    listEl.innerHTML = "";
    if (!query.trim()) return;

    if (results.length === 0) {
      const li = document.createElement("li");
      li.id = "search-popup-empty";
      li.textContent = "No results found.";
      listEl.appendChild(li);
      return;
    }

    for (const page of results) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "/" + page.url.replace(/^\/+/, "");
      a.textContent = page.title;
      li.appendChild(a);
      listEl.appendChild(li);
    }
  }

  function init() {
    injectStyles();
    const overlay = injectMarkup();
    const input = overlay.querySelector("#search-popup-input");
    const resultsList = overlay.querySelector("#search-popup-results");
    const closeBtn = overlay.querySelector("#search-popup-close");

    function open() {
      overlay.classList.add("open");
      loadIndex();
      input.value = "";
      resultsList.innerHTML = "";
      setTimeout(() => input.focus(), 0);
      document.addEventListener("keydown", onKeydown);
    }

    function close() {
      overlay.classList.remove("open");
      document.removeEventListener("keydown", onKeydown);
    }

    function onKeydown(e) {
      if (e.key === "Escape") close();
    }

    input.addEventListener("input", () => {
      loadIndex().then(() => {
        const results = search(input.value);
        renderResults(resultsList, results, input.value);
      });
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);

    // Wire up any trigger element(s) already on the page.
    document.querySelectorAll("#search-trigger, [data-search-trigger]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        open();
      });
    });

    // Global shortcut: press "/" anywhere (outside inputs) to open search.
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !overlay.classList.contains("open")) {
        const tag = document.activeElement.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          open();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
