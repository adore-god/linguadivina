(function seriesAndSchemaManager() {
    const map = window.labelMap;
    const labelContainer = document.querySelector('.label-links');
    
    // 1. Identify Page Type and Target
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    
    // Fallback logic: If .share-dropdown is missing on the new site, try .post-footer or .entry-content
    let target = isIndexPage 
        ? document.querySelector('.latest-posts') 
        : (document.querySelector('.share-dropdown') || document.querySelector('.post-footer'));

    // 2. Wait for elements to exist
    if (!labelContainer || !map || !target) {
        setTimeout(seriesAndSchemaManager, 100);
        return;
    }

    const currentPath = window.location.pathname;
    const allLinks = labelContainer.querySelectorAll("a");
    const matchedScrollUrls = [];

    // 3. Match Labels to Series
    allLinks.forEach(link => {
        const linkSlug = link.href.split("/").pop();
        for (let path in map) {
            const seriesList = Array.isArray(map[path].series) ? map[path].series : [map[path].series];
            seriesList.forEach(s => {
                if (s && s.split("/").pop() === linkSlug && !matchedScrollUrls.includes(s)) {
                    matchedScrollUrls.push(s);
                }
            });
        }
    });

    if (matchedScrollUrls.length === 0) return;

    const groups = [];
    matchedScrollUrls.forEach(scrollUrl => {
        const groupEntries = [];
        for (let articlePath in map) {
            // URL Normalization: compare paths to avoid domain issues
            const entryPath = new URL(articlePath, window.location.origin).pathname;
            if (entryPath === currentPath) continue;

            const entry = map[articlePath];
            const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];
            if (seriesList.includes(scrollUrl)) {
                groupEntries.push([articlePath, entry.title]);
            }
        }
        if (groupEntries.length > 0) {
            groupEntries.sort((a, b) => a[1].localeCompare(b[1]));
            groups.push({ scrollUrl, entries: groupEntries });
        }
    });

    if (groups.length === 0) return;

    // 4. Inject HTML
    const titleContainer = document.createElement("div");
    titleContainer.className = "series-links-title";
    titleContainer.innerHTML = "<h2>More Reading</h2>";

    const container = document.createElement("div");
    container.id = "series-links-wrapper";

    groups.forEach(group => {
        group.entries.forEach(([path, linkTitle]) => {
            const div = document.createElement("div");
            div.innerHTML = `<a href="${path}">${linkTitle}</a>`;
            container.appendChild(div);
        });
        const divider = document.createElement("div");
        divider.className = "series-group-divider";
        container.appendChild(divider);
    });

    target.after(titleContainer);       
    titleContainer.after(container);

    // 5. TRIGGER SCHEMA UPDATE IMMEDIATELY
    updateSchemaData();
})();

function updateSchemaData() {
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) return;

    let graph;
    try {
        graph = JSON.parse(schemaScript.textContent);
    } catch (e) { return; }

    const nodes = graph["@graph"] ? graph["@graph"] : [graph];
    const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage" || n["@type"] === "Article");
    
    if (!mainNode) return;

    const seriesWrapper = document.getElementById("series-links-wrapper");
    if (seriesWrapper) {
        const seriesLinks = Array.from(seriesWrapper.querySelectorAll("a"));
        if (seriesLinks.length) {
            const itemList = {
                "@type": "ItemList",
                "name": "Related Series Articles",
                "itemListElement": seriesLinks.map((a, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "url": a.href,
                    "name": a.textContent.trim()
                }))
            };

            if (mainNode["@type"] === "BlogPosting" || mainNode["@type"] === "Article") {
                mainNode.hasPart = itemList;
            } else {
                mainNode.mentions = seriesLinks.map(a => ({
                    "@type": "CreativeWorkSeries",
                    "name": a.textContent.trim(),
                    "url": a.href
                }));
            }
        }
    }
    schemaScript.textContent = JSON.stringify(graph, null, 2);
}
