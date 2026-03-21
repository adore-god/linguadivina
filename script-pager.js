(function waitForLabels() {
    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;
    
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const targetSelector = isIndexPage ? '.latest-posts' : '.share-dropdown';
    const target = document.querySelector(targetSelector);

    if (!labelContainer || !map || !target) {
        setTimeout(waitForLabels, 100);
        return;
    }

    const currentPage = window.location.href;
    const allLinks = labelContainer.querySelectorAll("a");
    const matchedScrollUrls = [];

    allLinks.forEach(link => {
        const linkSlug = link.href.split("/").pop();
        for (let path in map) {
            const seriesList = map[path].series;
            if (Array.isArray(seriesList)) {
                seriesList.forEach(s => {
                    if (s.split("/").pop() === linkSlug && !matchedScrollUrls.includes(s)) {
                        matchedScrollUrls.push(s);
                    }
                });
            }
        }
    });

    if (matchedScrollUrls.length === 0) return;

    const groups = [];
    matchedScrollUrls.forEach(scrollUrl => {
        const groupEntries = [];
        for (let articlePath in map) {
            if (articlePath === currentPage) continue;
            const entry = map[articlePath];
            const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];
            if (seriesList.includes(scrollUrl)) {
                groupEntries.push([articlePath, entry.title]);
            }
        }
        if (groupEntries.length === 0) return;
        groupEntries.sort((a, b) => a[1].localeCompare(b[1]));
        groups.push({ scrollUrl, entries: groupEntries });
    });

    if (groups.length === 0) return;

    const titleContainer = document.createElement("div");
    titleContainer.className = "series-links-title";
    const h2Title = document.createElement("h2");
    h2Title.textContent = "More Reading";
    titleContainer.appendChild(h2Title);

    const container = document.createElement("div");
    container.id = "series-links-wrapper";

    groups.forEach(group => {
        group.entries.forEach(([path, linkTitle]) => {
            const a = document.createElement("a");
            a.href = path;
            a.textContent = linkTitle;
            const div = document.createElement("div");
            div.appendChild(a);
            container.appendChild(div);
        });
        const divider = document.createElement("div");
        divider.className = "series-group-divider";
        container.appendChild(divider);
    });

    target.after(titleContainer);       
    titleContainer.after(container);    
})();

window.addEventListener("load", function () {
  setTimeout(function () {
    // 1. Determine exactly where we are
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) return;

    let graph;
    try {
      graph = JSON.parse(schemaScript.textContent);
    } catch (e) { return; }

    const nodes = graph["@graph"] ? graph["@graph"] : [graph];
    const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
    if (!mainNode) return;

    // 2. ONLY inject Latest Posts if we are on the Index Page
    if (isIndexPage) {
      const postsContainer = document.getElementById("latest-posts");
      if (postsContainer) {
        const postLinks = Array.from(postsContainer.querySelectorAll("a"));
        if (postLinks.length) {
          mainNode.mainEntity = {
            "@type": "ItemList",
            "name": "Latest Updated Articles",
            "itemListElement": postLinks.map((a, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": a.href,
              "name": a.textContent.trim()
            }))
          };
        }
      }
    } 
    // 3. ONLY inject Series Links if we are NOT on the Index Page
    else {
      const seriesWrapper = document.getElementById("series-links-wrapper");
      if (seriesWrapper) {
        const seriesLinks = Array.from(seriesWrapper.querySelectorAll("a"));
        if (seriesLinks.length) {
          if (mainNode["@type"] === "BlogPosting") {
            mainNode.hasPart = {
              "@type": "ItemList",
              "name": "Related Series Articles",
              "itemListElement": seriesLinks.map((a, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": a.href,
                "name": a.textContent.trim()
              }))
            };
          } else {
            mainNode.mentions = seriesLinks.map((a) => ({
              "@type": "CreativeWorkSeries",
              "name": a.textContent.trim(),
              "url": a.href
            }));
          }
        }
      }
    }

    schemaScript.textContent = JSON.stringify(graph, null, 2);
  }, 2000);
});
