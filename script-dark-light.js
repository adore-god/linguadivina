// --- Cookie helpers ---
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = name + "=" + encodeURIComponent(value) +
        ";expires=" + d.toUTCString() + ";path=/;domain=.linguadivina.uk";
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
}

// --- Apply saved/detected preference immediately ---
(function() {
    const html = document.documentElement;
    let darkDisabled = getCookie("darkModeDisabled");

    if (darkDisabled === null) {
        const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        darkDisabled = systemPrefersLight ? "true" : "false";
        setCookie("darkModeDisabled", darkDisabled, 30);
    }

    if (darkDisabled === "true") {
        html.classList.add("light");
        html.classList.remove("dark");
    } else {
        html.classList.add("dark");
        html.classList.remove("light");
    }
})();

// --- Toggle function ---
function toggleDarkMode() {
    const html = document.documentElement;
    const darkDisabled = getCookie("darkModeDisabled");

    if (darkDisabled === "true") {
        html.classList.remove("light");
        html.classList.add("dark");
        setCookie("darkModeDisabled", "false", 30);
    } else {
        html.classList.remove("dark");
        html.classList.add("light");
        setCookie("darkModeDisabled", "true", 30);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleDarkMode);
});


// --- Top Nav/Breadcrumb ---

document.addEventListener('DOMContentLoaded', () => {

  let path = window.location.pathname.toLowerCase();

  const isIndex = path === '/' || path === '/index.html' || path === '/index.htm';

  const excludePaths = [
    '/about.html',
    '/series-links.html',
    '/search.html',
    '/404.html',
    '/about-author.html',
    '/terms-of-use.html', 
    '/bible-reference/bible-index.html',
    '/scrolls/label-from-creation-story.html'
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

  function createInfoIcon() {
    const icon = document.createElement('span');
    icon.className = 'info-icon-i';
    icon.textContent = 'i';
    return icon;
  }

  // 1. Home
  breadcrumb.appendChild(createCrumb('https://linguadivina.uk/', 'Home'));

  // Look up the current page directly in labelMap (keyed by full URL, no hash/query)
  const currentPageUrl = window.location.origin + window.location.pathname;
  const currentEntry = window.labelMap ? window.labelMap[currentPageUrl] : null;

  const frameworkUrl = (currentEntry && currentEntry.series && currentEntry.series[0])
    ? currentEntry.series[0]
    : 'https://linguadivina.uk/bible-reference/bible-index.html#hub-pages';

  addSeparator();
  const frameworkCrumb = createCrumb(frameworkUrl, 'Framework & Articles A — Z');
  frameworkCrumb.insertBefore(createInfoIcon(), frameworkCrumb.firstChild);
  breadcrumb.appendChild(frameworkCrumb);

  addSeparator();

  // 2. Current Page Title
  const pageTitle = document.querySelector('h1')?.textContent || document.title;
  const currentPage = document.createElement('span');
  currentPage.textContent = pageTitle;
  currentPage.classList.add('breadcrumb-current', 'noTag');
  breadcrumb.appendChild(currentPage);

  // 3. About The Author (constant — always last, not sourced from labelMap)
  addSeparator();
  breadcrumb.appendChild(createCrumb('https://linguadivina.uk/about-author.html', 'About The Author'));

  mainContent.insertBefore(breadcrumb, mainContent.firstChild);
});
