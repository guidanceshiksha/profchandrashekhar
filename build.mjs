import fs from "fs";
import { execSync } from "child_process";
import { BLOG_POSTS } from "./src/blogData.mjs";
execSync(`npx esbuild src/main.jsx --bundle --minify --format=iife --jsx=automatic --define:process.env.NODE_ENV='"production"' --outdir=dist --loader:.css=css`, { stdio: "inherit" });
const css = fs.readFileSync("dist/main.css", "utf8");
const js = fs.readFileSync("dist/main.js", "utf8").replace(/<\/script/gi, "<\\/script");
const publicPosts = BLOG_POSTS.filter((post) => post.status !== "draft");
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const safeCover = (value = "") => String(value).replace(/[\\"'()]/g, (char) => encodeURIComponent(char));
let photo = "";
for (const f of [
  "assets/gallery/dd61.jpg",
  "assets/gallery/dd61.png",
  "assets/gallery/dd61.jpeg",
  "assets/gallery/dd61.webp",
  "assets/gallery/dd6.jpg",
  "assets/gallery/dd6.png",
  "assets/gallery/dd6.jpeg",
  "assets/gallery/dd6.webp",
  "assets/photo.jpeg",
  "assets/photo.jpg",
  "assets/photo.png",
]) {
  if (fs.existsSync(f)) {
    const mime = f.toLowerCase().endsWith("png") ? "image/png" : f.toLowerCase().endsWith("webp") ? "image/webp" : "image/jpeg";
    photo = `<script>window.__PHOTO__="data:${mime};base64,${fs.readFileSync(f).toString("base64")}";</script>\n`;
    break;
  }
}
let gallery = "";
let offBeatThumbnail = "";
if (fs.existsSync("assets/gallery")) {
  const files = fs.readdirSync("assets/gallery").filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  if (files.length) {
    const arr = files.map((f) => `data:image/${f.toLowerCase().endsWith("png") ? "png" : f.toLowerCase().endsWith("webp") ? "webp" : "jpeg"};base64,` + fs.readFileSync("assets/gallery/" + f).toString("base64"));
    gallery = `<script>window.__GALLERY__=${JSON.stringify(arr)};</script>\n`;
    const offBeatFile = files.find((f) => /off\s*beat.*(carrer|career)|off\s*beat.*thumb/i.test(f));
    if (offBeatFile) {
      const ext = offBeatFile.toLowerCase().endsWith("png") ? "png" : offBeatFile.toLowerCase().endsWith("webp") ? "webp" : "jpeg";
      offBeatThumbnail = `data:image/${ext};base64,${fs.readFileSync("assets/gallery/" + offBeatFile).toString("base64")}`;
    }
  }
}
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f1733">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="description" content="Prof. Dr. Chandra Shekhar is an educator, researcher, education advisor and admissions leader at Bharatiya Vidya Bhavan College, GGSIP University, Delhi.">
<meta name="author" content="Prof. Dr. Chandra Shekhar">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="https://prof-chandrashekhar.com/">
<meta property="og:image" content="assets/gallery/dd61.jpg">
<meta property="og:image:alt" content="Portrait of Prof. Dr. Chandra Shekhar">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; upgrade-insecure-requests;">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Permissions-Policy" content="geolocation=(), camera=(), microphone=(), payment=()">
<meta property="og:type" content="website">
<meta property="og:title" content="Prof. Dr. Chandra Shekhar | Education Advisor & Researcher">
<meta property="og:description" content="Academic leader, education advisor, researcher and mentor helping students and institutions with admissions, careers and higher education guidance.">
<meta property="og:site_name" content="Prof. Dr. Chandra Shekhar">
<title>Prof. Dr. Chandra Shekhar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
${photo}${gallery}${offBeatThumbnail ? `<script>window.__OFF_BEAT_THUMBNAIL__=${JSON.stringify(offBeatThumbnail)};</script>\n` : ""}<script>${js}</script>
</body>
</html>
`;
const galleryPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f1733">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="description" content="Gallery of Prof. Dr. Chandra Shekhar featuring moments, awards, media appearances and student interactions.">
<meta name="author" content="Prof. Dr. Chandra Shekhar">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="https://prof-chandrashekhar.com/gallery.html">
<meta property="og:image" content="assets/gallery/dd61.jpg">
<meta property="og:image:alt" content="Photo gallery of Prof. Dr. Chandra Shekhar">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta property="og:type" content="website">
<meta property="og:title" content="Gallery | Prof. Dr. Chandra Shekhar">
<meta property="og:description" content="Moments, awards and media highlights from the life and work of Prof. Dr. Chandra Shekhar.">
<title>Gallery | Prof. Dr. Chandra Shekhar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${css}</style>
<style>
  body { margin: 0; background: #f1f4f8; color: #0f1733; }
  .gallery-page { max-width: 1200px; margin: 0 auto; padding: 48px 20px 80px; }
  .gallery-page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
  .gallery-page-header h1 { font-family: "Young Serif", Georgia, serif; font-size: clamp(32px, 5vw, 60px); margin: 0; }
  .gallery-page-header a { text-decoration: none; border: 1px solid rgba(15,23,51,.15); border-radius: 999px; padding: 12px 18px; font-weight: 600; }
  .gallery-page-grid { columns: 4 220px; column-gap: 16px; }
  .gallery-page-grid img { display: block; width: 100%; border-radius: 18px; margin: 0 0 16px; break-inside: avoid; box-shadow: 0 15px 24px -22px rgba(15,23,51,.45); }
  @media (max-width: 720px) { .gallery-page-header { flex-direction: column; align-items: flex-start; } }
</style>
</head>
<body>
  <div class="gallery-page">
    <div class="gallery-page-header">
      <h1>Moments</h1>
      <a href="index.html">Back to home</a>
    </div>
    <div class="gallery-page-grid">
      ${(() => {
        const files = fs.existsSync("assets/gallery") ? fs.readdirSync("assets/gallery").filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort() : [];
        return files.map((f) => ` <img src="data:image/${f.toLowerCase().endsWith("png") ? "png" : f.toLowerCase().endsWith("webp") ? "webp" : "jpeg"};base64,${fs.readFileSync("assets/gallery/" + f).toString("base64")}" alt="${f}" loading="lazy" />`).join("\n");
      })()}
    </div>
  </div>
</body>
</html>
`;
const blogShell = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Blog insights on education, research, admissions and career guidance by Prof. Dr. Chandra Shekhar.">
<meta name="theme-color" content="#0f1733">
<link rel="canonical" href="https://prof-chandrashekhar.com/blog/">
<meta property="og:image" content="../assets/gallery/dd61.jpg">
<meta property="og:image:alt" content="Prof. Dr. Chandra Shekhar blog cover">
<title>Blog | Prof. Dr. Chandra Shekhar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${css}</style>
<style>
  body { margin: 0; background: #f1f4f8; color: #0f1733; }
  .blog-page { max-width: 1180px; margin: 0 auto; padding: 48px 20px 80px; }
  .blog-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 28px; }
  .blog-header h1 { font-family: "Young Serif", Georgia, serif; font-size: clamp(38px, 7vw, 78px); margin: 0; }
  .blog-header a, .post-back { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(15,23,51,.15); background: #fff; font-weight: 600; }
  .blog-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
  .blog-item { background: #fff; border: 1px solid rgba(15,23,51,.15); border-radius: 22px; overflow: hidden; }
  .blog-item-cover { min-height: 200px; background-size: cover; background-position: center; }
  .blog-item-body { padding: 22px; }
  .blog-item-body .meta { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-family: "IBM Plex Mono", monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #526079; }
  .blog-item-body h2 { font-family: "Young Serif", Georgia, serif; font-size: clamp(24px, 3vw, 32px); margin: 14px 0 12px; }
  .blog-item-body p { color: #526079; margin: 0 0 18px; }
  .blog-item-body a { display: inline-flex; align-items: center; gap: 8px; color: #1d3fa8; text-decoration: none; font-weight: 600; }
  @media (max-width: 900px) { .blog-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .blog-header { flex-direction: column; align-items: flex-start; } .blog-list { grid-template-columns: minmax(0, 1fr); } }
  .post-shell { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; }
  .post-cover { min-height: 320px; border-radius: 24px; background-size: cover; background-position: center; margin-bottom: 28px; }
  .post-meta { display: flex; gap: 14px; flex-wrap: wrap; font-family: "IBM Plex Mono", monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #526079; }
  .post-body { font-size: 18px; line-height: 1.8; color: #0f1733; }
  .post-body p { margin: 0 0 1.4em; }
</style>
</head>
<body>
  <div class="blog-page">
    <div class="blog-header">
      <h1>Blog</h1>
      <a href="../index.html">Back to home</a>
    </div>
    <div class="blog-list">
      ${publicPosts.map((post) => `
        <article class="blog-item">
          <div class="blog-item-cover" style="background-image: linear-gradient(180deg, rgba(15,23,51,0.1), rgba(15,23,51,0.35)), url('${safeCover(post.cover)}');"></div>
          <div class="blog-item-body">
            <div class="meta"><span>${escapeHtml(post.category)}</span><span>${escapeHtml(post.date)}</span></div>
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.excerpt)}</p>
            <a href="${post.slug}.html">Read article →</a>
          </div>
        </article>
      `).join("")}
    </div>
  </div>
</body>
</html>
`;

fs.mkdirSync("blog", { recursive: true });
fs.writeFileSync("blog/index.html", blogShell);
for (const post of publicPosts) {
  const postTitle = escapeHtml(post.seoTitle || post.title);
  const postDescription = escapeHtml(post.seoDescription || post.excerpt);
  const postUrl = `https://prof-chandrashekhar.com/blog/${post.slug}.html`;
  const postHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${postDescription}">
<meta name="theme-color" content="#0f1733">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Prof. Dr. Chandra Shekhar">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="${postUrl}">
<meta property="og:type" content="article">
<meta property="og:title" content="${postTitle}">
<meta property="og:description" content="${postDescription}">
<meta property="og:url" content="${postUrl}">
<meta property="og:image" content="${escapeHtml(post.cover)}">
<meta property="og:image:alt" content="${escapeHtml(post.coverAlt || post.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${postTitle}">
<meta name="twitter:description" content="${postDescription}">
<meta name="twitter:image" content="${escapeHtml(post.cover)}">
<title>${postTitle} | Prof. Dr. Chandra Shekhar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${css}</style>
<style>
  body { margin: 0; background: #f1f4f8; color: #0f1733; }
  .post-shell { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; }
  .post-cover { min-height: 320px; border-radius: 24px; background-size: cover; background-position: center; margin-bottom: 28px; }
  .post-meta { display: flex; gap: 14px; flex-wrap: wrap; font-family: "IBM Plex Mono", monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #526079; }
  .post-body { font-size: 18px; line-height: 1.8; color: #0f1733; }
  .post-body p { margin: 0 0 1.4em; }
  .post-back { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; margin-top: 24px; padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(15,23,51,.15); background: #fff; font-weight: 600; }
</style>
</head>
<body>
  <div class="post-shell">
    <div class="post-cover" role="img" aria-label="${escapeHtml(post.coverAlt || post.title)}" style="background-image: linear-gradient(180deg, rgba(15,23,51,0.15), rgba(15,23,51,0.35)), url('${safeCover(post.cover)}');"></div>
    <div class="post-meta"><span>${escapeHtml(post.category)}</span><span>${escapeHtml(post.date)}</span></div>
    <h1 style="font-family: 'Young Serif', Georgia, serif; font-size: clamp(32px, 5vw, 58px); line-height: 1.05; margin: 18px 0 18px;">${escapeHtml(post.title)}</h1>
    <div class="post-body">
      ${post.content.map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}
    </div>
    <a class="post-back" href="index.html">← Back to blog</a>
  </div>
</body>
</html>
`;
  fs.writeFileSync(`blog/${post.slug}.html`, postHtml);
}
for (const file of fs.readdirSync("blog")) {
  if (file.endsWith(".html") && file !== "index.html" && !publicPosts.some((post) => `${post.slug}.html` === file)) fs.unlinkSync(`blog/${file}`);
}
fs.writeFileSync("index.html", html);
fs.writeFileSync("gallery.html", galleryPage);
console.log("index.html", (html.length / 1024).toFixed(0) + " KB", photo ? "(with photo)" : "(no photo)");
console.log("gallery.html", (galleryPage.length / 1024).toFixed(0) + " KB");
console.log("blog/index.html", (blogShell.length / 1024).toFixed(0) + " KB");
