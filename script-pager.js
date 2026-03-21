
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

    function toPath(url) {
        try { return new URL(url).pathname; }
        catch { return url; }
    }

    const currentPath = window.location.pathname;
    const allLinks = labelContainer.querySelectorAll("a");
    const matchedScrollUrls = [];

    allLinks.forEach(link => {
        const linkSlug = link.href.split("/").pop();
        for (let articlePath in map) {
            const seriesList = map[articlePath].series;
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
            if (toPath(articlePath) === currentPath) continue;
            const entry = map[articlePath];
            const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];
            if (seriesList.some(s => toPath(s) === toPath(scrollUrl))) {
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

    // ---- Schema update fires HERE, after links are fully built ----
    updateSchema(container);
})();

function updateSchema(seriesWrapper) {
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) return;

    let graph;
    try {
        graph = JSON.parse(schemaScript.textContent);
    } catch (e) { return; }

    const nodes = graph["@graph"] ? graph["@graph"] : [graph];
    const mainNode = nodes.find(n =>
        n["@type"] === "BlogPosting" ||
        n["@type"] === "Article" ||
        n["@type"] === "WebPage"
    );
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

    if (seriesWrapper) {
        const seriesLinks = Array.from(seriesWrapper.querySelectorAll("a"));
        if (seriesLinks.length) {
            if (mainNode["@type"] === "BlogPosting" || mainNode["@type"] === "Article") {
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

window.addEventListener("load", function () {
    setTimeout(function () {
        updateSchema(null);
    }, 2000);
});
