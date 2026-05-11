document.addEventListener('DOMContentLoaded', () => {
  const allResultContainers = ['#creation-results', '#other-results'];
  
  // Define your base URL here
  const BASE_URL = 'https://linguadivina.uk/';

  function addNoTagToElement(el) {
    if (!el) return;
    if (el.tagName === 'A') el.classList.add('noTag');
    if (el.querySelectorAll) el.querySelectorAll('a').forEach(a => a.classList.add('noTag'));
  }

  allResultContainers.forEach(sel => {
    const c = document.querySelector(sel);
    if (!c) return;
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          addNoTagToElement(node);
        }
      }
    });
    observer.observe(c, { childList: true, subtree: true });
  });

  async function loadIndex() {
    try {
      const response = await fetch(`${BASE_URL}searchIndex.json`);
      if (!response.ok) throw new Error('Failed to fetch searchIndex.json: ' + response.status);
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  const searchBox = document.getElementById('searchBox');
  const creationSection = document.getElementById('creation-section');
  const otherSection = document.getElementById('other-section');
  const creationList = document.getElementById('creation-results');
  const otherList = document.getElementById('other-results');

  const CREATION_SUBFOLDER = 'creation';

  if (searchBox) {
    let debounceTimer;
    searchBox.addEventListener('input', async function () {
      const query = this.value.trim().toLowerCase();

      creationList.innerHTML = '';
      otherList.innerHTML = '';
      creationSection.style.display = 'none';
      otherSection.style.display = 'none';

      if (!query) return;

      if (typeof gtag === 'function') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          gtag('event', 'search', {
            'search_term': query,
            'event_category': 'Site Search',
            'event_label': 'Local Search Box'
          });
        }, 700);
      }

      const index = await loadIndex();
      const results = index.filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.content.toLowerCase().includes(query)
      );

      const creationResults = results.filter(p => p.subfolder === CREATION_SUBFOLDER);
      const otherResults = results.filter(p => p.subfolder !== CREATION_SUBFOLDER);

      function appendResults(list, items) {
        items.forEach(page => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          
          // --- URL LOGIC START ---
          try {
            // This handles both absolute (http://...) and relative (/page.html) URLs
            a.href = new URL(page.url, BASE_URL).href;
          } catch (e) {
            // Fallback to the raw URL if the constructor fails
            a.href = page.url;
          }
          // --- URL LOGIC END ---

          a.textContent = page.title;
          a.classList.add('noTag');
          li.appendChild(a);
          list.appendChild(li);
        });
        addNoTagToElement(list);
      }

      if (creationResults.length > 0) {
        appendResults(creationList, creationResults);
        creationSection.style.display = 'block';
      }

      if (otherResults.length > 0) {
        appendResults(otherList, otherResults);
        otherSection.style.display = 'block';
      }
    });
  }
});
