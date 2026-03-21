const feedUrl = "https://www.reddit.com/r/biblenevillegoddard/.rss";

  fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("reddit-feed");

      data.items.forEach(item => {
        const postEl = document.createElement("div");
        postEl.innerHTML = `
          <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
          <p>${new Date(item.pubDate).toLocaleDateString()}</p>
        `;
        container.appendChild(postEl);
      });
    })
    .catch(err => {
      document.getElementById("reddit-feed").innerText = "Unable to load feed.";
      console.error(err);
    });