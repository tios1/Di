import RPC from "discord-rpc";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const LASTFM_USER = "YOUR_LASTFM_USERNAME";
const LASTFM_API_KEY = "YOUR_LASTFM_API_KEY";
const DISCORD_CLIENT_ID = "YOUR_DISCORD_APP_CLIENT_ID";

const CACHE_DIR = "./cache";
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

const rpc = new RPC.Client({ transport: "ipc" });

async function getNowPlaying() {
  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
    `&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

  const res = await fetch(url);
  const json = await res.json();

  const track = json.recenttracks.track[0];
  if (!track["@attr"]?.nowplaying) return null;

  return {
    title: track.name,
    artist: track.artist["#text"],
    album: track.album["#text"],
    image: track.image.find((i: any) => i.size === "extralarge")?.["#text"]
  };
}

async function uploadToCatbox(imageUrl: string): Promise<string> {
  const hash = crypto.createHash("md5").update(imageUrl).digest("hex");
  const cached = path.join(CACHE_DIR, `${hash}.txt`);

  if (fs.existsSync(cached)) {
    return fs.readFileSync(cached, "utf8");
  }

  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, "cover.jpg");

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form as any
  });

  const url = await res.text();
  fs.writeFileSync(cached, url);
  return url;
}

async function updatePresence() {
  const now = await getNowPlaying();
  if (!now || !now.image) return rpc.clearActivity();

  const imageUrl = await uploadToCatbox(now.image);

  rpc.setActivity({
    details: now.title,
    state: `by ${now.artist}`,
    largeImageKey: imageUrl,
    largeImageText: now.album,
    instance: false
  });
}

rpc.on("ready", () => {
  console.log("RPC connected");
  setInterval(updatePresence, 15_000);
});

rpc.login({ clientId: DISCORD_CLIENT_ID });
