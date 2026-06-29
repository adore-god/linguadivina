const subreddit = "biblenevillegoddard";

fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=10`, {
  headers: { "Accept": "application/json" }
})
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("reddit-feed");
    const posts = data.data.children;

    posts.forEach(({ data: post }) => {
      const postEl = document.createElement("div");
      postEl.innerHTML = `
        <h3><a href="https://reddit.com${post.permalink}" target="_blank">${post.title}</a></h3>
        <p>${new Date(post.created_utc * 1000).toLocaleDateString()}</p>
      `;
      container.appendChild(postEl);
    });
  })
  .catch(err => {
    document.getElementById("reddit-feed").innerText = "Unable to load feed.";
    console.error(err);
  });