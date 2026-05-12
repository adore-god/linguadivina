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