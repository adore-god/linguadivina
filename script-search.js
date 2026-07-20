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

  async function getIndex() {
    if (searchIndex) return searchIndex; 
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

  // Move the timer variable here so it persists safely across all inputs
  let debounceTimer = null;

  if (searchBox) {
    getIndex();

    searchBox.addEventListener('input', async function () {
      const query = this.value.trim().toLowerCase();

      // Clear layout elements instantly
      resultsList.innerHTML = '';
      resultsSection.style.display = 'none';

      // Always clear the previous timer first so old keystrokes don't stack up
      clearTimeout(debounceTimer);

      if (!query) return;

      // Track the event after the user stops typing for 700ms
      if (typeof gtag === 'function') {
        debounceTimer = setTimeout(() => {
          let sanitizedQuery = query.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
          const safeEventName = ('search_' + sanitizedQuery).substring(0, 40);

          gtag('event', safeEventName, {
            'typed_term': query,
            'event_category': 'Site Search',
            'event_label': 'Local Search Box'
          });
        }, 700);
      }

      // Handle displaying UI results right away
      const index = await getIndex();
      const results = index.filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.content.toLowerCase().includes(query)
      );

      function appendResults(list, items) {
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
