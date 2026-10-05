const $ = (selector) => document.querySelector(selector);
const loginView = $("#login-view");
const adminView = $("#admin-view");
const loginForm = $("#login-form");
const loginError = $("#login-error");
const postForm = $("#post-form");
const fields = {
  title: $("#post-title"), slug: $("#post-slug"), category: $("#post-category"), date: $("#post-date"),
  status: $("#post-status"), excerpt: $("#post-excerpt"), cover: $("#post-cover"), coverAlt: $("#post-cover-alt"), content: $("#post-content"),
  seoTitle: $("#seo-title"), seoDescription: $("#seo-description"),
};
let csrf = "";
let posts = [];
let currentSlug = null;
let slugTouched = false;
let toastTimer = 0;

const todayLabel = () => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
const slugify = (value) => value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

async function api(url, options = {}) {
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.mutate ? { "X-CSRF-Token": csrf } : {}), ...options.headers };
  const response = await fetch(url, { ...options, headers, credentials: "same-origin" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "The request failed. Try again.");
  return result;
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
}

function editorMessage(message, isError = false) {
  const node = $("#editor-message");
  node.textContent = message;
  node.classList.toggle("error", isError);
  node.hidden = !message;
}

function updatePreview() {
  $("#preview-title").textContent = fields.title.value.trim() || "Your article title";
  $("#preview-category").textContent = fields.category.value.trim() || "Category";
  $("#preview-excerpt").textContent = fields.excerpt.value.trim() || "Your summary will appear here.";
  const paragraphs = fields.content.value.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean);
  const content = $("#preview-content");
  content.replaceChildren();
  if (!paragraphs.length) {
    const paragraph = document.createElement("p");
    paragraph.textContent = "Your article preview will appear here as you write.";
    content.append(paragraph);
  } else {
    paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      content.append(paragraph);
    });
  }
  const cover = fields.cover.value.trim();
  const image = $("#preview-cover");
  if (cover) {
    image.src = cover;
    image.alt = fields.coverAlt.value.trim() || (fields.title.value.trim() ? `Cover image for ${fields.title.value.trim()}` : "Article cover image");
    image.hidden = false;
    image.onerror = () => { image.hidden = true; };
  } else {
    image.removeAttribute("src");
    image.hidden = true;
  }
  const words = fields.content.value.trim().split(/\s+/).filter(Boolean).length;
  $("#word-count").textContent = `${words} words · about ${words ? Math.max(1, Math.ceil(words / 200)) : 0} min read`;
  $("#excerpt-count").textContent = fields.excerpt.value.length;
  $("#seo-title-count").textContent = fields.seoTitle.value.length;
  $("#seo-description-count").textContent = fields.seoDescription.value.length;
}

function renderPosts() {
  const query = $("#search-posts").value.trim().toLowerCase();
  const status = $("#filter-status").value;
  const visible = posts.filter((post) => (status === "all" || post.status === status) && `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query));
  $("#count-all").textContent = posts.length;
  $("#count-published").textContent = posts.filter((post) => post.status === "published").length;
  $("#count-drafts").textContent = posts.filter((post) => post.status === "draft").length;
  $("#result-count").textContent = visible.length;
  const list = $("#post-list");
  list.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty-list";
    empty.textContent = posts.length ? "No articles match this search." : "No articles yet. Create your first one to get started.";
    list.append(empty);
    return;
  }
  visible.forEach((post) => {
    const button = document.createElement("button");
    button.className = `post-item${post.slug === currentSlug ? " selected" : ""}`;
    button.type = "button";
    button.setAttribute("aria-current", post.slug === currentSlug ? "true" : "false");
    button.innerHTML = `<strong>${escapeHtml(post.title)}</strong><span class="post-item-meta"><span>${escapeHtml(post.date)}</span><span class="status ${post.status === "draft" ? "draft" : ""}">${post.status === "draft" ? "Draft" : "Published"}</span></span>`;
    button.addEventListener("click", () => loadPost(post.slug));
    list.append(button);
  });
}

function fillEditor(post = null) {
  currentSlug = post?.slug || null;
  slugTouched = Boolean(post);
  fields.title.value = post?.title || "";
  fields.slug.value = post?.slug || "";
  fields.category.value = post?.category || "";
  fields.date.value = post?.date || todayLabel();
  fields.status.value = post?.status || "draft";
  fields.excerpt.value = post?.excerpt || "";
  fields.cover.value = post?.cover || "";
  fields.coverAlt.value = post?.coverAlt || "";
  fields.content.value = post?.content?.join("\n\n") || "";
  fields.seoTitle.value = post?.seoTitle || "";
  fields.seoDescription.value = post?.seoDescription || "";
  $("#editor-title").textContent = post ? "Edit article" : "New article";
  $("#delete-post").hidden = !post;
  const live = $("#view-live");
  live.hidden = !post || post.status !== "published";
  live.href = post ? `/blog/${encodeURIComponent(post.slug)}.html` : "#";
  $("#cover-preview").hidden = !post?.cover;
  if (post?.cover) $("#cover-preview-image").src = post.cover;
  editorMessage("");
  updatePreview();
  renderPosts();
}

async function refreshPosts() {
  const result = await api("/api/posts");
  posts = result.posts;
  renderPosts();
}

function loadPost(slug) {
  const post = posts.find((item) => item.slug === slug);
  if (post) fillEditor(post);
}

async function save(status) {
  if (!postForm.reportValidity()) return;
  fields.status.value = status;
  const data = {
    title: fields.title.value.trim(), slug: fields.slug.value.trim(), category: fields.category.value.trim(),
    date: fields.date.value.trim(), status, excerpt: fields.excerpt.value.trim(), cover: fields.cover.value.trim(), coverAlt: fields.coverAlt.value.trim(),
    content: fields.content.value.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean),
    seoTitle: fields.seoTitle.value.trim(), seoDescription: fields.seoDescription.value.trim(),
  };
  const button = status === "draft" ? $("#save-draft") : $("#publish-post");
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = status === "draft" ? "Saving…" : "Publishing…";
  editorMessage("");
  try {
    const endpoint = currentSlug ? `/api/posts/${encodeURIComponent(currentSlug)}` : "/api/posts";
    const result = await api(endpoint, { method: currentSlug ? "PUT" : "POST", body: JSON.stringify(data), mutate: true });
    await refreshPosts();
    fillEditor(result.post);
    toast(status === "draft" ? "Draft saved and site rebuilt." : "Article published and site rebuilt.");
    if (status === "published") $("#view-live").focus({ preventScroll: true });
  } catch (error) {
    editorMessage(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

async function startDashboard() {
  loginView.hidden = true;
  adminView.hidden = false;
  await refreshPosts();
  if (currentSlug) loadPost(currentSlug);
  else fillEditor(null);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button[type=submit]");
  button.disabled = true;
  loginError.hidden = true;
  try {
    await api("/api/login", { method: "POST", body: JSON.stringify({ password: $("#password").value }) });
    const session = await api("/api/session");
    csrf = session.csrf;
    await startDashboard();
  } catch (error) {
    loginError.textContent = error.message;
    loginError.hidden = false;
  } finally {
    button.disabled = false;
  }
});

$("#new-post").addEventListener("click", () => fillEditor(null));
$("#search-posts").addEventListener("input", renderPosts);
$("#filter-status").addEventListener("change", renderPosts);
$("#logout-button").addEventListener("click", async () => {
  try { await api("/api/logout", { method: "POST", mutate: true }); } catch {}
  csrf = "";
  posts = [];
  adminView.hidden = true;
  loginView.hidden = false;
  $("#password").value = "";
  $("#password").focus();
});

fields.title.addEventListener("input", () => {
  if (!slugTouched) fields.slug.value = slugify(fields.title.value);
  updatePreview();
});
fields.slug.addEventListener("input", () => { slugTouched = true; fields.slug.value = slugify(fields.slug.value); });
[fields.category, fields.excerpt, fields.content, fields.cover, fields.coverAlt, fields.seoTitle, fields.seoDescription].forEach((field) => field.addEventListener("input", updatePreview));
postForm.addEventListener("submit", (event) => event.preventDefault());
$("#save-draft").addEventListener("click", () => save("draft"));
$("#publish-post").addEventListener("click", () => save("published"));

$("#cover-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 6 * 1024 * 1024) {
    editorMessage("Cover images must be 6 MB or smaller.", true);
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const result = await api("/api/upload", { method: "POST", body: JSON.stringify({ data: reader.result }), mutate: true });
      fields.cover.value = result.cover;
      $("#cover-preview-image").src = result.cover;
      $("#cover-preview").hidden = false;
      updatePreview();
      toast("Cover uploaded. Save the article to keep the change.");
    } catch (error) { editorMessage(error.message, true); }
    event.target.value = "";
  };
  reader.readAsDataURL(file);
});

$("#remove-cover").addEventListener("click", () => {
  fields.cover.value = "";
  $("#cover-preview").hidden = true;
  updatePreview();
});

$("#delete-post").addEventListener("click", async () => {
  const post = posts.find((item) => item.slug === currentSlug);
  if (!post || !window.confirm(`Delete “${post.title}”? This also removes its public page.`)) return;
  const button = $("#delete-post");
  button.disabled = true;
  try {
    await api(`/api/posts/${encodeURIComponent(currentSlug)}`, { method: "DELETE", mutate: true });
    currentSlug = null;
    await refreshPosts();
    fillEditor(null);
    toast("Article deleted and public pages rebuilt.");
  } catch (error) { editorMessage(error.message, true); }
  finally { button.disabled = false; }
});

async function initialize() {
  try {
    const session = await api("/api/session");
    if (session.authenticated) {
      csrf = session.csrf;
      await startDashboard();
    }
  } catch {}
}

initialize();