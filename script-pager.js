(function unifyContentAndSchema() {
    const map = window.labelMap;
    const labelContainer = document.querySelector('.label-links');
    
    // --- DETERMINING TARGET BASED ON PAGE ---
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const targetSelector = isIndexPage ? '.latest-posts' : '.share-dropdown';
    const target = document.querySelector(targetSelector);

    // Initial check for required elements
    if (!map || !target) {
        setTimeout(unifyContentAndSchema, 100);
        return;
    }

    // --- 1. HANDLE SERIES LINKS (If Label Container exists) ---
    const schemaSeriesItems = [];
    if (labelContainer) {
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

        if (matchedScrollUrls.length > 0) {
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

                        // Build Schema object as we go
                        schemaSeriesItems.push({
                            "@type": "ListItem",
                            "position": schemaSeriesItems.length + 1,
                            "url": a.href,
                            "name": linkTitle.trim()
                        });
                    });
                    const divider = document.createElement("div");
                    divider.className = "series-group-divider";
                    container.appendChild(divider);
                });

                target.after(titleContainer);
                titleContainer.after(container);
            }
        }
    }

    // --- 2. HANDLE LATEST POSTS (Schema Only) ---
    const latestPostsContainer = document.getElementById("latest-posts");
    const schemaLatestItems = [];
    if (latestPostsContainer) {
        const postLinks = Array.from(latestPostsContainer.querySelectorAll("a"));
        postLinks.forEach((a, index) => {
            schemaLatestItems.push({
                "@type": "ListItem",
                "position": index + 1,
                "url": a.href,
                "name": a.textContent.trim()
            });
        });
    }

    // --- 3. INJECT INTO JSON-LD SCHEMA ---
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (schemaScript) {
        try {
            let graph = JSON.parse(schemaScript.textContent);
            const nodes = graph["@graph"] ? graph["@graph"] : [graph];
            const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");

            if (mainNode) {
                // Apply Latest Posts Schema
                if (schemaLatestItems.length > 0) {
                    mainNode.mainEntity = {
                        "@type": "ItemList",
                        "name": "Latest Updated Articles",
                        "itemListElement": schemaLatestItems
                    };
                }

                // Apply Series Links Schema
                if (schemaSeriesItems.length > 0) {
                    if (mainNode["@type"] === "BlogPosting") {
                        mainNode.hasPart = {
                            "@type": "ItemList",
                            "name": "Related Series Articles",
                            "itemListElement": schemaSeriesItems
                        };
                    } else {
                        mainNode.mentions = schemaSeriesItems.map(item => ({
                            "@type": "CreativeWorkSeries",
                            "name": item.name,
                            "url": item.url
                        }));
                    }
                }
                schemaScript.textContent = JSON.stringify(graph, null, 2);
            }
        } catch (e) {
            console.error("Schema injection failed:", e);
        }
    }
})();
