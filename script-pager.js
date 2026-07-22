(function waitForLabels() {
    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;

    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const targetSelector = isIndexPage ? '.latest-posts' : '.label-links';
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

    // Collect all unique matching entries into a single array (no extra wrappers)
    const allEntries = [];
    const seenPaths = new Set();

    matchedScrollUrls.forEach(scrollUrl => {
        const groupEntries = [];
        for (let articlePath in map) {
            if (articlePath === currentPage || seenPaths.has(articlePath)) continue;
            const entry = map[articlePath];
            const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];
            if (seriesList.includes(scrollUrl)) {
                groupEntries.push([articlePath, entry.title]);
                seenPaths.add(articlePath);
            }
        }
        if (groupEntries.length === 0) return;

        const hubEntry = groupEntries.find(([path]) => path.includes('#hub-pages'));
        const restEntries = groupEntries.filter(([path]) => !path.includes('#hub-pages'));

        restEntries.sort((a, b) => a[1].localeCompare(b[1]));

        const orderedEntries = hubEntry ? [hubEntry, ...restEntries] : restEntries;
        allEntries.push(...orderedEntries);
    });

    if (allEntries.length === 0) return;

    // Create Title Header
    const titleContainer = document.createElement("div");
    titleContainer.className = "series-links-title";

    const h2Title = document.createElement("h2");
    h2Title.textContent = "More In This Series";
    titleContainer.appendChild(h2Title);

    // Create Wrapper Container
    const container = document.createElement("div");
    container.id = "series-links-wrapper";

    // Setup Batching Parameters
    const BATCH_SIZE = 10;
    let currentIndex = 0;

    // Create "Load More" Button
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.id = "load-more-series-btn";
    loadMoreBtn.textContent = "Load More Articles";
    loadMoreBtn.type = "button";
    loadMoreBtn.style.cssText = "display: block; margin: 15px 0; padding: 10px 15px; cursor: pointer;";

    function renderNextBatch() {
        const nextBatch = allEntries.slice(currentIndex, currentIndex + BATCH_SIZE);
        const fragment = document.createDocumentFragment();

        nextBatch.forEach(([path, linkTitle]) => {
            const a = document.createElement("a");
            a.href = path;
            a.textContent = linkTitle;
            a.className = "series-link-item";
            
            // Clean DOM node: simple block link without redundant <div> wrappers
            const wrapper = document.createElement("div");
            wrapper.appendChild(a);
            fragment.appendChild(wrapper);
        });

        // Insert new items right before the button
        container.insertBefore(fragment, loadMoreBtn);
        currentIndex += BATCH_SIZE;

        // Hide the button once all items are rendered
        if (currentIndex >= allEntries.length) {
            loadMoreBtn.style.display = "none";
        }
    }

    loadMoreBtn.addEventListener("click", renderNextBatch);
    container.appendChild(loadMoreBtn);

    // Initial load of the first 10 items
    renderNextBatch();

    // Inject into document
    target.after(titleContainer);
    titleContainer.after(container);
})();

window.addEventListener("load", function () {
    setTimeout(function () {
        const schemaScript = document.querySelector('#main-schema');
        if (!schemaScript) return;

        let graph;
        try {
            graph = JSON.parse(schemaScript.textContent);
        } catch (e) { return; }

        const nodes = graph["@graph"] ? graph["@graph"] : [graph];
        const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
        if (!mainNode) return;

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

        schemaScript.textContent = JSON.stringify(graph, null, 2);
    }, 2000);
});
