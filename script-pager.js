(function() {
    const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html" || window.location.pathname === "";
    
    function injectUI() {
        const labelContainer = document.querySelector('.label-links');
        const map = window.labelMap;
        const targetSelector = isIndexPage ? '.latest-posts' : '.share-dropdown';
        const target = document.querySelector(targetSelector);

        if (!labelContainer || !map || !target) return false;

        const currentPage = window.location.href;
        const matchedUrls = [];
        labelContainer.querySelectorAll("a").forEach(link => {
            const slug = link.href.split("/").pop();
            for (let path in map) {
                const series = Array.isArray(map[path].series) ? map[path].series : [map[path].series];
                series.forEach(s => {
                    if (s.split("/").pop() === slug && !matchedUrls.includes(s)) matchedUrls.push(s);
                });
            }
        });

        if (matchedUrls.length === 0) return false;

        const wrapper = document.createElement("div");
        wrapper.id = "series-links-wrapper";
        wrapper.innerHTML = `<div class="series-links-title"><h2>More Reading</h2></div>`;

        matchedUrls.forEach(url => {
            Object.entries(map).forEach(([path, entry]) => {
                if (path !== currentPage && (Array.isArray(entry.series) ? entry.series : [entry.series]).includes(url)) {
                    const div = document.createElement("div");
                    div.innerHTML = `<a href="${path}">${entry.title}</a>`;
                    wrapper.appendChild(div);
                }
            });
        });

        target.after(wrapper);
        return true;
    }

    function updateSchema() {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) return;

        let graph;
        try { graph = JSON.parse(schemaScript.textContent); } catch (e) { return; }

        const nodes = graph["@graph"] || [graph];
        const currentUrl = window.location.href.split('#')[0].split('?')[0];

        // STRICT TARGETING: Only the node matching this page's URL
        const mainNode = nodes.find(n => n["@id"] && n["@id"].includes(currentUrl));
        if (!mainNode) return;

        // 1. SERIES LIST (The "One List" for Articles)
        const seriesLinks = Array.from(document.querySelectorAll("#series-links-wrapper a"));
        if (seriesLinks.length > 0) {
            mainNode.hasPart = {
                "@type": "ItemList",
                "name": "Related Series Articles",
                "itemListElement": seriesLinks.map((a, i) => ({
                    "@type": "ListItem",
                    "position": i + 1,
                    "url": a.href,
                    "name": a.textContent.trim()
                }))
            };
        }

        // 2. LATEST POSTS (STRICTLY Index Only)
        if (isIndexPage) {
            const postLinks = Array.from(document.querySelectorAll("#latest-posts a"));
            if (postLinks.length > 0) {
                mainNode.mainEntity = {
                    "@type": "ItemList",
                    "name": "Latest Updated Articles",
                    "itemListElement": postLinks.map((a, i) => ({
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

    // Execution sequence
    const run = () => {
        if (injectUI()) {
            // Only update schema if UI was successfully rendered
            setTimeout(updateSchema, 1000);
        }
    };

    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run);
})();
