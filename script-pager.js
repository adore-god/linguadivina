(function seriesAndSchemaManager() {
    // 1. GENERATE SERIES LINKS
    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;
    
    // Determining target based on page
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const targetSelector = isIndexPage ? '.latest-posts' : '.share-dropdown';
    const target = document.querySelector(targetSelector);

    // If elements aren't ready yet, retry
    if (!labelContainer || !map || !target) {
        setTimeout(seriesAndSchemaManager, 100);
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

    // Only proceed with DOM creation if we actually have matches
    if (matchedScrollUrls.length > 0) {
        const groups = [];
        matchedScrollUrls.forEach(scrollUrl => {
            const groupEntries = [];
            for (let articlePath in map) {
                // Skip the current article so we don't link to ourselves
                if (articlePath === currentPage || (articlePath.includes(window.location.pathname) && window.location.pathname !== "/")) continue;
                
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

        if (groups.length > 0) {
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
        }
    }

    // 2. SCHEMA INJECTION (Runs after a delay to ensure DOM is stable)
    setTimeout(function() {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) return;

        let graphData;
        try {
            graphData = JSON.parse(schemaScript.textContent);
        } catch (e) { return; }

        // Find the specific node for the Article or WebPage, ignoring "Holy Bible" (CreativeWork)
        const nodes = graphData["@graph"] ? graphData["@graph"] : [graphData];
        const mainNode = nodes.find(n => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
        
        if (!mainNode) return;

        // Logic for Index Page (Latest Posts)
        const postsContainer = document.getElementById("latest-posts");
        if (postsContainer) {
            const postLinks = Array.from(postsContainer.querySelectorAll("a")).filter(a => a.textContent.trim() !== "");
            if (postLinks.length > 0) {
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

        // Logic for Article Page (Series Links)
        const seriesWrapper = document.getElementById("series-links-wrapper");
        if (seriesWrapper) {
            const seriesLinks = Array.from(seriesWrapper.querySelectorAll("a")).filter(a => a.textContent.trim() !== "");
            
            if (seriesLinks.length > 0) {
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
                    mainNode.mentions = seriesLinks.map(a => ({
                        "@type": "CreativeWorkSeries",
                        "name": a.textContent.trim(),
                        "url": a.href
                    }));
                }
            }
        }

        schemaScript.textContent = JSON.stringify(graphData, null, 2);
    }, 1500); // 1.5s delay is usually enough
})();
