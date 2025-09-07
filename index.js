require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;
let urlDatabase = [];
let idCounter = 1;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post(
  "/api/shorturl",
  function (req, res, next) {
    let url = req.body.url;

    // Check if URL is provided
    if (!url) {
      return res.json({ error: "invalid url" });
    }

    try {
      url = new URL(req.body.url);
      // Only allow http and https protocols
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return res.json({ error: "invalid url" });
      }
    } catch (err) {
      return res.json({ error: "invalid url" });
    }

    dns.lookup(url.hostname, (err, address, family) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }
      next();
    });
  },
  function (req, res) {
    const originalURL = req.body.url;
    const id = idCounter++;
    urlDatabase[id] = originalURL;
    res.json({
      original_url: originalURL, // Changed from originalURL to original_url
      short_url: id,
    });
  },
);

app.get("/api/shorturl/:id", function (req, res) {
  const id = parseInt(req.params.id);
  const originalUrl = urlDatabase[id];

  if (!originalUrl) {
    return res.json({ error: "No short URL found for the given input" });
  }

  res.redirect(originalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
