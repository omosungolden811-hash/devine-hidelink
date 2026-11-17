const express = require("express");
const crypto = require("node:crypto");
const app = express();
const links = new Map();
const requests = new Map();
app.use(express.json({ limit: "8kb" }));
const PORT = process.env.PORT || 3000;

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050914"><title>FORSAKEN — HideLink</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 50% 0%,#14366b 0,transparent 48%),#050914;color:#f3f6fc;font-family:Inter,system-ui,Arial,sans-serif;display:grid;place-items:center;padding:22px}.wrap{width:min(100%,560px)}.brand{font-size:12px;letter-spacing:.28em;font-weight:900;color:#9bcaff;margin-bottom:28px}.panel{background:linear-gradient(145deg,#101e35,#091222);border:1px solid #29466d;border-radius:20px;padding:clamp(20px,5vw,34px);box-shadow:0 25px 90px #0008}.eyebrow{color:#75baff;font-size:10px;letter-spacing:.22em;font-weight:800}.title{font-size:clamp(30px,8vw,42px);letter-spacing:-.05em;margin:10px 0}.sub{color:#9aaac0;font-size:13px;line-height:1.6;margin:0 0 24px}.preset-heading{color:#75baff;font-size:10px;letter-spacing:.18em;font-weight:850;margin:22px 0 9px}.presets{display:grid;gap:8px;margin-bottom:20px}.preset{display:grid;text-align:left;gap:5px;padding:13px;border:1px solid #29415f;background:#091629;border-radius:11px;color:#eaf3ff;cursor:pointer}.preset b{font-size:11px;letter-spacing:.08em}.preset span{font-size:11px;color:#91a7c2;overflow-wrap:anywhere}.preset em{font-size:9px;color:#79bdff;font-style:normal;font-weight:850;letter-spacing:.12em}.preset:active{border-color:#58a5ff;background:#123052}.choices{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:12px 0 22px}.choice{border:1px solid #29415f;background:#0a1527;color:#b9c9df;border-radius:12px;padding:14px 8px;font-weight:700;font-size:12px;cursor:pointer}.choice.active{border-color:#58a5ff;background:#16345a;color:#fff;box-shadow:0 0 20px #3988ff24}.label{display:block;color:#b7c6da;font-size:11px;font-weight:750;margin:0 0 8px}input{width:100%;background:#07101e;border:1px solid #2b405d;border-radius:11px;padding:15px;color:white;font:inherit;font-size:13px;outline:none}input:focus{border-color:#68adff}button.submit{width:100%;border:0;border-radius:11px;padding:15px;margin-top:14px;background:linear-gradient(100deg,#2877ed,#54b8ff);color:#061326;font-weight:900;letter-spacing:.06em;cursor:pointer}button:disabled{opacity:.55;cursor:wait}.note{color:#72849e;font-size:10px;line-height:1.6;margin-top:14px}.result{display:none;margin-top:20px;padding:16px;border:1px solid #2c5b8b;border-radius:13px;background:#081a2e}.result.show{display:block}.result strong{display:block;color:#9bcaff;font-size:12px;margin-bottom:10px}.result a{display:block;overflow-wrap:anywhere;color:#e9f4ff;font-size:13px;margin:8px 0}.result small{display:block;color:#8395ad;font-size:10px;margin-top:10px}.copy{width:100%;padding:12px;border-radius:9px;border:1px solid #3c75b3;background:#102b4a;color:#dceeff;font-weight:800;margin-top:8px}.error{color:#ff9b9b;font-size:12px;margin-top:12px;min-height:18px}@media(max-width:390px){.choices{gap:6px}.choice{font-size:10px;padding:12px 4px}}
</style></head><body><main class="wrap"><div class="brand">F / FORSAKEN NETWORK</div><section class="panel"><div class="eyebrow">HIDELINK · LINK TOOL</div><h1 class="title">Shorten your link.</h1><p class="sub">Choose what kind of link you’re sharing, paste the original URL, and create your Forsaken short link.</p><div class="preset-heading">YOUR ROBLOX LINKS</div><div class="presets">
<button class="preset" type="button" data-kind="Profile" data-url="https://www.roblox.com/users/23494923904/profile"><b>PROFILE URL</b><span>https://www.roblox.com/users/23494923904/profile</span><em>USE THIS URL</em></button>
<button class="preset" type="button" data-kind="Private server" data-url="https://www.roblox.com/share?code=432c637cacf937468947036827ff896f&amp;type=Server"><b>SERVER URL</b><span>Roblox private server link</span><em>USE THIS URL</em></button>
<button class="preset" type="button" data-kind="Group" data-url="https://www.roblox.com/communities/349673921/about"><b>GROUP URL</b><span>https://www.roblox.com/communities/349673921/about</span><em>USE THIS URL</em></button>
</div><span class="label">SELECT LINK TYPE</span><div class="choices"><button class="choice active" type="button" data-kind="Profile">Profile</button><button class="choice" type="button" data-kind="Private server">Private server</button><button class="choice" type="button" data-kind="Group">Group</button></div><label class="label" for="url">ORIGINAL LINK</label><input id="url" type="url" placeholder="https://..." autocomplete="url"><button class="submit" id="make">GENERATE SHORT LINK</button><div class="error" id="error" role="status"></div><div class="result" id="result"><strong id="kind"></strong><span class="label">YOUR SHORT LINK</span><a id="short" target="_blank" rel="noopener"></a><button class="copy" id="copy" type="button">COPY SHORT LINK</button><small>Original link: <span id="original"></span></small></div><p class="note">Only share links you trust. Short links redirect to the original destination. Links are currently held in temporary service storage and may stop working after a service restart.</p></section></main>
<script>
let kind="Profile";const choices=[...document.querySelectorAll(".choice")];choices.forEach(b=>b.addEventListener("click",()=>{kind=b.dataset.kind;choices.forEach(x=>x.classList.toggle("active",x===b))}));
document.querySelectorAll(".preset").forEach(b=>b.addEventListener("click",()=>{kind=b.dataset.kind;choices.forEach(x=>x.classList.toggle("active",x.dataset.kind===kind));document.getElementById("url").value=b.dataset.url.replace(/&amp;/g,"&");document.getElementById("url").scrollIntoView({behavior:"smooth",block:"center"});document.getElementById("url").focus()}));
const make=document.getElementById("make"),error=document.getElementById("error"),result=document.getElementById("result");
make.addEventListener("click",async()=>{error.textContent="";result.classList.remove("show");const url=document.getElementById("url").value.trim();if(!url){error.textContent="Paste a link first.";return}make.disabled=true;make.textContent="CREATING...";try{const r=await fetch("/api/links",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,kind})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Could not create the link.");document.getElementById("kind").textContent="FORSAKEN · "+data.kind.toUpperCase();const a=document.getElementById("short");a.href=data.shortUrl;a.textContent=data.shortUrl;document.getElementById("original").textContent=data.originalUrl;result.classList.add("show");}catch(e){error.textContent=e.message}finally{make.disabled=false;make.textContent="GENERATE SHORT LINK"}});
document.getElementById("copy").addEventListener("click",async()=>{const value=document.getElementById("short").textContent;try{await navigator.clipboard.writeText(value);document.getElementById("copy").textContent="COPIED";}catch{error.textContent="Select and copy the short link above."}});
</script></body></html>`;

app.get("/", (_req, res) => res.type("html").send(page));
app.get("/health", (_req, res) => res.json({ ok: true, storage: "temporary-memory", links: links.size }));

app.post("/api/links", (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter(t => now - t < 60_000);
  if (recent.length >= 10) return res.status(429).json({ error: "Too many links created. Please wait a minute and try again." });
  recent.push(now); requests.set(ip, recent);
  let target;
  try {
    target = new URL(req.body?.url);
    if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) throw new Error();
  } catch {
    return res.status(400).json({ error: "Enter a valid HTTP or HTTPS link." });
  }
  const allowed = ["Profile", "Private server", "Group"];
  const kind = allowed.includes(req.body?.kind) ? req.body.kind : "Profile";
  let code;
  do { code = crypto.randomBytes(5).toString("base64url"); } while (links.has(code));
  links.set(code, { url: target.href, kind });
  res.status(201).json({ code, kind, shortUrl: `${req.protocol}://${req.get("host")}/${code}`, originalUrl: target.href });
});

app.get("/:code", (req, res) => {
  const entry = links.get(req.params.code);
  if (!entry) return res.status(404).type("text").send("Short link not found. It may have expired after a service restart.");
  res.redirect(302, entry.url);
});
app.listen(PORT, "0.0.0.0", () => console.log(`Forsaken Shortener listening on ${PORT}`));
