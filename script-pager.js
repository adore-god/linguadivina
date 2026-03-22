(function linguadivinaSchemaManager() {
    const map = window.labelMap;
    const labelContainer = document.querySelector('.label-links');
    
    // 1. DETERMINING TARGET
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const targetSelector = isIndexPage ? '.latest-posts' : '.share-dropdown';
    const target = document.querySelector(targetSelector);

    // If elements aren't ready, retry quickly
    if (!labelContainer || !map || !target) {
        setTimeout(linguadivinaSchemaManager, 100);
        return;
    }

    // --- STEP 1: GENERATE ITEM LISTS (DOM) ---
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
                });
                const divider = document.createElement("div");
                divider.className = "series-group-divider";
                container.appendChild(divider);
            });

            target.after(titleContainer);       
            titleContainer.after(container);
        }
    }

    // --- STEP 2: TURN ITEM LISTS INTO SCHEMA DATA ---
    // We execute this immediately now that the DOM work above is done
    updateJsonLd();

    function updateJsonLd() {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) return;

        let graph;
        try {
            graph = JSON.parse(schemaScript.textContent);
        } catch (e) { return; }

        const nodes = graph["@graph"] ? graph["@graph"] : [graph];
        const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
        if (!mainNode) return;

        // Handle Latest Posts
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

        // Handle Series Links
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
                
                if (mainNode["@type"] === "BlogPosting") {
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

        // --- NEW: Handle Bible Citations (<cite> tags) ---
        const bibleRefs = Array.from(document.querySelectorAll('cite.bibleref'));
        if (bibleRefs.length) {
            mainNode.citation = bibleRefs.map(ref => ({
                "@type": "CreativeWork",
                "@id": ref.getAttribute('itemid') || undefined,
                "name": ref.textContent.trim(),
                "identifier": ref.getAttribute('data-book') + " " + ref.getAttribute('data-chapter') + ":" + ref.getAttribute('data-verse')
            }));
        }

        schemaScript.textContent = JSON.stringify(graph, null, 2);
    }
})();
