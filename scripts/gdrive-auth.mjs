import http from "node:http";
import { readFileSync, appendFileSync } from "node:fs";

const jsonPath = process.argv[2];
const PORT = 5555;
const REDIRECT = "http://localhost:" + PORT;
const SCOPE = "https://www.googleapis.com/auth/drive.file";

const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
const cfg = raw.installed || raw.web;
const CLIENT_ID = cfg.client_id;
const CLIENT_SECRET = cfg.client_secret;

const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
  client_id: CLIENT_ID, redirect_uri: REDIRECT, response_type: "code",
  scope: SCOPE, access_type: "offline", prompt: "consent",
}).toString();
console.log("AUTH_URL " + authUrl);

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  const err = u.searchParams.get("error");
  if (err) { res.end("Error: " + err); console.log("CONSENT_ERROR " + err); server.close(); process.exit(1); }
  const code = u.searchParams.get("code");
  if (!code) { res.statusCode = 204; res.end(); return; }
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT, grant_type: "authorization_code" }).toString(),
    });
    const t = await r.json();
    if (!t.refresh_token) {
      res.end("No refresh token returned. Revoke access at myaccount.google.com/permissions then retry.");
      console.log("NO_REFRESH_TOKEN " + JSON.stringify(t).slice(0, 200));
      server.close(); process.exit(1);
    }
    appendFileSync(".env.local", "\n# Google Drive storage\nGDRIVE_CLIENT_ID=" + CLIENT_ID + "\nGDRIVE_CLIENT_SECRET=" + CLIENT_SECRET + "\nGDRIVE_REFRESH_TOKEN=" + t.refresh_token + "\n");
    res.setHeader("Content-Type", "text/html");
    res.end("<h2>MomentDrop: Google Drive connected</h2><p>You can close this tab and return to the chat.</p>");
    console.log("SUCCESS refresh_token_length=" + t.refresh_token.length + " (saved to .env.local)");
    server.close(); process.exit(0);
  } catch (e) {
    res.end("Error: " + e.message); console.log("TOKEN_ERROR " + e.message); server.close(); process.exit(1);
  }
});
server.listen(PORT, () => console.log("Listening on " + REDIRECT + " — waiting for authorization..."));
