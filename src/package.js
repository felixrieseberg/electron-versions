const fs = require("fs");
const path = require("path");

function getPackage({ cwd }) {
  const expectedPath = path.join(cwd, "package.json");

  if (fs.existsSync(expectedPath)) {
    const data = fs.readFileSync(expectedPath, "utf-8");
    return JSON.parse(data);
  }
}

let repoUrl = null;
function getRepoUrl({ cwd }) {
  if (repoUrl !== null) {
    return repoUrl;
  }

  const p = getPackage({ cwd });
  const url = (p && p.repository && p.repository.url) || "";
  const isGitHub = url.indexOf("https://github.com/") > -1;

  // Stop here if we're not on GitHub
  if (!isGitHub) {
    return (repoUrl = undefined);
  }

  let cleanedUrl = url;

  if (cleanedUrl.endsWith(".git")) {
    cleanedUrl = url.slice(0, url.length - 4);
  }

  return (repoUrl = cleanedUrl);
}

module.exports = {
  getPackage,
  getRepoUrl,
};
