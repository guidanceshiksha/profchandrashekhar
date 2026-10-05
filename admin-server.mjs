import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BLOG_POSTS } from "./src/blogData.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3001);
const adminPassword = process.env.ADMIN_PASSWORD || "";
const maxUploadBytes = 6 * 1024 * 1024;
const sessionLifetime = 8 * 60 * 60 * 1000;
const sessions = new Map();
const loginAttempts = new Map();
let posts = BLOG_POSTS.map((post) => ({ status: "published", ...post }));

if (adminPassword.length < 12) {
  console.error("Set ADMIN_PASSWORD to a value of at least 12 characters before starting the admin server.");
  process.exit(1);
}

const sendJson = (res, status, payload, extraHeaders = {}) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders });
  res.end(JSON.stringify(payload));
};

const readJson = (req, limit = 1024 * 1024) => new Promise((resolve, reject) => {
  let body = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    body += chunk;
    if (Buffer.byteLength(body) > limit) {
      reject(Object.assign(new Error("Request body is too large."), { status: 413 }));
      req.destroy();
    }
  });
  req.on("end", () => {
    try { resolve(JSON.parse(body || "{}")); }
    catch { reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 })); }
  });
  req.on("error", reject);
});

const slugify = (value) => String(value).normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

function sessionFor(req) {
  const cookie = req.headers.cookie || "";
  const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("blog_admin="))?.slice("blog_admin=".length);
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return { token, ...session };
}

function requireSession(req, res, requireCsrf = false) {
  const session = sessionFor(req);
  if (!session) {
    sendJson(res, 401, { error: "Please sign in to continue." });
    return null;
  }
  if (requireCsrf && req.headers["x-csrf-token"] !== session.csrf) {
    sendJson(res, 403, { error: "This request could not be verified. Refresh and try again." });
    return null;
  }
  return session;
}

function validatePost(input, previous = null) {
  const title = String(input.title || "").trim();
  const slug = slugify(input.slug || title);
  const category = String(input.category || "").trim();
  const date = String(input.date || "").trim();
  const excerpt = String(input.excerpt || "").trim();
  const status = input.status === "draft" ? "draft" : input.status === "published" ? "published" : "";
  const content = Array.isArray(input.content) ? input.content.map((part) => String(part).trim()).filter(Boolean) : [];
  const cover = String(input.cover || "").trim();
  const coverAlt = String(input.coverAlt || "").trim();
  const seoTitle = String(input.seoTitle || "").trim();
  const seoDescription = String(input.seoDescription || "").trim();
  const errors = [];

  if (!title || title.length > 140) errors.push("Title is required and must be 140 characters or fewer.");
  if (!slug || slug.length > 80) errors.push("A valid URL slug is required.");
  if (!category || category.length > 60) errors.push("Category is required and must be 60 characters or fewer.");
  if (!date || date.length > 40) errors.push("Publication date is required.");
  if (!excerpt || excerpt.length > 320) errors.push("Excerpt is required and must be 320 characters or fewer.");
  if (!status) errors.push("Choose draft or published status.");
  if (content.length > 40 || content.join("\n").length > 40000) errors.push("Article content is too long (maximum 40 paragraphs and 40,000 characters).");
  if (status === "published" && !content.length) errors.push("Add article content before publishing.");
  if (coverAlt.length > 150) errors.push("Cover image description must be 150 characters or fewer.");
  if (seoTitle.length > 70) errors.push("SEO title must be 70 characters or fewer.");
  if (seoDescription.length > 160) errors.push("SEO description must be 160 characters or fewer.");
  if (cover && !cover.startsWith("/assets/blog/") && !/^https:\/\//i.test(cover)) errors.push("Cover must be an uploaded image or an HTTPS URL.");

  let coverUrl = null;
  if (cover.startsWith("/assets/blog/")) {
    const name = cover.slice("/assets/blog/".length);
    if (!/^cover-[a-f0-9-]+\.(jpg|png|webp)$/.test(name) || !fs.existsSync(path.join(root, "assets", "blog", name))) errors.push("Select a valid uploaded cover image.");
    else coverUrl = cover;
  } else if (cover) {
    try {
      const url = new URL(cover);
      if (url.protocol !== "https:" || url.username || url.password) errors.push("Cover URL must use HTTPS and cannot contain credentials.");
      else coverUrl = url.href;
    } catch { errors.push("Enter a valid HTTPS cover image URL."); }
  }

  if (errors.length) throw Object.assign(new Error(errors.join(" ")), { status: 400 });
  const duplicate = posts.find((post) => post.slug === slug && post.slug !== previous?.slug);
  if (duplicate) throw Object.assign(new Error("That URL slug is already used by another post."), { status: 409 });

  return {
    slug,
    title,
    category,
    date,
    excerpt,
    cover: coverUrl || "",
    coverAlt,
    content,
    seoTitle,
    seoDescription,
    status,
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function persistAndBuild(nextPosts) {
  const dataPath = path.join(root, "src", "blogData.mjs");
  const previousData = fs.readFileSync(dataPath, "utf8");
  const serialized = `export const BLOG_POSTS = ${JSON.stringify(nextPosts, null, 2)};\n`;
  const tempPath = `${dataPath}.tmp`;
  fs.writeFileSync(tempPath, serialized, { mode: 0o600 });
  fs.renameSync(tempPath, dataPath);
  try {
    const output = execFileSync(process.execPath, ["build.mjs"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    posts = nextPosts;
    return output.trim();
  } catch (error) {
    fs.writeFileSync(dataPath, previousData, { mode: 0o600 });
    try { execFileSync(process.execPath, ["build.mjs"], { cwd: root, stdio: "ignore" }); } catch {}
    throw Object.assign(new Error(error.stderr?.toString() || error.message), { status: 500 });
  }
}

async function handleApi(req, res, url) {
  const method = req.method;
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/api/session") {
    const session = sessionFor(req);
    return sendJson(res, 200, { authenticated: Boolean(session), csrf: session?.csrf || "" });
  }

  if (method === "POST" && pathname === "/api/login") {
    const address = req.socket.remoteAddress || "unknown";
    const attempt = loginAttempts.get(address) || { count: 0, startedAt: Date.now() };
    if (Date.now() - attempt.startedAt > 15 * 60 * 1000) { attempt.count = 0; attempt.startedAt = Date.now(); }
    if (attempt.count >= 8) return sendJson(res, 429, { error: "Too many attempts. Wait 15 minutes and try again." });
    const body = await readJson(req, 4096);
    const expected = crypto.createHash("sha256").update(adminPassword).digest();
    const supplied = crypto.createHash("sha256").update(String(body.password || "")).digest();
    if (!crypto.timingSafeEqual(expected, supplied)) {
      attempt.count += 1;
      loginAttempts.set(address, attempt);
      return sendJson(res, 401, { error: "The password did not match." });
    }
    loginAttempts.delete(address);
    const token = crypto.randomBytes(32).toString("hex");
    const csrf = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { csrf, expiresAt: Date.now() + sessionLifetime });
    const secure = req.socket.encrypted || req.headers["x-forwarded-proto"] === "https" || process.env.COOKIE_SECURE === "true";
    const cookie = `blog_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetime / 1000}${secure ? "; Secure" : ""}`;
    return sendJson(res, 200, { authenticated: true }, { "Set-Cookie": cookie });
  }

  if (method === "POST" && pathname === "/api/logout") {
    const session = requireSession(req, res, true);
    if (!session) return;
    sessions.delete(session.token);
    return sendJson(res, 200, { ok: true }, { "Set-Cookie": "blog_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
  }

  if (!pathname.startsWith("/api/")) return false;
  const session = requireSession(req, res, method !== "GET");
  if (!session) return true;

  if (method === "GET" && pathname === "/api/posts") return sendJson(res, 200, { posts });

  if (method === "POST" && pathname === "/api/upload") {
    const body = await readJson(req, Math.ceil(maxUploadBytes * 4 / 3) + 8192);
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(body.data || ""));
    if (!match) return sendJson(res, 400, { error: "Upload a JPEG, PNG, or WebP image." });
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > maxUploadBytes) return sendJson(res, 413, { error: "Cover images must be 6 MB or smaller." });
    const signatures = {
      jpeg: bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
      png: bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      webp: bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
    };
    if (!signatures[match[1]]) return sendJson(res, 400, { error: "The file contents do not match the image format." });
    const extension = match[1] === "jpeg" ? "jpg" : match[1];
    const filename = `cover-${crypto.randomUUID()}.${extension}`;
    const directory = path.join(root, "assets", "blog");
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, filename), bytes, { flag: "wx", mode: 0o644 });
    return sendJson(res, 201, { cover: `/assets/blog/${filename}` });
  }

  if (method === "POST" && pathname === "/api/posts") {
    const input = await readJson(req);
    const post = validatePost(input);
    const output = persistAndBuild([post, ...posts]);
    return sendJson(res, 201, { post, output });
  }

  const postRoute = /^\/api\/posts\/([a-z0-9-]+)$/.exec(pathname);
  if (postRoute && method === "PUT") {
    const existing = posts.find((post) => post.slug === postRoute[1]);
    if (!existing) return sendJson(res, 404, { error: "Post not found." });
    const input = await readJson(req);
    const updated = validatePost(input, existing);
    const nextPosts = posts.map((post) => post.slug === existing.slug ? updated : post);
    const output = persistAndBuild(nextPosts);
    return sendJson(res, 200, { post: updated, output });
  }

  if (postRoute && method === "DELETE") {
    if (!posts.some((post) => post.slug === postRoute[1])) return sendJson(res, 404, { error: "Post not found." });
    const output = persistAndBuild(posts.filter((post) => post.slug !== postRoute[1]));
    return sendJson(res, 200, { ok: true, output });
  }

  return sendJson(res, 404, { error: "API route not found." });
}

function serveStatic(req, res, pathname) {
  let relativePath;
  let fileRoot = path.join(root, "public");
  if (pathname === "/admin" || pathname === "/admin/") { fileRoot = root; relativePath = "admin/index.html"; }
  else if (/^\/admin\/(admin\.(?:js|css))$/.test(pathname)) { fileRoot = root; relativePath = pathname.slice(1); }
  else if (pathname === "/" || pathname === "/index.html") relativePath = "index.html";
  else if (pathname === "/gallery.html") relativePath = "gallery.html";
  else if (/^\/blog(?:\/[a-z0-9-]+)?\/$/.test(pathname)) relativePath = `${pathname.slice(1)}index.html`;
  else if (/^\/blog\/[a-z0-9-]+\.html$/.test(pathname)) relativePath = pathname.slice(1);
  else if (/^\/assets\/(?:blog|gallery)\/[a-zA-Z0-9._ -]+\.(?:jpe?g|png|webp)$/i.test(pathname)) relativePath = pathname.slice(1);
  else return sendJson(res, 404, { error: "Page not found." });

  const fullPath = path.resolve(fileRoot, relativePath);
  if (!fullPath.startsWith(`${fileRoot}${path.sep}`) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return sendJson(res, 404, { error: "Page not found." });
  const extension = path.extname(fullPath).toLowerCase();
  const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" }[extension];
  const inlineScripts = extension === ".html" ? [...fs.readFileSync(fullPath, "utf8").matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)].map((match) => match[1]).filter((script) => script.trim()).map((script) => `'sha256-${crypto.createHash("sha256").update(script).digest("base64")}'`) : [];
  const scriptPolicy = ["'self'", ...inlineScripts].join(" ");
  res.writeHead(200, {
    "Content-Type": mime,
    "Cache-Control": extension.startsWith(".ht") ? "no-cache" : extension.startsWith(".j") || extension === ".css" ? "no-cache" : "public, max-age=86400",
    "Content-Security-Policy": `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src ${scriptPolicy}; connect-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`,
  });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(fullPath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, url);
      if (handled !== false) return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "Method not allowed." }, { Allow: "GET, HEAD" });
    return serveStatic(req, res, decodeURIComponent(url.pathname));
  } catch (error) {
    if (!res.headersSent) sendJson(res, error.status || 500, { error: error.status ? error.message : "The request could not be completed." });
    else res.destroy();
    if (!error.status) console.error(error);
  }
});

try {
  execFileSync(process.execPath, ["build.mjs"], { cwd: root, stdio: "inherit" });
} catch (error) {
  console.error("Initial site build failed; admin server was not started.");
  process.exit(error.status || 1);
}

server.listen(port, host, () => console.log(`Portfolio and blog admin: http://${host}:${port}/admin/`));