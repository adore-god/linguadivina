// The direct Reddit JSON endpoint for your subreddit
const subreddit = "biblenevillegoddard";
const feedUrl = `https://www.reddit.com/r/${subreddit}/new.json?limit=5`;

fetch(feedUrl)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("reddit-feed");
    
    // Clear existing content to prevent duplicates if you call this again
    container.innerHTML = "";

    // Access the list of posts inside the 'children' array
    const posts = data.data.children;

    posts.forEach(post => {
      const item = post.data;
      const postEl = document.createElement("div");
      
      // Formatting the timestamp correctly
      const date = new Date(item.created_utc * 1000).toLocaleDateString();
      
      postEl.innerHTML = `
        <h3><a href="https://www.reddit.com${item.permalink}" target="_blank">${item.title}</a></h3>
        <p>Posted on: ${date}</p>
      `;
      container.appendChild(postEl);
    });
  })
  .catch(err => {
    const container = document.getElementById("reddit-feed");
    container.innerText = "Unable to load feed.";
    console.error("Reddit API Error:", err);
  });
