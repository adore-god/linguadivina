

document.addEventListener('DOMContentLoaded', () => {

  let path = window.location.pathname.toLowerCase();

  const isIndex = path === '/' || path === '/index.html' || path === '/index.htm';

  const excludePaths = [
    '/about_13.html',
    '/series-links.html',
    '/search.html',
    '/404.html',
    '/el/terms-of-use.html'
  ];

  if (excludePaths.includes(path)) return;

  if (isIndex) return;

  const mainContent = document.querySelector('main.content');
  if (!mainContent) return;

  if (document.querySelector('.breadcrumb')) return;

  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');

  function createCrumb(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.classList.add('noTag');
    return a;
  }

  function addSeparator() {
    const sep = document.createElement('span');
    sep.className = 'breadcrumb-separator';
    sep.textContent = ' | ';
    breadcrumb.appendChild(sep);
  }

  // All other pages  existing logic unchanged
  const labelLinks = Array.from(document.querySelectorAll('.label-links a'));

  // 1. Home
  breadcrumb.appendChild(createCrumb('https://linguadivina.uk/', 'Home'));
  addSeparator();

  // 2. Genesis Foundational Principles
  const gfp = document.createElement('span');
  gfp.textContent = 'Genesis Foundational Principles';
  gfp.classList.add('gfp');
  gfp.style.cursor = 'pointer';
  gfp.addEventListener('click', () => {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) sidebarToggle.checked = true;
  });
  breadcrumb.appendChild(gfp);
  addSeparator();

  // 3. Current Page
  const pageTitle = document.querySelector('h1')?.textContent || document.title;
  const currentPage = document.createElement('span');
  currentPage.textContent = pageTitle;
  currentPage.classList.add('breadcrumb-current', 'noTag');
  breadcrumb.appendChild(currentPage);

  const authorIndex = labelLinks.findIndex(link =>
    link.href.includes('about-author.html')
  );

  let authorLink = null;
  if (authorIndex > -1) {
    [authorLink] = labelLinks.splice(authorIndex, 1);
  }

  // 4. Page Links
  labelLinks.forEach(link => {
    addSeparator();
    breadcrumb.appendChild(createCrumb(link.href, link.textContent));
  });

  // 5. About The Author
  if (authorLink) {
    addSeparator();
    breadcrumb.appendChild(createCrumb(authorLink.href, authorLink.textContent));
  }

  mainContent.insertBefore(breadcrumb, mainContent.firstChild);

});




document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".share-button");
  const menu = document.getElementById("share-menu");

  if (!button || !menu) return; // Exit if the main button or menu is missing

  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  // Assign share links safely
  const twitter = document.getElementById("share-twitter");
  if (twitter) {
    twitter.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
  }

  const facebook = document.getElementById("share-facebook");
  if (facebook) {
    facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
  }

  // Copy link safely
  const copyButton = document.getElementById("share-copy");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      menu.style.display = "none";
    });
  }

  // Toggle dropdown
  button.addEventListener("click", () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  // Close if clicked outside
 // Replace your current toggle logic with this:
button.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevents the "click outside" logic from firing immediately
  const isVisible = window.getComputedStyle(menu).display === "block";
  menu.style.display = isVisible ? "none" : "block";
});

  
    // Open sidebar from inline links
  document.querySelectorAll('.open-sidebar').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // 🔑 THIS is the missing piece
      const sidebarToggle = document.getElementById('sidebar-toggle');
      if (sidebarToggle) sidebarToggle.checked = true;
    });
  });
  
});




document.addEventListener('DOMContentLoaded', () => {
  const workerUrl = "https://like-button-worker.linguadivina.workers.dev";
  const localStorageKey = 'hasLiked_project';

  // 1. Check if user has already liked (Universal check for this session)
  const userHasLiked = localStorage.getItem(localStorageKey);

  // 2. Find all .share-dropdown containers
  document.querySelectorAll('.share-dropdown').forEach(linkContainer => {

    // Prevent adding multiple buttons
    if (linkContainer.previousElementSibling && linkContainer.previousElementSibling.classList.contains('like-btn')) return;

    // Create the New Like Button
    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    // Initial State
    likeBtn.innerHTML = ` <span class="like-count">...</span>`;

    // 3. Apply "Already Liked" styling if needed
    if (userHasLiked) {
      likeBtn.disabled = true;
      likeBtn.style.opacity = "0.6";
      likeBtn.style.cursor = "default";
    }

    // Insert button before the .share-dropdown container
    linkContainer.insertAdjacentElement('beforebegin', likeBtn);

    const countSpan = likeBtn.querySelector('.like-count');

    // 4. Fetch the current count from Cloudflare
    fetch(workerUrl)
      .then(res => res.text())
      .then(data => {
        countSpan.innerText = data;
      })
      .catch(() => {
        countSpan.innerText = "0";
      });

    // 5. Click Handler
    likeBtn.onclick = async () => {
      if (localStorage.getItem(localStorageKey)) return;

      // Lock button immediately
      localStorage.setItem(localStorageKey, 'true');
      likeBtn.disabled = true;
      likeBtn.style.opacity = "0.6";
      countSpan.innerText = "...";

      try {
        const res = await fetch(workerUrl, { method: 'POST' });
        const newVal = await res.text();
        countSpan.innerText = newVal;
        // Optional: Trigger a little animation or change icon
        likeBtn.innerHTML = ` ${newVal}`;
      } catch (err) {
        console.error("Like failed:", err);
        countSpan.innerText = "!";
        localStorage.removeItem(localStorageKey);
        likeBtn.disabled = false;
        likeBtn.style.opacity = "1";
      }
    };
  });
});








document.addEventListener("DOMContentLoaded", function () {
    const footer = document.querySelector(".start-here");

    if (footer) {
        // We add inline CSS to ensure it stays on top of other elements
        footer.insertAdjacentHTML(
            "afterend",
            '<div id="Verse-Link-Container" style="position:relative; z-index:9999;">' +
                '<a id="translator-link" href="https://linguadivina.uk/el/yhvh-ehyeh-linguistic-framework.html"><img loading="lazy" width="688" height="384" class="key-icon" alt="Logo" src="../images/icons/bible-key-lingua-divina-logo.webp"></a>' +
                '<div id="VerseLinkBox">' +
                    '<a id="translator-link" href="https://linguadivina.uk/el/yhvh-ehyeh-linguistic-framework.html" style="display:inline-block; position:relative; z-index:10000;">Bible Passage And Verse Translator</a>' +
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
 