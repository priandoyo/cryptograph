const OWNER = process.env.GITHUB_OWNER || "priandoyo";
const REPO = process.env.GITHUB_REPO || "cryptograph";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;

const API = "https://api.github.com";

// GitHub API headers
function githubHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

// Read public JSON files, such as config.json
async function readPublicJSON(filename) {
  const url =
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${filename}?t=${Date.now()}`;

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `Cannot read ${filename} from GitHub (${response.status})`
    );
  }

  return response.json();
}

// Read workshop configuration
async function getConfig() {
  return readPublicJSON("config.json");
}

// Read submissions.json directly through GitHub Contents API
// Returns both file SHA and submission data
async function getArchive() {
  const url =
    `${API}/repos/${OWNER}/${REPO}/contents/submissions.json?ref=${BRANCH}`;

  const response = await fetch(url, {
    headers: githubHeaders(),
    cache: "no-store"
  });

  if (!response.ok) {
    const detail = await response.text();

    throw new Error(
      `Cannot read submissions.json (${response.status}): ${detail}`
    );
  }

  const file = await response.json();

  const content = Buffer.from(
    file.content.replace(/\s/g, ""),
    "base64"
  ).toString("utf8");

  return {
    sha: file.sha,
    data: JSON.parse(content)
  };
}

// Save updated submissions.json to GitHub
async function saveArchive(data, sha) {
  const url =
    `${API}/repos/${OWNER}/${REPO}/contents/submissions.json`;

  const content = Buffer.from(
    JSON.stringify(data, null, 2)
  ).toString("base64");

  return fetch(url, {
    method: "PUT",
    headers: {
      ...githubHeaders(),
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
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );

  try {
    // Allow only GET and POST
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    // GET and POST both require GitHub access
    if (!TOKEN) {
      return res.status(500).json({
        error: "GITHUB_TOKEN is not configured in Vercel."
      });
    }

    // Read workshop configuration
    const config = await getConfig();

    // GET: Return current leaderboard
    if (req.method === "GET") {
      const archive = await getArchive();

      return res.status(200).json({
        config,
        submissions: archive.data.submissions || []
      });
    }

    // POST: Receive student submission
    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          error: "Invalid JSON request."
        });
      }
    }

    const name = String(body?.name || "").trim();
    const answer = String(body?.answer || "").trim();

    // Validate input
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

    // Check submission availability
    if (!config.accept_submissions) {
      return res.status(403).json({
        error: "Submissions are closed."
      });
    }

    // Validate submission limit
    const limit = Number(config.max_submissions);

    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error(
        "Invalid max_submissions in config.json"
      );
    }

    // Retry if another participant updates the file concurrently
    for (let attempt = 0; attempt < 8; attempt++) {

      // Read latest archive and SHA
      const archive = await getArchive();
      const submissions = archive.data.submissions || [];

      // Check submission limit
      if (submissions.length >= limit) {
        return res.status(409).json({
          error: "Submission limit reached."
        });
      }

      // Create new submission
      submissions.push({
        id: submissions.length + 1,
        name,
        answer,
        timestamp: new Date().toISOString()
      });

      // Save updated archive
      const result = await saveArchive(
        { submissions },
        archive.sha
      );

      if (result.ok) {
        return res.status(201).json({
          success: true,
          message: "Submission received.",
          total_submissions: submissions.length
        });
      }

      // Capture GitHub error details
      const detail = await result.text();

      console.error(
        "GitHub update failed:",
        result.status,
        detail
      );

      // Retry concurrent update conflicts
      if (result.status === 409) {
        continue;
      }

      if (result.status === 403) {
        return res.status(502).json({
          error:
            "GitHub permission denied. Check GITHUB_TOKEN permissions."
        });
      }

      if (result.status === 422) {
        return res.status(502).json({
          error:
            "GitHub rejected the update. Check repository, branch and file SHA."
        });
      }

      return res.status(502).json({
        error:
          `GitHub update failed (${result.status}). Check Vercel runtime logs.`
      });
    }

    // All retries exhausted
    return res.status(503).json({
      error:
        "Too many simultaneous submissions. Please try again."
    });

  } catch (error) {
    console.error("Cryptograph API error:", error);

    return res.status(500).json({
      error: error.message || "Unknown server error"
    });
  }
};
