import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = 3000;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json",
};

createServer(async (req, res) => {
  let urlPath = req.url === "/" ? "/index.html" : req.url;
  // Strip query strings
  urlPath = urlPath.split("?")[0];

  try {
    const filePath = resolve(join(__dirname, urlPath));
    if (!filePath.startsWith(resolve(__dirname))) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("403 Forbidden");
      return;
    }
    const data = await readFile(filePath);
    const mime = MIME[extname(urlPath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
}).listen(PORT, () => {
  console.log(`Serving at http://localhost:${PORT}`);
});
