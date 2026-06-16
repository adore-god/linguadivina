
// --- ADD WARNING NOTE ---

(function() {
  /**
   * Stand-alone Archive Disclaimer Script
   * Watches for the first H1 and injects the notice directly AFTER it.
   */
  const CONFIG = {
    baseUrl: 'https://linguadivina.uk/',
    creationFolder: 'creation',
    excludeIndexUrl: 'https://linguadivina.uk/scrolls/label-from-creation-story.html',
    
    // List of specific filenames/paths to exclude from showing the warning
    forbiddenPaths: [
      'search.html',
      'key-interpretations/about-author.html',
      'creation-genesis-1-creation.html',
      'creation-meaning-of-lord-god-elohim-yhvh.html',
      'creation-genesis-1-11-seed.html',
      'creation-genesis-1-26-man.html',
      'creation-genesis-2-23-woman.html',
      'creation-genesis-224-love.html',
      'creation-exodus-314-i-am.html',
      'creation-ask-believe-receive.html',
      'creation-cain-abel.html',
      'creation-patriarchs.html',
      'el/terms-of-use.html',
      'creation-elohim-god.html',
      'teachers-fathers-of-law-assumption.html',
      'series-links.html',
      'yhvh-ehyeh-linguistic-framework.html',
      'about_13.html',
      'source/law-of-assumption.html',
      'source/holy-bible.html',
      'source/strongs-concordance.html',
      'source/law-of-assumption',
      'source/holy-bible',
      'source/strongs-concordance
    ]
  };

  function injectDisclaimer() {
    const path = window.location.pathname;
    const currentFullUrl = window.location.href;
    
    // 1. Identify exclusions
    const isHome = path === '/' || path === '/index.html' || path === '';
    const isCreationPage = path.includes(`/${CONFIG.creationFolder}/`);
    const isExcludedIndex = currentFullUrl === CONFIG.excludeIndexUrl;
    
    // Check if the current path ends with any of our forbidden filenames
    const isForbiddenPath = CONFIG.forbiddenPaths.some(p => path.endsWith(p));

    if (isHome || isCreationPage || isExcludedIndex || isForbiddenPath) return;

    // 2. Injection Logic
    const attemptInjection = () => {
      if (document.getElementById('archive-disclaimer')) return true;

      const firstH1 = document.querySelector('h1');
      
      if (firstH1) {
        const notice = document.createElement('div');
        notice.id = 'archive-disclaimer';
        notice.innerHTML = `
<p><strong>&#9755;&#xFE0E; Archive Note:</strong> These are earlier notes that have not yet been integrated into the creation story. They are useful as evidence of the study but remain incomplete until tied into the creation vocabulary. For the most developed interpretations, please visit the
            <a href="${CONFIG.baseUrl}">Home Page</a>, or the <a href="${CONFIG.excludeIndexUrl}">Creation Story Index</a>.
          </p>
        `;

        // Places it immediately AFTER the <h1> tag
        firstH1.insertAdjacentElement('afterend', notice);
        return true;
      }
      return false;
    };

    // 3. Mutation Observer: Watch for the H1 to appear
    if (!attemptInjection()) {
      const observer = new MutationObserver((mutations, obs) => {
        if (attemptInjection()) {
          obs.disconnect(); 
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDisclaimer);
  } else {
    injectDisclaimer();
  }
})();





// --- Top Nav/Breadcrumb ---

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

  if (excludePaths.includes(path) || isIndex) return;

  const mainContent = document.querySelector('main.content');
  if (!mainContent || document.querySelector('.breadcrumb')) return;

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

  // 1. Home
  breadcrumb.appendChild(createCrumb('https://linguadivina.uk/', 'Home'));

  // Collect the existing links from the page
  const labelLinks = Array.from(document.querySelectorAll('.label-links a'));

  // Handle "Articles A — Z" check
  const creationIndex = labelLinks.findIndex(l => l.href.includes('label-from-creation-story.html'));
  if (creationIndex > -1) {
    labelLinks.splice(creationIndex, 1);
    addSeparator();
    breadcrumb.appendChild(createCrumb('https://linguadivina.uk/scrolls/label-from-creation-story.html', 'Articles A — Z'));
  }

  // Handle Author link extraction
  const authorIndex = labelLinks.findIndex(l => l.href.includes('about-author.html'));
  let authorLink = (authorIndex > -1) ? labelLinks.splice(authorIndex, 1)[0] : null;

  addSeparator();

  // 2. Current Page Title
  const pageTitle = document.querySelector('h1')?.textContent || document.title;
  const currentPage = document.createElement('span');
  currentPage.textContent = pageTitle;
  currentPage.classList.add('breadcrumb-current', 'noTag');
  breadcrumb.appendChild(currentPage);

  // 3. Add any other remaining label links
  labelLinks.forEach(link => {
    addSeparator();
    breadcrumb.appendChild(createCrumb(link.href, link.textContent));
  });

  // 4. About The Author (Always last)
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