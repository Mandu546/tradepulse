const express = require("express");
const crypto = require("crypto");

const router = express.Router();

router.get("/login", (req, res) => {
  const clientId = process.env.DERIV_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;

  const state = crypto.randomBytes(16).toString("hex");

  const codeChallenge = crypto
    .createHash("sha256")
    .update(state)
    .digest("base64url");

  const authUrl =
    "https://auth.deriv.com/oauth2/auth" +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&scope=trade` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`;

  res.redirect(authUrl);
});

module.exports = router;
