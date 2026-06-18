
document.addEventListener('DOMContentLoaded', async () => {
  const searchBox = document.getElementById('searchBox');
  const creationSection = document.getElementById('creation-section');
  const otherSection = document.getElementById('other-section');
  const creationList = document.getElementById('creation-results');
  const otherList = document.getElementById('other-results');
  const CREATION_SUBFOLDER = 'creation';

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
    
    // Reset lists on every keystroke to keep it clean
    creationList.innerHTML = '';
    otherList.innerHTML = '';
    
    if (!query || searchIndex.length === 0) {
      creationSection.style.display = 'none';
      otherSection.style.display = 'none';
      return;
    }

    // Filter the index we already have in memory
    const results = searchIndex.filter(page =>
      page.title.toLowerCase().includes(query) ||
      page.content.toLowerCase().includes(query)
    );

    const creationResults = results.filter(p => p.subfolder === CREATION_SUBFOLDER);
    const otherResults = results.filter(p => p.subfolder !== CREATION_SUBFOLDER);

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

    if (creationResults.length > 0) {
      appendResults(creationList, creationResults);
      creationSection.style.display = 'block';
    } else { 
      creationSection.style.display = 'none'; 
    }

    if (otherResults.length > 0) {
      appendResults(otherList, otherResults);
      otherSection.style.display = 'block';
    } else { 
      otherSection.style.display = 'none'; 
    }
  });
});
