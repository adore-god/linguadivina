document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'https://linguadivina.uk/';

  // --- CACHE VARIABLE ---
  let searchIndex = null;

  function addNoTagToElement(el) {
    if (!el) return;
    if (el.tagName === 'A') el.classList.add('noTag');
    if (el.querySelectorAll) el.querySelectorAll('a').forEach(a => a.classList.add('noTag'));
  }

  const resultsList = document.getElementById('search-results');
  if (resultsList) {
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          addNoTagToElement(node);
        }
      }
    });
    observer.observe(resultsList, { childList: true, subtree: true });
  }

  // Simplified loadIndex to fetch once
  async function getIndex() {
    if (searchIndex) return searchIndex; // Return cached if available
    try {
      const response = await fetch(`${BASE_URL}searchIndex.json`);
      if (!response.ok) throw new Error('Failed to fetch: ' + response.status);
      searchIndex = await response.json();
      return searchIndex;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  const searchBox = document.getElementById('searchBox');
  const resultsSection = document.getElementById('results-section');

  if (searchBox) {
    // Pre-load the index immediately so it's ready when they start typing
    getIndex();

    let debounceTimer;
    searchBox.addEventListener('input', async function () {
      const query = this.value.trim().toLowerCase();

      // Clear everything immediately to prevent "ghost" results
      resultsList.innerHTML = '';
      resultsSection.style.display = 'none';

      if (!query) return;

      if (typeof gtag === 'function') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          gtag('event', query, {
            'search_term': query,
            'event_category': 'Site Search',
            'event_label': 'Local Search Box'
          });
        }, 700);
      }

      // Use the cached index
      const index = await getIndex();
      const results = index.filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.content.toLowerCase().includes(query)
      );

      function appendResults(list, items) {
        // Double-check to ensure we don't append if the query changed while we were waiting
        if (searchBox.value.trim().toLowerCase() === '') return;

        items.forEach(page => {
          const li = document.createElement('li');
          const a = document.createElement('a');

          try {
            a.href = new URL(page.url, BASE_URL).href;
          } catch (e) {
            a.href = page.url;
          }

          a.textContent = page.title;
          a.classList.add('noTag');
          li.appendChild(a);
          list.appendChild(li);
        });
        addNoTagToElement(list);
      }

      if (results.length > 0) {
        appendResults(resultsList, results);
        resultsSection.style.display = 'block';
      }
    });
  }
});
