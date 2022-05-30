var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index.html"); // Renders the index.html file from the public folder
});

module.exports = router;
