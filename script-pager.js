(function() {
    // --- 1. CONFIG & SELECTORS ---
    const CONFIG = {
        isIndex: window.location.pathname === "/" || window.location.pathname === "/index.html" || window.location.pathname === "",
        map: window.labelMap,
        labelContainer: document.querySelector('.label-links'),
        latestPostsContainer: document.getElementById('latest-posts'),
        // Where to inject the UI "More Reading" section
        uiTarget: (window.location.pathname === "/" || window.location.pathname === "/index.html" || window.location.pathname === "") 
                   ? document.querySelector('.latest-posts') 
                   : document.querySelector('.share-dropdown')
    };

    // --- 2. UI INJECTION LOGIC (More Reading List) ---
    function injectRelatedUI() {
        if (!CONFIG.labelContainer || !CONFIG.map || !CONFIG.uiTarget) return;

        const currentPage = window.location.href;
        const matchedUrls = [];
        
        // Find series matches
        CONFIG.labelContainer.querySelectorAll("a").forEach(link => {
            const slug = link.href.split("/").pop();
            for (let path in CONFIG.map) {
                const series = Array.isArray(CONFIG.map[path].series) ? CONFIG.map[path].series : [CONFIG.map[path].series];
                series.forEach(s => {
                    if (s.split("/").pop() === slug && !matchedUrls.includes(s)) matchedUrls.push(s);
                });
            }
        });

        if (matchedUrls.length === 0) return;

        // Build the groups
        const groups = matchedUrls.map(url => {
            const entries = Object.entries(CONFIG.map)
                .filter(([path, entry]) => path !== currentPage && (Array.isArray(entry.series) ? entry.series : [entry.series]).includes(url))
                .map(([path, entry]) => ({ path, title: entry.title }))
                .sort((a, b) => a.title.localeCompare(b.title));
            return { url, entries };
        }).filter(g => g.entries.length > 0);

        if (groups.length === 0) return;

        // Create DOM elements
        const fragment = document.createDocumentFragment();
        const titleDiv = document.createElement("div");
        titleDiv.className = "series-links-title";
        titleDiv.innerHTML = "<h2>More Reading</h2>";
        
        const wrapper = document.createElement("div");
        wrapper.id = "series-links-wrapper";

        groups.forEach(group => {
            group.entries.forEach(entry => {
                const div = document.createElement("div");
                div.innerHTML = `<a href="${entry.path}">${entry.title}</a>`;
                wrapper.appendChild(div);
            });
            const divider = document.createElement("div");
            divider.className = "series-group-divider";
            wrapper.appendChild(divider);
        });

        fragment.appendChild(titleDiv);
        fragment.appendChild(wrapper);
        CONFIG.uiTarget.after(fragment);
    }

    // --- 3. SCHEMA INJECTION LOGIC ---
    function updateSchema() {
        const script = document.querySelector('script[type="application/ld+json"]');
        if (!script) return;

        let data;
        try {
            data = JSON.parse(script.textContent);
        } catch (e) { return; }

        const nodes = data["@graph"] || [data];
        const mainNode = nodes.find(n => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
        if (!mainNode) return;

        // A: Handle Latest Posts (Index Only)
        if (CONFIG.isIndex && CONFIG.latestPostsContainer) {
            const links = Array.from(CONFIG.latestPostsContainer.querySelectorAll("a"));
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

        // B: Handle Series Links (Articles/Other)
        const wrapper = document.getElementById("series-links-wrapper");
        if (wrapper) {
            const links = Array.from(wrapper.querySelectorAll("a"));
            if (links.length > 0) {
                if (mainNode["@type"] === "BlogPosting") {
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
                } else {
                    // This is where the "blank creative work" lived. 
                    // We only create this array if there is actual content.
                    mainNode.mentions = links.map(a => ({
                        "@type": "CreativeWorkSeries",
                        "name": a.textContent.trim(),
                        "url": a.href
                    }));
                }
            }
        }

        script.textContent = JSON.stringify(data, null, 2);
    }

    // --- 4. EXECUTION ---
    // Run UI injection immediately or wait for map
    const runner = () => {
        if (!window.labelMap) {
            setTimeout(runner, 100);
            return;
        }
        injectRelatedUI();
        // Delay Schema update to ensure UI links are in the DOM
        setTimeout(updateSchema, 1000);
    };

    if (document.readyState === 'complete') {
        runner();
    } else {
        window.addEventListener('load', runner);
    }
})();
