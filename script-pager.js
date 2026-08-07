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



// script-crossref.js
// On article load: fetch searchIndex.json, then scan the page's content for
// any words/phrases that match another page's title (e.g. "Babel") and turn
// the first occurrence into a clickable/hoverable term. Hovering or clicking
// a term pops up a small list of every page whose title matched that term
// (there can be more than one — e.g. "Babel" might match both "Tower of
// Babel" and "Babel (Confusion of Tongues)").
//
// Terms come from two sources per page:
//   1. The page's title (full title + individual significant words) — as before.
//   2. Proper-noun words/phrases that repeat 2+ times in the page's `content`
//      field — these are treated as "significant" to that page, on the
//      theory that a term mentioned only once is incidental, but one
//      repeated several times is actually about something. This is what
//      lets two articles get cross-linked because they both meaningfully
//      discuss the same term, not just because one mentions the other's title.

(function () {
  const INDEX_URL = "https://linguadivina.uk/searchIndex.json";           // adjust path if served elsewhere
  const CONTENT_SELECTOR = "article, .post-content, main, .container";
  const SKIP_TAGS = new Set(["A", "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);

  // Any element matching one of these (or nested inside one) is left alone —
  // add more as needed, e.g. ".sidebar", ".related-posts", "nav".
  const EXCLUDE_SELECTORS = [".breadcrumb", ".footer", ".header", "h1", "h2", "h3", "blockquote", "noTag", "nav"];

  const MIN_TITLE_LENGTH = 3;                       // skip too-short/noisy titles
  const MIN_WORD_LENGTH = 4;                        // skip short/generic single words
  const MIN_CONTENT_REPEATS = 2;                    // a content term must repeat at least this many times to count
  const MAX_TERM_PAGES = 10;                        // a term used on more pages than this is treated as generic site vocabulary, not a real connection, and excluded

  // Small connector words that shouldn't become standalone link terms on
  // their own, even though they're common inside titles/phrases.
  const STOPWORDS = new Set([
    "the", "a", "an", "of", "in", "on", "and", "to", "for", "from", "is",
    "are", "was", "were", "be", "with", "by", "as", "at", "that", "this", "every", "named", "first", "only", "already", "assume", "through", "whose",
    "it", "its", "his", "her", "their", "our", "your", "my", "or", "but",
    "not", "no", "so", "into", "about", "when", "who", "what", "how", "receives", "does", "already", "before", "identity", "divided", "runs", "assumed", "encoded", "itself", "sets", "fully", "calls", "holds", "gives", "mechanism", "different", "story", "enforce", "enforces", "same"
  ]);

  // Matches sequences of capitalized words — allows the phrase to continue
  // through a lowercase connector ("of", "the") or a chapter:verse number
  // (e.g. "Genesis 1:1"), so multi-word proper nouns stay intact.
  const CONTENT_TERM_PATTERN = /\b([A-Z][a-zA-Z']*(?:\s+(?:[A-Z][a-zA-Z']*|[0-9]+:[0-9]+|of|the))*)/g;

  // Filled in by buildTerms(); looked up by index when a popup opens.
  let allTerms = [];

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function currentPagePath() {
    // Matches the "url" format written by the Python script (relative to /posts/)
    return window.location.pathname.replace(/^\//, "");
  }

  async function loadIndex() {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error("Could not load search index: " + res.status);
    return res.json();
  }

  // Extracts capitalized words/phrases from a page's content field and
  // returns only the ones that repeat at least MIN_CONTENT_REPEATS times —
  // these are treated as "significant" to that page.
  function significantContentTerms(content) {
    if (!content) return [];
    const counts = new Map();
    const matches = content.match(CONTENT_TERM_PATTERN) || [];
    for (const raw of matches) {
      const term = raw.trim();
      if (!term) continue;
      counts.set(term, (counts.get(term) || 0) + 1);
    }

    const out = [];
    for (const [term, count] of counts) {
      if (count < MIN_CONTENT_REPEATS) continue;
      if (!term.includes(" ")) {
        // Single word: apply the same length/stopword filter used for title words.
        if (term.length < MIN_WORD_LENGTH) continue;
        if (STOPWORDS.has(term.toLowerCase())) continue;
      } else if (term.length < MIN_TITLE_LENGTH) {
        continue;
      }
      out.push(term);
    }
    return out;
  }

  // Builds a de-duplicated list of { text, matches: [{ url, title }] }.
  // Terms that match more than one page keep ALL of those pages (rather
  // than only the first page encountered), so the popup can list every match.
  function buildTerms(pages) {
    const here = currentPagePath();
    const termMap = new Map(); // key: lowercase term -> { text, matches: [] }

    function addTerm(text, page) {
      const key = text.toLowerCase();
      if (!termMap.has(key)) {
        termMap.set(key, { text, matches: [] });
      }
      const entry = termMap.get(key);
      if (!entry.matches.some(m => m.url === page.url)) {
        entry.matches.push({ url: page.url, title: page.title });
      }
    }

    for (const page of pages) {
      if (!page.title || !page.url) continue;
      if (page.url === here) continue;              // don't link a page to itself
      const title = page.title.trim();
      if (title.length < MIN_TITLE_LENGTH) continue;

      // Full title as one phrase, e.g. "Tower of Babel"
      addTerm(title, page);

      // Individual significant words from the title, e.g. "Tower", "Babel" —
      // so body text mentioning just "Babel" can still surface the
      // "Tower of Babel" page even though it never spells out the full title.
      // Only capitalized words are used (proper-noun heuristic) so generic
      // words like "great" or "water" don't get pulled in as link terms.
      const words = title.split(/[^A-Za-z0-9']+/).filter(Boolean);
      for (const word of words) {
        if (word.length < MIN_WORD_LENGTH) continue;
        if (STOPWORDS.has(word.toLowerCase())) continue;
        if (word[0] !== word[0].toUpperCase()) continue; // skip lowercase words
        addTerm(word, page);
      }

      // Terms that repeat 2+ times in this page's content — treated as
      // "significant" to the page even if they never appear in its title.
      for (const term of significantContentTerms(page.content)) {
        addTerm(term, page);
      }
    }

    // Drop terms that appear on more pages than MAX_TERM_PAGES — these are
    // generic vocabulary for the site as a whole (e.g. a recurring theme
    // word used almost everywhere) rather than a meaningful connection
    // between two specific articles.
    const filtered = Array.from(termMap.values()).filter(t => t.matches.length <= MAX_TERM_PAGES);

    // Longest terms first, so full phrases are tried before their component
    // words (e.g. "Tower of Babel" the phrase before lone "Tower").
    filtered.sort((a, b) => b.text.length - a.text.length);
    return filtered;
  }

  function linkFirstMatch(root, term, termIdx) {
    const pattern = new RegExp(`\\b(${escapeRegex(term.text)})\\b`, "i");

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !pattern.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        let el = node.parentElement;
        while (el && el !== root) {
          if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
          if (EXCLUDE_SELECTORS.some(sel => el.matches(sel))) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const node = walker.nextNode();
    if (!node) return false; // no eligible match for this term

    const match = pattern.exec(node.nodeValue);
    const before = node.nodeValue.slice(0, match.index);
    const matchedText = match[0];
    const after = node.nodeValue.slice(match.index + matchedText.length);

    const span = document.createElement("span");
    span.className = "cross-ref";
    span.textContent = matchedText;
    span.tabIndex = 0;
    span.setAttribute("role", "button");
    span.setAttribute("aria-haspopup", "true");
    span.dataset.termIdx = String(termIdx);

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    frag.appendChild(span);
    if (after) frag.appendChild(document.createTextNode(after));

    node.parentNode.replaceChild(frag, node);
    return true;
  }

  function highlightAll(root, terms) {
    terms.forEach((term, idx) => {
      linkFirstMatch(root, term, idx);
    });
  }

  // ---- Popup ----

  let popupEl = null;

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .cross-ref {
        cursor: pointer;
        border-bottom: 1px dotted currentColor;
      }
      .cross-ref-popup {
        position: absolute;
        z-index: 1000;
        background: #fff;
        color: #111;
        border: 1px solid rgba(0,0,0,0.15);
        border-radius: 6px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        padding: 4px 0;
        max-width: 200px;
        box-sizing: border-box;
        font-size: 0.75rem;
        line-height: 1.3;
        display: none;
      }
      .cross-ref-popup.open { display: block; }
      .cross-ref-popup ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .cross-ref-popup li a {
        display: block;
        padding: 4px 10px;
        text-decoration: none;
        color: inherit;
        white-space: normal;
        word-break: break-word;
      }
      .cross-ref-popup li a:hover,
      .cross-ref-popup li a:focus {
        background: rgba(0,0,0,0.06);
      }
      /* Dark mode — matches the html.dark / html.light classes set by
         script-dark-light.js. If your site's dark theme uses different
         colors, tweak these two values to match. */
      html.dark .cross-ref-popup {
        background: #1e1e1e;
        color: #eee;
        border-color: rgba(255,255,255,0.15);
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      }
      html.dark .cross-ref-popup li a:hover,
      html.dark .cross-ref-popup li a:focus {
        background: rgba(255,255,255,0.1);
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePopup() {
    if (popupEl) return popupEl;
    popupEl = document.createElement("div");
    popupEl.className = "cross-ref-popup";
    document.body.appendChild(popupEl);
    return popupEl;
  }

  function closePopup() {
    if (popupEl) popupEl.classList.remove("open");
  }

  function openPopupFor(span, term) {
    const popup = ensurePopup();
    popup.innerHTML = "";

    const list = document.createElement("ul");
    term.matches.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "/" + m.url;
      a.textContent = m.title;
      li.appendChild(a);
      list.appendChild(li);
    });
    popup.appendChild(list);

    // Open (but stay invisible) first so we can measure its real width
    // before positioning it — avoids a flash at the wrong spot.
    popup.style.visibility = "hidden";
    popup.classList.add("open");

    const rect = span.getBoundingClientRect();
    const popupWidth = popup.offsetWidth;
    const margin = 8; // keep clear of the viewport edge

    let left = rect.left + window.scrollX;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - popupWidth - margin;
    const minLeft = window.scrollX + margin;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    popup.style.left = left + "px";
    popup.style.top = (rect.bottom + window.scrollY + 4) + "px";
    popup.style.visibility = "visible";
  }

  function setupPopupHandlers() {
    document.addEventListener("click", (e) => {
      const span = e.target.closest(".cross-ref");
      if (span) {
        e.stopPropagation();
        const idx = Number(span.dataset.termIdx);
        const term = allTerms[idx];
        if (term) openPopupFor(span, term);
        return;
      }
      if (popupEl && !popupEl.contains(e.target)) closePopup();
    });

    document.addEventListener("mouseover", (e) => {
      const span = e.target.closest(".cross-ref");
      if (!span) return;
      const idx = Number(span.dataset.termIdx);
      const term = allTerms[idx];
      if (term) openPopupFor(span, term);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopup();
      if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("cross-ref")) {
        e.preventDefault();
        const idx = Number(e.target.dataset.termIdx);
        const term = allTerms[idx];
        if (term) openPopupFor(e.target, term);
      }
    });
  }

  async function init() {
    const container = document.querySelector(CONTENT_SELECTOR);
    if (!container) return;
    try {
      injectStyles();
      setupPopupHandlers();
      const pages = await loadIndex();
      allTerms = buildTerms(pages);
      highlightAll(container, allTerms);
    } catch (err) {
      console.warn("Cross-reference linking skipped:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

