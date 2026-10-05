# Prof. Dr. Chandra Shekhar Portfolio

React-based portfolio and static blog, bundled with esbuild. Blog posts are stored in `src/blogData.mjs`; the admin panel saves content there and regenerates the static pages.

## Build

```powershell
npm install
npm run build
```

The build generates `index.html`, `gallery.html`, and the pages in `blog/`. These generated files are intentionally ignored by Git and can be recreated from the tracked source and assets.

## Blog admin

Set an admin password of at least 12 characters, then start the local site and admin server:

```powershell
$env:ADMIN_PASSWORD = "use-a-strong-password-here"
npm run admin
```

Open `http://127.0.0.1:3001/admin/`. Publishing a post rebuilds the static pages. The admin service binds to localhost by default.

For public deployment, use a Node.js host with HTTPS and a reverse proxy. Do not expose the admin service over plain HTTP or use the temporary development password.