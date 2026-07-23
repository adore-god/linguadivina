document.addEventListener('click', (e) => {
  document.querySelectorAll('.link-dropdown.open').forEach(dropdown => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}); 

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SETTINGS ---
  const workerBase = "https://like-button-worker.hnnh.workers.dev";

 
  const pageKey = window.location.pathname;
  const localStorageKey = `hasLiked_${pageKey}`;


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

  // --- 3. SHARE MENU
  
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
    });
  }
});




// --- 4. LAST UPDATED DATE ---
  const dateMeta = document.querySelector('meta[name="date-modified"]');
  const shareDropdown = document.querySelector('.footer');

  if (dateMeta && shareDropdown) {
    const date = new Date(dateMeta.content);
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const dateEl = document.createElement('p');
    dateEl.className = 'date-modified-display';
    dateEl.textContent = `Page last updated: ${formatted}`;

    shareDropdown.insertAdjacentElement('beforebegin', dateEl);
  }


 
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
