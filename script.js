

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SETTINGS ---
  const workerBase = "https://like-button-worker.hhnnh-me.workers.dev";

  // Derive a unique key from the current page path
  // e.g. "/blog/my-post/"  "hasLiked_/blog/my-post/"
  const pageKey = window.location.pathname;
  const localStorageKey = `hasLiked_${pageKey}`;

  // Pass the page slug as a query param so the worker knows which counter to use
  const workerUrl = `${workerBase}?page=${encodeURIComponent(pageKey)}`;

  const userHasLiked = localStorage.getItem(localStorageKey);

  // --- 2. THE LIKE BUTTON INJECTION ---
  document.querySelectorAll('.share-dropdown').forEach(linkContainer => {
    if (
      linkContainer.previousElementSibling &&
      linkContainer.previousElementSibling.classList.contains('like-btn')
    ) return;

    const likeBtn = document.createElement('div');
    likeBtn.className = 'like-btn';

    const heartHTML = (count) =>
      `<span class="heart">&#9829;</span> <span class="like-count">${count}</span>`;

    likeBtn.innerHTML = heartHTML('...');

    if (userHasLiked) {
      likeBtn.style.opacity = "0.6";
      likeBtn.style.pointerEvents = "none";
    }

    linkContainer.insertAdjacentElement('beforebegin', likeBtn);
    const countSpan = likeBtn.querySelector('.like-count');

    // Fetch count for THIS page
    fetch(workerUrl)
      .then(res => res.text())
      .then(data => { countSpan.innerText = data; })
      .catch(() => { countSpan.innerText = "0"; });

    // Like Logic
    likeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (localStorage.getItem(localStorageKey)) return;

      localStorage.setItem(localStorageKey, 'true');
      likeBtn.style.opacity = "0.6";
      likeBtn.style.pointerEvents = "none";

      try {
        const res = await fetch(workerUrl, { method: 'POST' });
        const newVal = await res.text();
        countSpan.innerText = newVal;
      } catch (err) {
        // Rollback if request failed
        localStorage.removeItem(localStorageKey);
        likeBtn.style.opacity = "1";
        likeBtn.style.pointerEvents = "auto";
      }
    });
  });

  // --- 3. THE SHARE MENU LOGIC ---
  const shareButton = document.querySelector(".share-button");
  const shareMenu = document.getElementById("share-menu");

  if (shareButton && shareMenu) {
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    const twitter = document.getElementById("share-twitter");
    if (twitter) twitter.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

    const facebook = document.getElementById("share-facebook");
    if (facebook) facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

    const copyButton = document.getElementById("share-copy");
    if (copyButton) {
      copyButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
        shareMenu.style.display = "none";
      });
    }

    shareButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = shareMenu.style.display === "block";
      shareMenu.style.display = isVisible ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!shareMenu.contains(e.target) && e.target !== shareButton) {
        shareMenu.style.display = "none";
      }
    });
  }
});

// --- 4. LAST UPDATED DATE ---
  const dateMeta = document.querySelector('meta[name="date-modified"]');
  const shareDropdown = document.querySelector('.share-dropdown');

  if (dateMeta && shareDropdown) {
    const date = new Date(dateMeta.content);
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const dateEl = document.createElement('p');
    dateEl.className = 'date-modified-display';
    dateEl.textContent = `Last updated: ${formatted}`;

    shareDropdown.insertAdjacentElement('beforebegin', dateEl);
  }








document.addEventListener("DOMContentLoaded", function () {
    const footer = document.querySelector(".start-here");

    if (footer) {
        // We add inline CSS to ensure it stays on top of other elements
        footer.insertAdjacentHTML(
            "afterend",
            '<div id="verse-link-container">' +
                '<div id="verse-left"><a href="https://linguadivina.uk/yhvh-ehyeh-linguistic-framework.html"><img loading="lazy" width="346" height="345" class="key-icon" alt="Lingua Divina Logo" src="/images/icons/lingua-divina-bible-key-logo.webp"></a></div>' +
                '<div id="verse-right">' +
                    '<a href="https://linguadivina.uk/yhvh-ehyeh-linguistic-framework.html">Lingua Divina — <small>Bible passage and verse translator using Genesis logic.</small></a>' +
                '</div>' +
            '</div>'
        );

        const link = document.getElementById("translator-link");

        if (link) {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                const targetUrl = this.href;

                // Fire GA4 if it exists
                if (typeof gtag === "function") {
                    gtag("event", "Bible_Translator_Link", {
                        event_category: "Button",
                        event_label: "Bible_Translator_Link",
                    });
                }

                // Just go. 100ms is plenty for the tag to fire.
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 50);
            });
        }
    }
});
 
 
 
 
/**
 * script-toc.js
 * Scans an article for H2/H3 headings, assigns slug IDs (if missing),
 * and inserts a nested "Jump to" navigation list at the top of the article.
 */
(function () {
  "use strict";

  // Skip the TOC on the homepage and the bible index page
  const path = window.location.pathname;
  const skipPaths = [
    "/",
    "/index.html",
    "/index.htm",
    "/search.html",
    "/404.html",
    "/bible-reference/bible-index.html"
  ];
  if (skipPaths.includes(path)) return;

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function uniqueId(base, used) {
    let id = base || "section";
    let n = 2;
    while (used.has(id)) {
      id = base + "-" + n;
      n++;
    }
    used.add(id);
    return id;
  }

  function buildTOC() {
    const root =
      document.querySelector("article") ||
      document.querySelector("main.content") ||
      document.body;

    const headings = root.querySelectorAll("h2, h3");
    if (!headings.length) return;

    const usedIds = new Set(
      Array.from(document.querySelectorAll("[id]")).map((el) => el.id)
    );

    const tocList = document.createElement("ul");
    tocList.className = "toc-jump-links";

    let currentH2Item = null;
    let currentSubList = null;

    headings.forEach((heading) => {
      if (!heading.id) {
        const base = slugify(heading.textContent);
        heading.id = uniqueId(base, usedIds);
      } else {
        usedIds.add(heading.id);
      }

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + heading.id;
      a.textContent = heading.textContent;
      li.appendChild(a);

      if (heading.tagName === "H2") {
        tocList.appendChild(li);
        currentH2Item = li;
        currentSubList = null;
      } else if (heading.tagName === "H3") {
        if (!currentH2Item) {
          tocList.appendChild(li);
          return;
        }
        if (!currentSubList) {
          currentSubList = document.createElement("ul");
          currentSubList.className = "toc-jump-sublist";
          currentH2Item.appendChild(currentSubList);
        }
        currentSubList.appendChild(li);
      }
    });

    const nav = document.createElement("details");
    nav.className = "toc-jump-nav";
    nav.setAttribute("aria-label", "Jump to section");

    const summary = document.createElement("summary");
    summary.className = "toc-jump-heading";
    summary.textContent = "Jump to a section";

    nav.appendChild(summary);
    nav.appendChild(tocList);

    // Insert directly above the first direct-child <p> of root; else at top of root.
    const firstParagraph = Array.from(root.children).find(
      (el) => el.tagName === "P"
    );

    if (firstParagraph) {
      firstParagraph.insertAdjacentElement("beforebegin", nav);
    } else {
      root.insertAdjacentElement("afterbegin", nav);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildTOC);
  } else {
    buildTOC();
  }
})();
 
 
 
 
 