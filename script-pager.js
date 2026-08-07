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
// the first occurrence into a link to that page — a lightweight, automatic
// "see also" cross-reference system built from the same index used by search.

(function () {
  const INDEX_URL = "https://linguadivina.uk/searchIndex.json";           // adjust path if served elsewhere
  const CONTENT_SELECTOR = "article, .post-content, main, .container";
  const SKIP_TAGS = new Set(["A", "SCRIPT", "STYLE", "H1", "NOSCRIPT", "TEXTAREA"]);
  const MIN_TITLE_LENGTH = 3;                       // skip too-short/noisy titles

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

  function buildTerms(pages) {
    const here = currentPagePath();
    const terms = [];
    for (const page of pages) {
      if (!page.title || !page.url) continue;
      if (page.url === here) continue;              // don't link a page to itself
      const title = page.title.trim();
      if (title.length < MIN_TITLE_LENGTH) continue;
      terms.push({ title, url: page.url });
    }
    // Longest titles first, so e.g. "Tower of Babel" is tried before "Babel"
    terms.sort((a, b) => b.title.length - a.title.length);
    return terms;
  }

  function linkFirstMatch(root, title, url) {
    const pattern = new RegExp(`\\b(${escapeRegex(title)})\\b`, "i");

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !pattern.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        let el = node.parentElement;
        while (el && el !== root) {
          if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
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

    const link = document.createElement("a");
    link.href = "/" + url;
    link.className = "cross-ref";
    link.textContent = matchedText;

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    frag.appendChild(link);
    if (after) frag.appendChild(document.createTextNode(after));

    node.parentNode.replaceChild(frag, node);
    return true;
  }

  function highlightAll(root, terms) {
    for (const { title, url } of terms) {
      linkFirstMatch(root, title, url);
    }
  }

  async function init() {
    const container = document.querySelector(CONTENT_SELECTOR);
    if (!container) return;
    try {
      const pages = await loadIndex();
      const terms = buildTerms(pages);
      highlightAll(container, terms);
    } catch (err) {
      console.warn("Cross-reference linking skipped:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
