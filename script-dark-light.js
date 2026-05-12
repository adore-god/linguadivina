


// --- add warning note ---

(function() {
  /**
   * Stand-alone Archive Disclaimer Script
   * Specifically for pages outside the 'creation' subfolder.
   */
  const CONFIG = {
    baseUrl: 'https://linguadivina.uk/',
    creationFolder: 'creation',
    // The CSS selector where the message will be inserted (usually <main> or article container)
    containerSelector: 'main', 
  };

  function injectDisclaimer() {
    const path = window.location.pathname;
    
    // 1. Identify if we are on the homepage or in the creation folder
    const isHome = path === '/' || path === '/index.html' || path === '';
    const isCreationPage = path.includes(`/${CONFIG.creationFolder}/`);

    // 2. If it's a content page but NOT part of the creation story, inject the notice
    if (!isHome && !isCreationPage) {
      const targetContainer = document.querySelector(CONFIG.containerSelector) || document.body;
      
      const notice = document.createElement('div');
      notice.id = 'archive-disclaimer';
      
      // Inline styles to ensure it works without external CSS
      notice.style.cssText = `
        background-color: transparent;
        border-left: 4px solid #dcdcdc;
        padding: 1rem;
        margin: 1.5rem 0;
        font-family: sans-serif;
        line-height: 1.5;
        
      `;

      notice.innerHTML = `
        <p style="margin: 0;">
          <strong>Archive Note:</strong> These are earlier notes that have not yet been integrated into the creation story. For the most developed interpretations, please visit the 
          <a href="${CONFIG.baseUrl}" style="text-decoration: underline;">Home Page</a>, or the <a href="https://linguadivina.uk/scrolls/label-from-creation-story.html" style="text-decoration: underline;">Creation Story index</a>.
        </p>
      `;

      // Insert at the top of the main content
      if (targetContainer.firstChild) {
        targetContainer.insertBefore(notice, targetContainer.firstChild);
      } else {
        targetContainer.appendChild(notice);
      }
    }
  }

  // Run as soon as the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDisclaimer);
  } else {
    injectDisclaimer();
  }
})();


// --- Top Nav/breadcrumb ---

document.addEventListener('DOMContentLoaded', () => {

  let path = window.location.pathname.toLowerCase();

  const isIndex = path === '/' || path === '/index.html' || path === '/index.htm';

  const excludePaths = [
    '/about_13.html',
    '/series-links.html',
    '/search.html',
    '/404.html',
    '/key-interpretations/about-author.html',
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
const gfp = document.createElement('a');
gfp.textContent = 'Genesis Foundational Principles';
gfp.href = 'https://linguadivina.uk/genesis-foundational-principles.html'; // replace with your actual URL
gfp.classList.add('gfp');

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


// --- Cookie helpers ---
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = name + "=" + encodeURIComponent(value) + 
        ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
}

// --- Apply saved preference immediately ---
(function() {
    const html = document.documentElement;
    const darkDisabled = getCookie("darkModeDisabled");
    if (darkDisabled === "true") {
        html.classList.add("light");
    } else {
        html.classList.remove("light");
    }
})();

// --- Toggle function ---
function toggleDarkMode() {
    const html = document.documentElement;
    const isLight = html.classList.contains("light");

    if (isLight) {
        html.classList.remove("light");
        setCookie("darkModeDisabled", "false", 30);
    } else {
        html.classList.add("light");
        setCookie("darkModeDisabled", "true", 30);
    }
}

// --- Button event ---
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleDarkMode);
});