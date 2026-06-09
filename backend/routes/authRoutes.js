const express = require("express");

const router = express.Router();

router.get("/login", (req, res) => {
  res.json({
    message:
      "Deriv OAuth Login Route Ready",
  });
});

module.exports = router;
