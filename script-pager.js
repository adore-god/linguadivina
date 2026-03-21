(function seriesAndSchemaManager() {
    // Prevent the script from running twice
    if (window.schemaManagerRan) return;
    window.schemaManagerRan = true;

    const map = window.labelMap;
    const labelContainer = document.querySelector('.label-links');
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    
    // 1. DOM PLACEMENT LOGIC
    const targetSelector = isIndexPage ? '.latest-posts' : '.share-dropdown';
    const target = document.querySelector(targetSelector);

    if (!map || !target) {
        setTimeout(seriesAndSchemaManager, 200);
        return;
    }

    // Only build the "More Reading" list if we are on an article or the index has labels
    if (labelContainer) {
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
                    if (articlePath === currentPage || articlePath.includes(window.location.pathname) && window.location.pathname !== "/") continue;
                    const entry = map[articlePath];
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
    }

    // 2. SCHEMA RECONSTRUCTION (The fix for the blank data)
    setTimeout(function() {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) return;

        let graphObj;
        try {
            graphObj = JSON.parse(schemaScript.textContent);
        } catch (e) { return; }

        if (!graphObj["@graph"]) return;

        // TARGETING: We only want the BlogPosting (Article) or the main WebPage (Home)
        // We EXPLICITLY ignore anything with "holy-bible" in the ID
        const mainNode = graphObj["@graph"].find(n => 
            (n["@type"] === "BlogPosting" || n["@type"] === "WebPage") && 
            (!n["@id"] || !n["@id"].includes("holy-bible"))
        );

        if (!mainNode) return;

        // CRITICAL: Wipe out any accidental injections before starting
        delete mainNode.hasPart;
        delete mainNode.mentions;
        delete mainNode.mainEntity;

        if (isIndexPage) {
            // INDEX PAGE ONLY: Inject "Latest Articles"
            const postsContainer = document.querySelector('.latest-posts, #latest-posts');
            if (postsContainer) {
                const links = Array.from(postsContainer.querySelectorAll("a")).filter(a => a.innerText.trim().length > 0);
                if (links.length > 0) {
                    mainNode.mainEntity = {
                        "@type": "ItemList",
                        "name": "Latest Updated Articles",
                        "itemListElement": links.map((a, i) => ({
                            "@type": "ListItem", "position": i + 1, "url": a.href, "name": a.innerText.trim()
                        }))
                    };
                }
            }
        } else {
            // ARTICLE PAGE ONLY: Inject "Related Series"
            const seriesWrapper = document.getElementById("series-links-wrapper");
            if (seriesWrapper) {
                const sLinks = Array.from(seriesWrapper.querySelectorAll("a")).filter(a => a.innerText.trim().length > 0);
                if (sLinks.length > 0) {
                    mainNode.hasPart = {
                        "@type": "ItemList",
                        "name": "Related Series Articles",
                        "itemListElement": sLinks.map((a, i) => ({
                            "@type": "ListItem", "position": i + 1, "url": a.href, "name": a.innerText.trim()
                        }))
                    };
                }
            }
        }

        // FINAL POLISH: Filter the graph to remove any empty objects that shouldn't be there
        graphObj["@graph"] = graphObj["@graph"].filter(n => n && Object.keys(n).length > 2);

        schemaScript.textContent = JSON.stringify(graphObj, null, 2);
    }, 1500);
})();
