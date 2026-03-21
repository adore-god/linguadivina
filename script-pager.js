(function seriesAndSchemaManager() {
    const map = window.labelMap;
    const labelContainer = document.querySelector('.label-links');
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const targetSelector = isIndexPage ? '.latest-posts' : '.share-dropdown';
    const target = document.querySelector(targetSelector);

    if (!labelContainer || !map || !target) {
        setTimeout(seriesAndSchemaManager, 200);
        return;
    }

    // 1. DOM GENERATION
    const currentPage = window.location.href;
    const matchedScrollUrls = [];
    const allLinks = labelContainer.querySelectorAll("a");

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

    if (matchedScrollUrls.length > 0) {
        const groups = [];
        matchedScrollUrls.forEach(scrollUrl => {
            const groupEntries = [];
            for (let articlePath in map) {
                // EXCLUDE CURRENT PAGE
                if (articlePath === currentPage || articlePath === window.location.pathname) continue;
                
                const entry = map[articlePath];
                // ONLY add if there is a valid title
                if (entry && entry.title && entry.title.trim() !== "") {
                    const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];
                    if (seriesList.includes(scrollUrl)) {
                        groupEntries.push([articlePath, entry.title.trim()]);
                    }
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
            titleContainer.innerHTML = "<h2>More Reading</h2>";
            const container = document.createElement("div");
            container.id = "series-links-wrapper";

            groups.forEach(group => {
                group.entries.forEach(([path, linkTitle]) => {
                    const div = document.createElement("div");
                    const a = document.createElement("a");
                    a.href = path;
                    a.textContent = linkTitle;
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

    // 2. SCHEMA FIX (STRICT INJECTION)
    setTimeout(function() {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) return;

        let graphObj;
        try {
            graphObj = JSON.parse(schemaScript.textContent);
        } catch (e) { return; }

        if (!graphObj["@graph"]) return;

        // TARGET the main Article/WebPage node ONLY.
        // We explicitly avoid anything with the Holy Bible ID.
        const mainNode = graphObj["@graph"].find(n => 
            (n["@type"] === "BlogPosting" || n["@type"] === "WebPage") && 
            n["@id"] !== "https://linguadivina.uk/source/holy-bible"
        );

        if (!mainNode) return;

        // CLEANUP: Remove any existing hasPart or mentions to prevent duplicates/blanks
        delete mainNode.hasPart;
        delete mainNode.mentions;

        // Handle Home Page
        const postsContainer = document.querySelector('.latest-posts, #latest-posts');
        if (postsContainer) {
            const links = Array.from(postsContainer.querySelectorAll("a"))
                               .filter(a => a.innerText.trim().length > 0);
            if (links.length > 0) {
                mainNode.mainEntity = {
                    "@type": "ItemList",
                    "name": "Latest Updated Articles",
                    "itemListElement": links.map((a, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "url": a.href,
                        "name": a.innerText.trim()
                    }))
                };
            }
        }

        // Handle Article Page
        const seriesWrapper = document.getElementById("series-links-wrapper");
        if (seriesWrapper) {
            const sLinks = Array.from(seriesWrapper.querySelectorAll("a"))
                                .filter(a => a.innerText.trim().length > 0);
            
            if (sLinks.length > 0) {
                if (mainNode["@type"] === "BlogPosting") {
                    mainNode.hasPart = {
                        "@type": "ItemList",
                        "name": "Related Series Articles",
                        "itemListElement": sLinks.map((a, i) => ({
                            "@type": "ListItem",
                            "position": i + 1,
                            "url": a.href,
                            "name": a.innerText.trim()
                        }))
                    };
                } else {
                    mainNode.mentions = sLinks.map(a => ({
                        "@type": "CreativeWorkSeries",
                        "name": a.innerText.trim(),
                        "url": a.href
                    }));
                }
            }
        }

        // Final Filter: Rebuild @graph array to ensure no "null" or "empty" objects exist
        graphObj["@graph"] = graphObj["@graph"].filter(n => n && Object.keys(n).length > 1);

        schemaScript.textContent = JSON.stringify(graphObj, null, 2);
    }, 2000);
})();
