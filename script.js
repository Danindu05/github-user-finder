document.getElementById("searchBtn").addEventListener("click", fetchUser);
document.getElementById("username").addEventListener("keypress", e => {
  if (e.key === "Enter") fetchUser();
});

const resultDiv = document.getElementById("result");

async function fetchUser() {
  const username = document.getElementById("username").value.trim();
  if (!username) return;

  resultDiv.innerHTML = `<p class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Fetching data...</p>`;

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const user = await userRes.json();

    const repoRes = await fetch(user.repos_url + "?per_page=100");
    const repos = await repoRes.json();

    const langCount = {};
    repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });

    const sortedLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
    const languagesHTML = sortedLangs
      .map(([l, count]) => `<span class="lang-tag">${l}: ${count}</span>`).join("");

    const topRepos = repos
      .sort((a,b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map(r => `
        <div class="repo">
          <h4><a href="${r.html_url}" target="_blank">${r.name}</a></h4>
          <p>
            <span><i class="fa-solid fa-star"></i> ${r.stargazers_count}</span>
            <span><i class="fa-solid fa-code-branch"></i> ${r.forks_count}</span>
          </p>
        </div>`).join("");

    resultDiv.innerHTML = `
      <div class="profile">
        <img src="${user.avatar_url}" alt="${user.login}">
        <div class="profile-info">
          <h2>${user.name || user.login}</h2>
          <p class="username">@${user.login}</p>
          <p>${user.bio || "No bio available"}</p>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label"><i class="fa-solid fa-book"></i> Repositories</span>
              <span class="stat-value">${user.public_repos}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label"><i class="fa-solid fa-users"></i> Followers</span>
              <span class="stat-value">${user.followers}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label"><i class="fa-solid fa-user-plus"></i> Following</span>
              <span class="stat-value">${user.following}</span>
            </div>
          </div>
        </div>
        <div class="profile-actions">
          <a class="profile-btn" href="${user.html_url}" target="_blank">
            <i class="fa-brands fa-github"></i>
            View Profile
          </a>
          ${user.blog ? `<a class="profile-btn secondary" href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank">
            <i class="fa-solid fa-link"></i>
            Website
          </a>` : ''}
        </div>
      </div>

      <div class="section">
        <h3><i class="fa-solid fa-code"></i> Languages Used</h3>
        ${languagesHTML || "<p style='color: var(--muted)'>No languages detected</p>"}
      </div>

      <div class="section">
        <h3><i class="fa-solid fa-star"></i> Top Starred Repositories</h3>
        <div class="repos-list">${topRepos || "<p style='color: var(--muted)'>No repositories found</p>"}</div>
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<p class="error"><i class="fa-solid fa-triangle-exclamation"></i> ${err.message}</p>`;
  }
}
