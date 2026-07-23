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