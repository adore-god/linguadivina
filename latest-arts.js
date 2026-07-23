async function loadLatestPosts() {
    const container = document.getElementById('modi-posts');

    try {
        const response = await fetch('https://linguadivina.uk/sitemap_latest.xml');
        const text = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const urls = xmlDoc.getElementsByTagName('url');

        const latestPosts = Array.from(urls).slice(0, 30);

        const card = document.createElement('div');
        card.className = 'card';

        const h3 = document.createElement('h3');
        h3.textContent = 'Latest Posts';
        card.appendChild(h3);

        const ul = document.createElement('ul');

        latestPosts.forEach(url => {
            const loc = url.getElementsByTagName('loc')[0].textContent;
            const titleTag = url.getElementsByTagName('title')[0];
            const title = titleTag ? titleTag.textContent : loc;

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = loc;
            a.textContent = title;
            li.appendChild(a);
            ul.appendChild(li);
        });

        card.appendChild(ul);
        container.appendChild(card);
        document.dispatchEvent(new Event('latestPostsReady'));

    } catch (err) {
        console.error("Error loading latest posts:", err);
        container.textContent = "Unable to load latest posts.";
    }
}

window.addEventListener('DOMContentLoaded', loadLatestPosts);