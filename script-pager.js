(function buildSeriesCard() {
    const map = window.labelMap;
    const grid = document.getElementById('series-cards');

    if (!map || !grid) {
        setTimeout(buildSeriesCard, 100);
        return;
    }

    const currentUrl = window.location.href.split('#')[0];

    const card = document.createElement("div");
    card.className = "card";

    const h3 = document.createElement("h3");
    h3.textContent = "Related";
    card.appendChild(h3);

    const ul = document.createElement("ul");

    for (let url in map) {
        const cleanUrl = url.split('#')[0];
        if (cleanUrl === currentUrl) continue;

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = url;
        a.textContent = map[url].title;
        li.appendChild(a);
        ul.appendChild(li);
    }

    card.appendChild(ul);
    grid.appendChild(card);
})();

window.addEventListener("load", function () {
    setTimeout(function () {
        const schemaScript = document.querySelector('#main-schema');
        if (!schemaScript) return;

        let graph;
        try {
            graph = JSON.parse(schemaScript.textContent);
        } catch (e) { return; }

        const nodes = graph["@graph"] ? graph["@graph"] : [graph];
        const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
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

        const seriesWrapper = document.getElementById("series-cards");
        if (seriesWrapper) {
            const seriesLinks = Array.from(seriesWrapper.querySelectorAll("a"));

            if (seriesLinks.length) {
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
                    mainNode.mentions = seriesLinks.map((a) => ({
                        "@type": "CreativeWorkSeries",
                        "name": a.textContent.trim(),
                        "url": a.href
                    }));
                }
            }
        }

        schemaScript.textContent = JSON.stringify(graph, null, 2);
    }, 2000);
});
