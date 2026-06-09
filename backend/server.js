const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const authRoutes =
  require("./routes/authRoutes"); 

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());
 
app.use("/auth", authRoutes);

app.get("/auth/login", (req, res) => {
  const clientId =
    process.env.DERIV_CLIENT_ID;

  const redirectUri =
    process.env.REDIRECT_URI;

  const loginUrl =
    `https://oauth.deriv.com/oauth2/authorize?app_id=${clientId}&l=EN&brand=deriv&redirect_uri=${redirectUri}`;

  res.redirect(loginUrl);
});

app.get("/auth/login", (req, res) => {
  const state =
    crypto.randomBytes(16).toString("hex");

  const verifier =
    crypto.randomBytes(32).toString("hex");

  res.cookie(
    "pkce_verifier",
    verifier,
    {
      httpOnly: true,
    }
  );

  res.cookie(
    "oauth_state",
    state,
    {
      httpOnly: true,
    }
  );

  res.json({
    success: true,

    state,

    verifier,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
