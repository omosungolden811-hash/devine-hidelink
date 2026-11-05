const express = require("express");
const crypto = require("node:crypto");

const app = express();
const links = new Map();
app.use(express.json({ limit: "8kb" }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SHORTENER_API_KEY;

app.get("/", (_req, res) => {
  res.type("text").send("Forsaken Shortener is online.");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, storage: "temporary-memory", links: links.size });
});

app.post("/api/links", (req, res) => {
  if (!API_KEY || req.get("x-api-key") !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const raw = req.body && req.body.url;
  let target;
  try {
    target = new URL(raw);
    if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) {
      throw new Error("Invalid URL");
    }
  } catch {
    return res.status(400).json({ error: "A valid HTTP or HTTPS URL is required." });
  }

  let code;
  do {
    code = crypto.randomBytes(5).toString("base64url");
  } while (links.has(code));

  links.set(code, target.href);
  res.status(201).json({
    code,
    shortUrl: `${req.protocol}://${req.get("host")}/${code}`,
    originalUrl: target.href,
    storage: "temporary-memory"
  });
});

app.get("/:code", (req, res) => {
  const target = links.get(req.params.code);
  if (!target) return res.status(404).type("text").send("This short link was not found. It may have expired after a service restart.");
  return res.redirect(302, target);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Forsaken Shortener listening on port ${PORT}`);
});
