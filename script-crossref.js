// script-crossref.js
// On article load: fetch searchIndex.json, then scan the page's content for
// any words/phrases that match another page's title (e.g. "Babel") and turn
// the first occurrence into a link to that page — a lightweight, automatic
// "see also" cross-reference system built from the same index used by search.

(function () {
  const INDEX_URL = "/searchIndex.json";           // adjust path if served elsewhere
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
