

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SETTINGS ---
  const workerBase = "https://like-button-worker.linguadivina.workers.dev";

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








document.addEventListener("DOMContentLoaded", function () {
    const footer = document.querySelector(".start-here");

    if (footer) {
        // We add inline CSS to ensure it stays on top of other elements
        footer.insertAdjacentHTML(
            "afterend",
            '<div id="verse-link-container">' +
                '<div id="verse-left"><a href="https://linguadivina.uk/yhvh-ehyeh-linguistic-framework.html"><img loading="lazy" width="346" height="345" class="key-icon" alt="Logo" src="/images/icons/lingua-divina-bible-key-logo.webp"></a></div>' +
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
 