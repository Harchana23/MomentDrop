import { readFileSync } from "node:fs";
const e = Object.fromEntries(readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.trimStart().startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return[l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const tok = async () => { const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:e.GDRIVE_CLIENT_ID,client_secret:e.GDRIVE_CLIENT_SECRET,refresh_token:e.GDRIVE_REFRESH_TOKEN,grant_type:"refresh_token"})}); return (await r.json()).access_token; };
const AT = await tok();
const auth = { Authorization: "Bearer " + AT };

async function findOrCreateFolder(name, parent) {
  const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${parent}' in parents`;
  const r = await fetch("https://www.googleapis.com/drive/v3/files?fields=files(id,name)&q=" + encodeURIComponent(q), { headers: auth });
  const d = await r.json();
  if (d.files && d.files.length) return d.files[0].id;
  const c = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", { method:"POST", headers:{...auth,"Content-Type":"application/json"}, body: JSON.stringify({ name, mimeType:"application/vnd.google-apps.folder", parents:[parent] }) });
  return (await c.json()).id;
}

const root = await findOrCreateFolder("MomentDrop", "root");
console.log("root folder id:", root);
const evFolder = await findOrCreateFolder("smoke-event", root);

// resumable upload session
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC","base64");
const init = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id", {
  method:"POST", headers:{...auth,"Content-Type":"application/json; charset=UTF-8","X-Upload-Content-Type":"image/png","X-Upload-Content-Length":String(png.length)},
  body: JSON.stringify({ name:"smoke.png", parents:[evFolder] }),
});
const sessionUri = init.headers.get("location");
console.log("resumable session:", sessionUri ? "ok" : "FAIL (" + init.status + ")");
const put = await fetch(sessionUri, { method:"PUT", headers:{"Content-Type":"image/png"}, body: png });
const fileId = (await put.json()).id;
console.log("upload -> file id:", fileId ? "ok" : "FAIL");
// make viewable
const perm = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, { method:"POST", headers:{...auth,"Content-Type":"application/json"}, body: JSON.stringify({ role:"reader", type:"anyone" }) });
console.log("set anyone-reader:", perm.ok ? "ok" : "FAIL");
// thumbnail (anonymous)
const thumb = await fetch(`https://drive.google.com/thumbnail?id=${fileId}&sz=w400`);
console.log("thumbnail:", thumb.status, thumb.headers.get("content-type"));
// download full (for ZIP)
const dl = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: auth });
console.log("download bytes:", (await dl.arrayBuffer()).byteLength);
// cleanup
await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method:"DELETE", headers: auth });
await fetch(`https://www.googleapis.com/drive/v3/files/${evFolder}`, { method:"DELETE", headers: auth });
console.log("cleaned up (kept root MomentDrop folder)");
