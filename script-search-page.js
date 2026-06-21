document.addEventListener('DOMContentLoaded', async () => {
  const searchBox = document.getElementById('searchBox');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('search-results');

  let searchIndex = [];

  // Load the index ONCE on page load
  try {
    const response = await fetch('searchIndex.json');
    searchIndex = await response.json();
  } catch (err) {
    console.error("Error loading search index:", err);
  }

  searchBox.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();

    // Reset list on every keystroke to keep it clean
    resultsList.innerHTML = '';

    if (!query || searchIndex.length === 0) {
      resultsSection.style.display = 'none';
      return;
    }

    // Filter the index we already have in memory
    const results = searchIndex.filter(page =>
      page.title.toLowerCase().includes(query) ||
      page.content.toLowerCase().includes(query)
    );

    function appendResults(list, items) {
      items.forEach(page => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = page.url;
        a.textContent = page.title;
        a.classList.add('noTag');
        li.appendChild(a);
        list.appendChild(li);
      });
    }

    if (results.length > 0) {
      appendResults(resultsList, results);
      resultsSection.style.display = 'block';
    } else {
      resultsSection.style.display = 'none';
    }
  });
});
