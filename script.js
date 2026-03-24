

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
  // --- 1. SETTINGS ---
  const workerUrl = "https://like-button-worker.linguadivina.workers.dev";
  const localStorageKey = 'hasLiked_project';
  const userHasLiked = localStorage.getItem(localStorageKey);

  // --- 2. THE LIKE BUTTON INJECTION ---
  document.querySelectorAll('.share-dropdown').forEach(linkContainer => {
    if (linkContainer.previousElementSibling && linkContainer.previousElementSibling.classList.contains('like-btn')) return;
 
    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    likeBtn.innerHTML = `<div class="">&#x2661; <div class="like-count">...</div></div>`;

    if (userHasLiked) {
      likeBtn.disabled = true;
      likeBtn.style.opacity = "0.6";
      likeBtn.innerHTML = `<div class="like-btn">&#9829;</div><div class="like-count">Loaded</div>`;
    }

    // Insert safely
    linkContainer.insertAdjacentElement('beforebegin', likeBtn);
    const countSpan = likeBtn.querySelector('.like-count');

    // Fetch Count
    fetch(workerUrl).then(res => res.text()).then(data => {
      countSpan.innerText = data;
    }).catch(() => { countSpan.innerText = "0"; });

    // Like Logic
    likeBtn.onclick = async (e) => {
      e.preventDefault();
      if (localStorage.getItem(localStorageKey)) return;
      localStorage.setItem(localStorageKey, 'true');
      likeBtn.disabled = true;
      likeBtn.style.opacity = "0.6";
      try {
        const res = await fetch(workerUrl, { method: 'POST' });
        const newVal = await res.text();
        likeBtn.innerHTML = `<div class="like-btn gold-card">&#9829;</div> <div class="like-count">${newVal} </div>`;
      } catch (err) {
        localStorage.removeItem(localStorageKey);
        likeBtn.disabled = false;
      }
    };
  });
  
  
  
  
  

  // --- 3. THE SHARE MENU LOGIC ---
  const shareButton = document.querySelector(".share-button");
  const shareMenu = document.getElementById("share-menu");

  if (shareButton && shareMenu) {
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    // Setup Links
    const twitter = document.getElementById("share-twitter");
    if (twitter) twitter.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

    const facebook = document.getElementById("share-facebook");
    if (facebook) facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

    // Copy Link Logic
    const copyButton = document.getElementById("share-copy");
    if (copyButton) {
      copyButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
        shareMenu.style.display = "none";
      });
    }

    // Toggle Dropdown (Fixed for Mobile)
    shareButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = shareMenu.style.display === "block";
      shareMenu.style.display = isVisible ? "none" : "block";
    });

    // Global Click-to-Close
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
 