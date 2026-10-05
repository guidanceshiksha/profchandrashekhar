import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  motion, AnimatePresence, animate, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform,
} from "framer-motion";
import { BLOG_POSTS } from "./blogData.mjs";
import "./styles.css";

/* ---------- content (taken from prof-chandrashekhar.com) ---------- */
const NAME = "Prof. Dr. Chandra Shekhar";
const PHOTO = typeof window !== "undefined" ? window.__PHOTO__ || "" : "";
const OFF_BEAT_THUMBNAIL = typeof window !== "undefined" ? window.__OFF_BEAT_THUMBNAIL__ || "" : "";
const STATEMENT =
  "A distinguished academician, educational strategist, researcher and administrator, with two decades of academic leadership behind him.";
const STATS = [
  { n: 20, l: "Years in academia" },
  { n: 200, l: "Colleges guided as strategic advisor" },
  { n: 10000, l: "Students mentored" },
  { n: 20, l: "Research papers published" },
  { n: 5, l: "National awards received" },
];
const ROLES = [
  { k: "Educator", t: "Professor & In-Charge (Admissions)", d: "Bharatiya Vidya Bhavan College (BVBC), GGSIP University, Delhi." },
  { k: "Founder", t: "GuidanceShiksha.com", d: "Education guidance platform founded by him." },
  { k: "Strategic advisor", t: "200+ colleges guided", d: "Advising institutions as an educational strategist." },
  { k: "On television", t: "Career advisor, DD National", d: "Appears on the programme “Shiksha Avam Rojgar”." },
  { k: "Former Director", t: "DITM College", d: "Previously served as Director of the college." },
  { k: "Researcher", t: "20+ published papers", d: "Big data, data mining, cybersecurity and sentiment analysis." },
];
const EXPERTISE = ["Big Data Analytics", "Apache Hadoop", "Data Mining", "Sentiment Analysis", "Cybersecurity", "ECDSA & Digital Signatures", "Machine Learning", "Cloud Computing", "Educational Administration", "Career Counseling"];
const QUALS = [
  { d: "Ph.D.", f: "Big Data Analytics", n: "Doctoral research" },
  { d: "Ph.D.", f: "Education", n: "Honorary doctorate" },
  { d: "M.Tech", f: "Computer Science Engineering", n: "" },
  { d: "M.Tech", f: "Information Technology", n: "" },
  { d: "MCA", f: "Master of Computer Applications", n: "" },
  { d: "M.Sc", f: "Mathematics", n: "" },
];
const PUBS = [
  { y: "June 2025", t: "Enhanced Sentiment Analysis and Data Mining of Political Leaders' Popularity", v: "JATIT", tag: "Sentiment analysis" },
  { y: "March 2025", t: "An Innovative and Secured Electronic Voting System Based on ECDSA", v: "Springer Nature", tag: "Cybersecurity" },
  { y: "2023", t: "A Robust and Secured Encryption Scheme for Big Data Security", v: "European Chemical Bulletin", tag: "Big data" },
  { y: "March 2023", t: "Efficient Data Mining of Political Result Through Apache Hadoop", v: "International Journal of Scientific Development and Research", tag: "Apache Hadoop" },
  { y: "Feb 2018", t: "Defiance and Predicament: 4G Network", v: "5th National Conference", tag: "Networks" },
];
const HONOURS = [
  { y: "2024", t: "National Recognition Award", d: "Presented by the Speaker of the Delhi Vidhan Sabha." },
  { y: "2023", t: "Shiksha Ratna Award", d: "Presented by Delhi Vidhan Sabha Speaker Shri Ram Nivas." },
  { y: "Past", t: "Shiksha Samman Award", d: "One of the five-plus national awards received." },
  { y: "Now", t: "Career Advisor, DD Morning Live Show", d: "Ongoing on DD National's “Shiksha Avam Rojgar”." },
];
const CONTACT = [
  { lab: "Phone", val: "+91 8826252304" },
  { lab: "Phone", val: "+91 9911458543" },
  { lab: "Email", val: "cshekharrajput@gmail.com" },
  { lab: "Office", val: "BVBC, GGSIP University, Delhi" },
];
const SOCIALS = [
  { n: "YouTube", u: "https://www.youtube.com/@Dr.chandra_shekhar" },
  { n: "Instagram", u: "https://www.instagram.com/prof_dr_chandra_shekhar/" },
  { n: "LinkedIn", u: "https://www.linkedin.com/in/prof-dr-chandra-shekhar-965757170/" },
  { n: "Facebook", u: "https://www.facebook.com/prof.dr.chandrashekhar/" },
  { n: "WhatsApp", u: "https://wa.me/918826252304" },
];
const NAV = [
  { id: "about", label: "About", hideS: true },
  { id: "research", label: "Research" },
  { id: "honours", label: "Honours", hideS: true },
  { id: "videos", label: "Videos", hideS: true },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];
const EASE = [0.2, 0.75, 0.2, 1];

/* WhatsApp: every lead lands on this number */
const WA_NUMBER = "918826252304";
const wa = (text) => "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);

const YT_CHANNEL = "https://www.youtube.com/@Dr.chandra_shekhar";
/* Add real playlists here: { id: "PLxxxxxxxx", title: "...", desc: "..." }. Cards then get an inline player. */
const PLAYLISTS = [];
const TOPICS = [
  { t: "Admission updates", d: "Dates, processes and changes for college admissions, explained as they happen." },
  { t: "Career guidance", d: "Which path to take after school and graduation, and how to prepare for it." },
  { t: "Student motivation", d: "Talks to keep students steady through exams, results and big decisions." },
  { t: "School & college information", d: "What to know before choosing an institution." },
  { t: "Exam preparation", d: "Guidance around NEET, JEE and UPSC." },
  { t: "Education news", d: "Important news from the education world, in plain language." },
];
const SERVICES = [
  { t: "Admission guidance", d: "Choosing the right course and college, and getting through the admission process with fewer surprises.", q: "I need help with admission guidance." },
  { t: "Career counselling", d: "Direction for students after school and graduation, drawn from two decades in academia.", q: "I would like career counselling." },
  { t: "Institutional advisory", d: "Strategy for colleges, from academics to admissions. He has guided 200+ institutions.", q: "I would like to discuss advisory for our institution." },
  { t: "Research mentoring", d: "Guidance on research in big data, data mining, security and sentiment analysis.", q: "I need research guidance." },
  { t: "Talks & media", d: "Sessions, panels and television appearances on education and careers.", q: "I would like to invite you for a talk or media appearance." },
  { t: "Exam & admission updates", d: "Timely information on NEET, JEE, UPSC and admission news, shared on his YouTube channel.", q: "I would like to know about exam and admission updates." },
];
/* Gallery: photos are embedded at build time from assets/gallery (see build.mjs). These are the empty slots shown until then. */
const GALLERY_SLOTS = [
  { cat: "Awards", cap: "Award ceremony" }, { cat: "Media", cap: "DD National studio" }, { cat: "Students", cap: "Mentoring session" },
  { cat: "Conferences", cap: "Conference stage" }, { cat: "Awards", cap: "Felicitation" }, { cat: "Campus", cap: "BVBC campus" },
  { cat: "Students", cap: "Student interaction" }, { cat: "Media", cap: "On air" },
];
const GALLERY = typeof window !== "undefined" && Array.isArray(window.__GALLERY__) ? window.__GALLERY__ : [];

/* ---------- helpers ---------- */
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
);

function Reveal({ children, delay = 0, y = 34, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0.35, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -70px 0px" }} transition={{ duration: 0.8, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

function Magnetic({ children }) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const ref = useRef(null);
  const move = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.32);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.32);
  };
  const leave = () => { x.set(0); y.set(0); };
  return <motion.div ref={ref} style={{ x, y, display: "inline-block" }} onPointerMove={move} onPointerLeave={leave}>{children}</motion.div>;
}

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  return <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />;
}

/* ---------- nav ---------- */
function Nav() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && setActive(en.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <div className="nav-shell">
      <motion.nav className="nav" aria-label="Main" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}>
        {NAV.map((n) => (
          <a key={n.id} href={"#" + n.id} className={(active === n.id ? "on " : "") + (n.hideS ? "hide-s" : "")}>
            {active === n.id && <motion.span layoutId="pill" className="pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            {n.label}
          </a>
        ))}
      </motion.nav>
    </div>
  );
}

/* ---------- hero ---------- */
function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Badge() {
  const reduce = useReducedMotion();
  return (
    <div className="badge" aria-hidden="true">
      <motion.svg className="ring" viewBox="0 0 118 118" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 24, ease: "linear", repeat: Infinity }}>
        <defs><path id="ringpath" d="M59,59 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
        <text><textPath href="#ringpath" textLength="283" lengthAdjust="spacing">Educator · Researcher · Advisor ·</textPath></text>
      </motion.svg>
      <span className="c">20+</span>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const clock = useClock();
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const py = useTransform(scrollY, [0, 700], [0, -50]);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  };
  const lines = [<>Chandra</>, <span className="mark">Shekhar</span>];
  return (
    <header className="hero" ref={ref} onPointerMove={onMove}>
      <div className="grid-bg" aria-hidden="true" />
      <div className="spot" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div>
          <motion.div className="kicker" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <span>Academician · Researcher · Advisor</span>
            <span className="live"><i className="pulse" /> Delhi {clock && "· " + clock + " IST"}</span>
          </motion.div>
          <h1>
            <span className="line"><motion.span className="pre" style={{ display: "inline-block" }} initial={reduce ? false : { y: "120%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}>Prof. Dr.</motion.span></span>
            {lines.map((l, i) => (
              <span className="line" key={i}>
                <motion.span initial={reduce ? false : { y: "115%", rotate: 3 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.13 }}>{l}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="role" initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.85 }}>
            <b>Professor &amp; In-Charge (Admissions)</b> at Bharatiya Vidya Bhavan College, GGSIP University, Delhi. Mentor to 10,000+ students and strategic advisor to 200+ colleges.
          </motion.p>
          <motion.div className="cta-row" initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }}>
            <Magnetic><a className="btn solid" href="#research">Read the research <Arrow /></a></Magnetic>
            <Magnetic><a className="btn wa" href={wa("Namaste Prof. Chandra Shekhar ji, I found you through your website and would like to talk.")} target="_blank" rel="noopener noreferrer"><WaIcon /> Chat on WhatsApp</a></Magnetic>
          </motion.div>
        </div>
        <motion.div className="portrait" style={{ y: reduce ? 0 : py }} initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.5 }}>
          <div className="arch-line" aria-hidden="true" />
          <div className="arch">
            {PHOTO ? <img src={PHOTO} alt={NAME} /> : <span className="mono" aria-hidden="true">CS</span>}
          </div>
          <Badge />
        </motion.div>
      </div>
    </header>
  );
}

/* ---------- stats ---------- */
function Counter({ to }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.9, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, reduce, to]);
  return <span ref={ref}>{v.toLocaleString("en-IN")}<sup>+</sup></span>;
}

function Stats() {
  return (
    <div className="stats-band">
      <div className="wrap stats">
        {STATS.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.06} y={24}>
            <div className="stat"><div className="n"><Counter to={s.n} /></div><div className="l">{s.l}</div></div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ---------- about ---------- */
function Word({ w, i, n, progress, reduce }) {
  const opacity = useTransform(progress, [i / n, Math.min(1, (i + 2) / n)], [0.22, 1]);
  return <motion.span className="w" style={{ opacity: reduce ? 1 : opacity }}>{w}</motion.span>;
}

function About() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  const words = STATEMENT.split(" ");
  return (
    <section id="about">
      <div className="wrap about-grid">
        <Reveal><div className="eyebrow">About</div></Reveal>
        <div>
          <p className="statement" ref={ref}>{words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} progress={scrollYProgress} reduce={reduce} />)}</p>
          <div className="roles">
            {ROLES.map((r, i) => (
              <Reveal key={r.k} delay={(i % 2) * 0.08}>
                <div className="role-card"><div className="k">{r.k}</div><h3>{r.t}</h3><p>{r.d}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- expertise + qualifications ---------- */
function Chip({ t, i }) {
  const reduce = useReducedMotion();
  return (
    <motion.span className="chip" animate={reduce ? undefined : { y: [0, -7, 0] }} transition={{ duration: 4 + (i % 4) * 0.7, ease: "easeInOut", repeat: Infinity, delay: i * 0.25 }} whileHover={reduce ? undefined : { scale: 1.07, rotate: -1.5 }}>
      {t}
    </motion.span>
  );
}

function QCard({ q, i, n, progress }) {
  const scale = useTransform(progress, [i / n, 1], [1, 1 - (n - 1 - i) * 0.012]);
  return (
    <motion.div className="qcard" style={{ "--top": 92 + i * 16 + "px", scale }}>
      <div className="deg">{q.d}<span>.</span></div>
      <div><div className="fld">{q.f}</div>{q.n && <div className="note">{q.n}</div>}</div>
    </motion.div>
  );
}

function Qualifications() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.6", "end 0.9"] });
  return (
    <section id="qualifications" style={{ paddingBottom: "clamp(40px, 6vw, 80px)" }}>
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">Qualifications</div><h2>Six degrees, one direction</h2></Reveal>
        </div>
        <div className="stack" ref={ref}>
          {QUALS.map((q, i) => <QCard key={q.d + q.f} q={q} i={i} n={QUALS.length} progress={scrollYProgress} />)}
        </div>
      </div>
    </section>
  );
}

function Expertise() {
  const ref = useRef(null);
  return (
    <section id="expertise" className="exp">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">Areas of expertise</div><h2>What he works on</h2></Reveal>
          <Reveal delay={0.1}><p>From big data and cybersecurity to the administration of colleges and career counselling.</p></Reveal>
        </div>
        <Reveal><div className="chips">{EXPERTISE.map((t, i) => <Chip key={t} t={t} i={i} />)}</div></Reveal>
      </div>
    </section>
  );
}

/* ---------- research ---------- */
function Research() {
  return (
    <section id="research">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">Research</div><h2>Selected publications</h2></Reveal>
          <Reveal delay={0.1}><p>Twenty-plus papers in total. These are the ones highlighted on his current site.</p></Reveal>
        </div>
        <div className="pubs">
          {PUBS.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.04} y={20}>
              <article className="pub">
                <div className="pub-yr">{p.y}</div>
                <div><h3>{p.t}</h3><div className="pub-venue">{p.v}</div></div>
                <span className="pub-tag">{p.tag}</span>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="pub-note">Latest first.</p>
      </div>
    </section>
  );
}

/* ---------- honours ---------- */
function HCard({ h, i }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--px", px * 100 + "%");
    el.style.setProperty("--py", py * 100 + "%");
    if (reduce) return;
    ry.set((px - 0.5) * 10);
    rx.set(-(py - 0.5) * 10);
  };
  const leave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.article ref={ref} className="hcard" style={{ rotateX: rx, rotateY: ry }} initial={reduce ? false : { opacity: 0.35, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -60px 0px" }} transition={{ duration: 0.85, ease: EASE, delay: (i % 2) * 0.12 }} onPointerMove={move} onPointerLeave={leave}>
      <div className="shine" />
      <div className="yr" aria-hidden="true">{h.y}</div>
      <h3><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{h.y}: </span>{h.t}</h3>
      <p>{h.d}</p>
    </motion.article>
  );
}

function Honours() {
  return (
    <section id="honours" className="honours">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">Recognition</div><h2>Honours &amp; media</h2></Reveal>
          <Reveal delay={0.1}><p>National awards for service to education, and a regular presence on DD National.</p></Reveal>
        </div>
        <div className="hgrid">{HONOURS.map((h, i) => <HCard key={h.t} h={h} i={i} />)}</div>
      </div>
    </section>
  );
}

function Blog() {
  const posts = BLOG_POSTS.slice(0, 3);
  return (
    <section id="blog" className="blog">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">Blog</div><h2>Insights &amp; guidance</h2></Reveal>
          <Reveal delay={0.1}><a className="btn dark" href="blog/index.html">View all posts</a></Reveal>
        </div>
        <div className="blog-grid">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08}>
              <article className="blog-card">
                <div className="blog-cover" style={{ backgroundImage: `linear-gradient(180deg, rgba(15, 23, 51, 0.15), rgba(15, 23, 51, 0.35)), url(${post.cover})` }} />
                <div className="blog-body">
                  <div className="blog-meta"><span>{post.category}</span><span>{post.date}</span></div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <a href={`blog/${post.slug}.html`}>Read article <Arrow /></a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- contact ---------- */
function CopyRow({ lab, val }) {
  const [s, setS] = useState("Copy");
  const ref = useRef(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(val); setS("Copied"); }
    catch (e) {
      const r = document.createRange(); r.selectNodeContents(ref.current);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      setS("Selected");
    }
    setTimeout(() => setS("Copy"), 2000);
  };
  return (
    <div className="crow">
      <div className="t"><div className="lab">{lab}</div><div className="val" ref={ref}>{val}</div></div>
      <button className="copy" onClick={copy} aria-label={"Copy " + lab.toLowerCase() + ": " + val}>{s}</button>
    </div>
  );
}

/* ---------- WhatsApp lead helpers ---------- */
const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.48 14.98L2 22l5.17-1.52A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.07.9.92-2.99-.2-.31a8.2 8.2 0 1 1 6.83 3.72Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.48-.29Z" /></svg>
);

/* ---------- floating WhatsApp button ---------- */
function FloatingWA() {
  const [show, setShow] = useState(false);
  useEffect(() => { const id = setTimeout(() => setShow(true), 1400); return () => clearTimeout(id); }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          className="fab"
          href={wa("Namaste Prof. Chandra Shekhar ji, I found you through your website and would like to talk.")}
          target="_blank" rel="noopener noreferrer" aria-label="Chat with Prof. Chandra Shekhar on WhatsApp"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        >
          <span className="fab-ring" aria-hidden="true" />
          <WaIcon />
          <span className="fab-label">Chat on WhatsApp</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ---------- services ---------- */
function Help() {
  return (
    <section id="services" className="help">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">How he can help</div><h2>Start a conversation</h2></Reveal>
          <Reveal delay={0.1}><p>Pick a topic. WhatsApp opens with your message already written.</p></Reveal>
        </div>
        <div className="help-grid">
          {SERVICES.map((h, i) => (
            <Reveal key={h.t} delay={(i % 3) * 0.08}>
              <a className="help-card" href={wa("Namaste Prof. Chandra Shekhar ji, " + h.q)} target="_blank" rel="noopener noreferrer">
                <h3>{h.t}</h3>
                <p>{h.d}</p>
                <span className="go"><WaIcon /> Ask on WhatsApp <Arrow /></span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- YouTube ---------- */
function YouTube() {
  return (
    <section id="videos" className="yt">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">On YouTube</div><h2>शिक्षा से रोज़गार तक</h2></Reveal>
          <Reveal delay={0.1}><p>Two direct ways to follow his guidance, updates and student-first advice.</p></Reveal>
        </div>

        <div className="yt-grid two-up">
          <Reveal>
            <a className="yt-column-card yt-video-card" href="https://www.youtube.com/watch?v=LDwy1OKb5Vw" target="_blank" rel="noopener noreferrer">
              <div className="yt-media yt-media-one" style={OFF_BEAT_THUMBNAIL ? { backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06)), url("${OFF_BEAT_THUMBNAIL}")` } : undefined}>
                <div className="yt-live-badge"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1 5.5h2v5.3l4.5 2.7-1 1.7-5.5-3.3Z" /></svg> LIVE ON AIR</div>
                <span className="yt-media-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
                </span>
              </div>
              <div className="yt-card-body">
                <div className="yt-kicker">DOORDARSHAN (DD INTERNATIONAL) — PRASAR BHARATI</div>
                <h3>DD Morning Live Show — Shiksha Avam Rojgar</h3>
                <div className="yt-role">Role: Career Advisor</div>
                <p>Dr. Chandra Shekhar appears as a career and education advisor on this nationally televised morning show, guiding lakhs of viewers on higher education, career paths, and employment opportunities in India.</p>
                <span className="yt-cta"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg> Watch Episode</span>
              </div>
            </a>
          </Reveal>

          <Reveal delay={0.08}>
            <a className="yt-column-card yt-channel-card" href="https://www.youtube.com/@Dr.chandra_shekhar" target="_blank" rel="noopener noreferrer">
              <div className="yt-media yt-media-two">
                <div className="yt-channel-tag">YOUTUBE</div>
                <span className="yt-channel-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg></span>
                <div className="yt-channel-handle">@Dr.chandra_shekhar</div>
              </div>
              <div className="yt-card-body">
                <div className="yt-kicker">OFFICIAL CHANNEL</div>
                <h3>Dr. Chandra Shekhar — YouTube</h3>
                <div className="yt-role">Career Advisor • Educator • TV Expert</div>
                <p>Watch career guidance sessions, Shiksha Avam Rojgar episodes, Big Data &amp; tech talks, and education insights on the official YouTube channel.</p>
                <span className="yt-cta yt-cta-red"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg> Visit Channel</span>
              </div>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- gallery ---------- */
function Gallery() {
  const reduce = useReducedMotion();
  const total = Math.max(GALLERY_SLOTS.length, GALLERY.length);
  const items = Array.from({ length: total }, (_, i) => {
    const s = GALLERY_SLOTS[i] || { cat: "Moments", cap: "Moment " + (i + 1) };
    return { ...s, src: GALLERY[i] || "", r: ["4 / 5", "1 / 1", "4 / 3", "3 / 4"][i % 4], g: ["one", "two", "three", "four"][i % 4] };
  });
  const visible = items.slice(0, 8);
  const live = visible.filter((x) => x.src);
  const [open, setOpen] = useState(-1);
  const close = () => setOpen(-1);
  const step = (d) => setOpen((o) => (o + d + live.length) % live.length);
  useEffect(() => {
    if (open < 0) return;
    const k = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <section id="gallery">
      <div className="wrap">
        <div className="sec-head">
          <Reveal><div className="eyebrow">Gallery</div><h2>Moments</h2></Reveal>
          <Reveal delay={0.1}><p>Awards, studio sessions, conferences and time with students.</p></Reveal>
        </div>
        <motion.div layout className="masonry">
          <AnimatePresence mode="popLayout">
            {visible.map((g, i) => {
              const idx = live.indexOf(g);
              return (
                <motion.figure layout key={g.cap + g.cat} className="shot" style={{ "--r": g.r }} initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.5, ease: EASE, delay: (i % 4) * 0.05 }}>
                  {g.src ? (
                    <button className="shot-btn" onClick={() => setOpen(idx)} aria-label={"Open photo: " + g.cap}><img src={g.src} alt={g.cap} loading="lazy" /></button>
                  ) : (
                    <div className={"ph " + g.g}><span aria-hidden="true">CS</span><em>Photo to be added</em></div>
                  )}
                </motion.figure>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {items.length > 8 && (
          <div className="gallery-cta-wrap">
            <a className="gallery-view-more" href="gallery.html">View more</a>
          </div>
        )}
      </div>
      <AnimatePresence>
        {open >= 0 && live[open] && (
          <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
            <motion.img key={open} src={live[open].src} alt={live[open].cap} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} onClick={(e) => e.stopPropagation()} />
            <div className="lb-cap">{live[open].cap} · {live[open].cat}</div>
            <button className="lb-btn lb-x" onClick={close} aria-label="Close">×</button>
            {live.length > 1 && <>
              <button className="lb-btn lb-l" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo">‹</button>
              <button className="lb-btn lb-r" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo">›</button>
            </>}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- contact + WhatsApp lead form ---------- */
const LEAD_TOPICS = ["Admission guidance", "Career counselling", "College advisory", "Research and mentoring", "Speaking and media"];

function Contact() {
  const [name, setName] = useState("");
  const [who, setWho] = useState("");
  const [topic, setTopic] = useState("");
  const [msg, setMsg] = useState("");
  const [hint, setHint] = useState(false);
  const ready = name.trim().length > 1 && topic;
  const text =
    "Namaste Prof. Chandra Shekhar ji,\n" +
    "My name is " + (name.trim() || "…") + (who ? " (" + who + ")" : "") + ".\n" +
    "I would like help with: " + (topic || "…") + "." +
    (msg.trim() ? "\n" + msg.trim() : "") +
    "\n\n(Sent from your website)";
  const go = (e) => { if (!ready) { e.preventDefault(); setHint(true); } };
  return (
    <section id="contact" className="contact">
      <div className="wrap contact-grid">
        <div>
          <Reveal><div className="eyebrow">Contact</div></Reveal>
          <Reveal delay={0.05}><h2>Tell him what you need.</h2></Reveal>
          <Reveal delay={0.1}><p className="lead">Fill in the form and your enquiry lands directly in his WhatsApp.</p></Reveal>
          <Reveal delay={0.12}>
            <form className="lead-form" onSubmit={(e) => e.preventDefault()} noValidate>
              <div className="field">
                <label htmlFor="lf-name">Your name</label>
                <input id="lf-name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setHint(false); }} placeholder="e.g. Ananya Sharma" aria-invalid={hint && name.trim().length < 2} />
              </div>
              <fieldset className="field">
                <legend>I am a</legend>
                <div className="pills">
                  {["Student", "Parent", "College", "Researcher", "Media"].map((w) => (
                    <button type="button" key={w} className={"pillbtn" + (who === w ? " on" : "")} aria-pressed={who === w} onClick={() => setWho(who === w ? "" : w)}>{w}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="field">
                <legend>I need help with</legend>
                <div className="pills">
                  {LEAD_TOPICS.map((t) => (
                    <button type="button" key={t} className={"pillbtn" + (topic === t ? " on" : "")} aria-pressed={topic === t} onClick={() => { setTopic(t); setHint(false); }}>{t}</button>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="lf-msg">Message <span>(optional)</span></label>
                <textarea id="lf-msg" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Tell him a little about your situation" />
              </div>
              <div className="bubble" aria-live="polite">
                <div className="bubble-h">Message preview</div>
                <p>{text}</p>
              </div>
              <div className="form-actions">
                <Magnetic>
                  <a className={"btn wa" + (ready ? "" : " off")} href={ready ? wa(text) : "#contact"} target={ready ? "_blank" : undefined} rel="noopener noreferrer" aria-disabled={!ready} onClick={go}>
                    <WaIcon /> Send on WhatsApp
                  </a>
                </Magnetic>
                <span className={"form-hint" + (hint ? " err" : "")} role="status">
                  {hint ? "Add your name and pick a topic first." : "WhatsApp opens with this message ready. Tap send there."}
                </span>
              </div>
            </form>
          </Reveal>
        </div>
        <div>
          <Reveal delay={0.1}><div className="rows">{CONTACT.map((c) => <CopyRow key={c.val} {...c} />)}</div></Reveal>
          <Reveal delay={0.15}>
            <div className="socials">{SOCIALS.map((s) => <a key={s.n} href={s.u} target="_blank" rel="noopener noreferrer">{s.n}</a>)}</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="wrap"><span>© 2026 GIPSM Technology India Pvt. Ltd. — Designed &amp; Developed by GIPSM</span></div>
    </footer>
  );
}

function App() {
  return (
    <div id="top">
      <ProgressBar />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <About />
        <Qualifications />
        <Help />
        <Gallery />
        <Expertise />
        <YouTube />
        <Honours />
        <Research />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <FloatingWA />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
