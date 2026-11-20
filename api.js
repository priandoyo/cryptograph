const OWNER = process.env.GITHUB_OWNER || "priandoyo";
const REPO = process.env.GITHUB_REPO || "cryptograph";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;

const API = "https://api.github.com";

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

// Read public workshop configuration from GitHub
async function getConfig() {
  const url =
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/config.json`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Cannot read workshop configuration");
  }

  return response.json();
}

// Read submission archive and its current GitHub file SHA
async function getArchive() {
  const url =
    `${API}/repos/${OWNER}/${REPO}/contents/submissions.json?ref=${BRANCH}`;

  const response = await fetch(url, {
    headers: headers()
  });

  if (!response.ok) {
    throw new Error("Cannot read submission archive");
  }

  const file = await response.json();

  const content = Buffer.from(
    file.content.replace(/\n/g, ""),
    "base64"
  ).toString("utf8");

  return {
    sha: file.sha,
    data: JSON.parse(content)
  };
}

// Save updated archive back to GitHub
async function saveArchive(data, sha) {
  const url =
    `${API}/repos/${OWNER}/${REPO}/contents/submissions.json`;

  const content = Buffer.from(
    JSON.stringify(data, null, 2)
  ).toString("base64");

  return fetch(url, {
    method: "PUT",
    headers: {
      ...headers(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update workshop submissions",
      content,
      sha,
      branch: BRANCH
    })
  });
}

// Main API handler
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (!TOKEN) {
      throw new Error("GitHub token is not configured");
    }

    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const config = await getConfig();

    // GET: return leaderboard data
    if (req.method === "GET") {
      const archive = await getArchive();

      return res.status(200).json({
        config,
        submissions: archive.data.submissions || []
      });
    }

    // POST: receive student answer
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const name = String(body?.name || "").trim();
    const answer = String(body?.answer || "").trim();

    if (
      !name ||
      !answer ||
      name.length > 100 ||
      answer.length > 500
    ) {
      return res.status(400).json({
        error: "Please enter a valid name and answer."
      });
    }

    if (!config.accept_submissions) {
      return res.status(403).json({
        error: "Submissions are closed."
      });
    }

    const limit = Number(config.max_submissions);

    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("Invalid submission limit");
    }

    // Retry if another submission updates the file concurrently
    for (let attempt = 0; attempt < 8; attempt++) {
      const archive = await getArchive();
      const submissions = archive.data.submissions || [];

      if (submissions.length >= limit) {
        return res.status(409).json({
          error: "Submission limit reached."
        });
      }

      submissions.push({
        id: submissions.length + 1,
        name,
        answer,
        timestamp: new Date().toISOString()
      });

      const result = await saveArchive(
        { submissions },
        archive.sha
      );

      if (result.ok) {
        return res.status(201).json({
          success: true,
          message: "Submission received."
        });
      }

      // GitHub reports a conflict if the file changed
      if (
        result.status !== 409 &&
        result.status !== 422
      ) {
        const detail = await result.text();
        console.error("GitHub error:", detail);
        throw new Error("GitHub update failed");
      }
    }

    return res.status(503).json({
      error: "Busy server. Please submit again."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error. Please contact the instructor."
    });
  }
};
