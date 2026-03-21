(function() {
    // 1. UI INJECTION (The "More Reading" section on the page)
    function runUI() {
        const labelContainer = document.querySelector('.label-links');
        const map = window.labelMap;
        if (!labelContainer || !map) return;

        const isIndex = window.location.pathname === "/" || window.location.pathname === "/index.html" || window.location.pathname === "";
        const target = isIndex ? document.querySelector('.latest-posts') : document.querySelector('.share-dropdown');
        if (!target) return;

        const currentPage = window.location.href;
        const matchedScrollUrls = [];
        labelContainer.querySelectorAll("a").forEach(link => {
            const linkSlug = link.href.split("/").pop();
            for (let path in map) {
                const series = Array.isArray(map[path].series) ? map[path].series : [map[path].series];
                series.forEach(s => {
                    if (s.split("/").pop() === linkSlug && !matchedScrollUrls.includes(s)) matchedScrollUrls.push(s);
                });
            }
        });

        const groups = matchedScrollUrls.map(scrollUrl => {
            const entries = Object.entries(map)
                .filter(([path, entry]) => path !== currentPage && (Array.isArray(entry.series) ? entry.series : [entry.series]).includes(scrollUrl))
                .map(([path, entry]) => ({ path, title: entry.title }))
                .sort((a, b) => a.title.localeCompare(b.title));
            return entries;
        }).flat().filter((v, i, a) => a.findIndex(t => t.path === v.path) === i); // Unique entries

        if (groups.length === 0) return;

        const wrapper = document.createElement("div");
        wrapper.id = "series-links-wrapper";
        wrapper.innerHTML = `<div class="series-links-title"><h2>More Reading</h2></div>`;
        groups.forEach(entry => {
            const div = document.createElement("div");
            div.innerHTML = `<a href="${entry.path}">${entry.title}</a>`;
            wrapper.appendChild(div);
        });
        target.after(wrapper);
    }

    // 2. SCHEMA INJECTION
    function runSchema() {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) return;

        let graph;
        try { graph = JSON.parse(schemaScript.textContent); } catch (e) { return; }

        const nodes = graph["@graph"] || [graph];
        
        // TARGET ONLY THE ACTUAL ARTICLE OR INDEX PAGE
        // We explicitly skip the Bible node by checking for its specific ID or Author
        const mainNode = nodes.find(n => 
            (n["@type"] === "BlogPosting" || n["@type"] === "WebPage") && 
            n["@id"] !== "https://linguadivina.uk/source/holy-bible" &&
            n.name !== "The Holy Bible"
        );

        if (!mainNode) return;

        // A. Handle "Latest Updates" (On any page where the list exists)
        const postsBox = document.getElementById("latest-posts");
        if (postsBox) {
            const links = Array.from(postsBox.querySelectorAll("a")).filter(a => a.textContent.trim() !== "");
            if (links.length > 0) {
                mainNode.mainEntity = {
                    "@type": "ItemList",
                    "name": "Latest Updated Articles",
                    "itemListElement": links.map((a, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "url": a.href,
                        "name": a.textContent.trim()
                    }))
                };
            }
        }

        // B. Handle "Series Links" (The More Reading List)
        const seriesBox = document.getElementById("series-links-wrapper");
        if (seriesBox) {
            const links = Array.from(seriesBox.querySelectorAll("a")).filter(a => a.textContent.trim() !== "");
            if (links.length > 0) {
                // We use 'relatedLink' as it's cleaner for BlogPosting lists
                mainNode.hasPart = {
                    "@type": "ItemList",
                    "name": "Related Series Articles",
                    "itemListElement": links.map((a, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "url": a.href,
                        "name": a.textContent.trim()
                    }))
                };
            }
        }

        schemaScript.textContent = JSON.stringify(graph, null, 2);
    }

    // Run UI immediately, wait for Schema
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => {
            runUI();
            setTimeout(runSchema, 2000);
        });
    } else {
        runUI();
        setTimeout(runSchema, 2000);
    }
})();
