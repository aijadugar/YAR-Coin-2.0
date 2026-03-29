const express = require("express");
const { getRepoContributors } = require("../utils/githubService");

const router = express.Router();

router.get("/repo/:owner/:repo", async (req, res) => {
  try {
    const { owner, repo } = req.params;

    const contributors = await getRepoContributors(owner, repo);

    res.json(contributors);

  } catch (error) {
    res.status(500).json({ message: "Error fetching contributors" });
  }
});

module.exports = router;