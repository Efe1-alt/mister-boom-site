/* MISTER BOOM — site-wide interactions (nav, motion, homepage widgets) */
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Old anchors (shared links) -> new ones ---------- */
  const legacy = { top: "nachalo", signatures: "planetite", story: "za-nas", reviews: "otzivi", order: "oferta", visit: "kontakti" };
  const oldHash = location.hash.slice(1);
  if (legacy[oldHash] && document.getElementById(legacy[oldHash])) {
    history.replaceState(null, "", "#" + legacy[oldHash]);
    window.addEventListener("load", () => document.getElementById(legacy[oldHash]).scrollIntoView(), { once: true });
  }

  /* ---------- Nav: solid on scroll, hide on scroll down ---------- */
  const nav = document.querySelector("[data-nav]");
  let lastY = window.scrollY;
  const onScrollNav = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    const menuOpen = document.body.classList.contains("menu-open") || document.body.classList.contains("page-menu");
    nav.classList.toggle("is-hidden", !menuOpen && y > 600 && y > lastY + 4);
    if (y < lastY - 4 || y < 600) nav.classList.remove("is-hidden");
    lastY = y;
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max).toFixed(4) : 0})`;
    }
  };
  const progress = document.querySelector("[data-progress]");

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector("[data-menu-toggle]");
  const overlay = document.querySelector("[data-mobile-menu]");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Затвори менюто" : "Отвори менюто");
    overlay.classList.toggle("is-open", open);
    overlay.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    document.querySelectorAll("main, footer, .cartbar").forEach((el) => (el.inert = open));
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-line");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Parallax ---------- */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const updateParallax = () => {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.08;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
  };

  /* ---------- Hero: headline drifts up and fades as you leave ---------- */
  const heroTitle = document.querySelector(".hero__title");
  const updateHero = () => {
    if (!heroTitle || reduceMotion) return;
    const y = window.scrollY, vh = window.innerHeight;
    if (y > vh * 1.2) return;
    heroTitle.style.translate = `0 ${(y * -0.14).toFixed(1)}px`;
    heroTitle.style.opacity = String(Math.max(0.15, 1 - y / (vh * 1.1)).toFixed(3));
  };

  /* ---------- Hero: pointer depth on decorative pieces (desktop only) ---------- */
  const hero = document.querySelector(".hero");
  if (hero && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      hero.style.setProperty("--mx", cx.toFixed(4));
      hero.style.setProperty("--my", cy.toFixed(4));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.0008 ? requestAnimationFrame(loop) : null;
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener("pointerleave", () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ---------- Nav: highlight the section in view (homepage) ----------
     Each section names the nav item it belongs to in data-spy
     ("За нас" -> Меню, "Оферта" -> Отзиви). */
  const spySections = [...document.querySelectorAll("[data-spy]")];
  const spyLinks = [...document.querySelectorAll('.nav__links a[href^="#"], .mobile-menu__links a[href^="#"]')];
  let spyKey = null;
  const updateSpy = () => {
    if (!spySections.length || !spyLinks.length) return;
    const line = window.innerHeight * 0.4;
    let key = spySections[0].dataset.spy;
    for (const sec of spySections) { if (sec.getBoundingClientRect().top <= line) key = sec.dataset.spy; else break; }
    if (key === spyKey) return;
    spyKey = key;
    spyLinks.forEach((l) => {
      const on = l.getAttribute("href") === "#" + key;
      l.classList.toggle("is-active", on);
      if (on) l.setAttribute("aria-current", "location"); else l.removeAttribute("aria-current");
    });
  };

  /* ---------- One rAF-throttled scroll loop ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollNav();
      updateSpy();
      updateParallax();
      updateHero();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Menu tabs ---------- */
  const tabsRoot = document.querySelector("[data-tabs]");
  if (tabsRoot) {
    const tabs = [...tabsRoot.querySelectorAll("[role=tab]")];
    const imgs = [...tabsRoot.querySelectorAll("[data-cat]")];
    const label = tabsRoot.querySelector("[data-cat-label]");
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      });
      const key = tab.dataset.tab;
      imgs.forEach((img) => img.classList.toggle("is-active", img.dataset.cat === key));
      if (label) {
        const idx = String(tabs.indexOf(tab) + 1).padStart(2, "0");
        label.textContent = `${idx} / ${tab.childNodes[1].textContent.trim()}`;
      }
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (next) { e.preventDefault(); select(tabs[(i + next + tabs.length) % tabs.length], true); }
        if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
        if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  }

  /* ---------- Business data (assets/js/business-data.js) ----------
     data-biz="path"       → text
     data-biz-href="path"  → link
     data-biz-src="path"   → iframe/img src
     data-biz-tel          → tel: link from phone.tel
     data-biz-if="path"    → hidden when the value is missing */
  const B = window.MB_BUSINESS || {};
  const pick = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), B);
  const has = (v) => v != null && v !== "" && !(Array.isArray(v) && !v.length);
  document.querySelectorAll("[data-biz]").forEach((el) => { const v = pick(el.dataset.biz); if (has(v)) el.textContent = v; });
  document.querySelectorAll("[data-biz-href]").forEach((el) => { const v = pick(el.dataset.bizHref); if (has(v)) { el.href = v; el.hidden = false; } else el.hidden = true; });
  document.querySelectorAll("[data-biz-src]").forEach((el) => { const v = pick(el.dataset.bizSrc); if (has(v)) el.src = v; });
  document.querySelectorAll("[data-biz-tel]").forEach((el) => { if (B.phone?.tel) el.href = "tel:" + B.phone.tel; else el.hidden = true; });
  document.querySelectorAll("[data-biz-mail]").forEach((el) => { if (B.email) el.href = "mailto:" + B.email; });
  document.querySelectorAll("[data-biz-if]").forEach((el) => { el.hidden = !has(pick(el.dataset.bizIf)); });
  document.querySelectorAll("[data-biz-rating]").forEach((el) => {
    const r = B.rating?.google?.value; if (r != null) el.textContent = String(r).replace(".", ",");
  });

  /* Verbatim reviews, only if real ones were provided.
     The `featured` review is the lead quote in the HTML, so it is skipped here.
     Long reviews are clamped to 4 lines (CSS) with a „Прочети целия“ toggle. */
  const reviewsEl = document.querySelector("[data-reviews]");
  const list = Array.isArray(B.reviews) ? B.reviews.filter((r) => !r.featured) : [];
  if (reviewsEl && list.length) {
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    // typography only: straight double quotes → Bulgarian „…“
    const bgQuotes = (t) => String(t).replace(/"([^"]*)"/g, "„$1“");
    const mapsUrl = B.maps?.place;
    const gIcon = '<svg class="rv-card__g" aria-hidden="true"><use href="#i-google" /></svg>';
    reviewsEl.innerHTML = list.map((r, i) => {
      const who = `— ${esc(r.author || "Гост")} · отзив в Google`;
      return `
      <li class="rv-card">
        ${r.rating ? `<span class="rv-card__stars" aria-label="${r.rating} от 5">${"★".repeat(r.rating)}</span>` : ""}
        <blockquote class="rv-card__text" id="rv-text-${i}">${esc(bgQuotes(r.text))}</blockquote>
        <button class="rv-card__more" type="button" aria-expanded="false" aria-controls="rv-text-${i}" hidden>Прочети целия</button>
        ${mapsUrl
          ? `<a class="rv-card__cite mono" href="${esc(mapsUrl)}" target="_blank" rel="noopener">${gIcon}<span>${who}</span></a>`
          : `<p class="rv-card__cite mono">${gIcon}<span>${who}</span></p>`}
      </li>`;
    }).join("") + (mapsUrl ? `
      <li class="rv-card rv-card--cta"><a href="${esc(mapsUrl)}" target="_blank" rel="noopener">Прочети всички отзиви в Google <span aria-hidden="true">↗</span></a></li>` : "");
    reviewsEl.hidden = false;

    // show the toggle only where the text is actually clamped (re-checked on resize)
    const cards = [...reviewsEl.querySelectorAll(".rv-card:not(.rv-card--cta)")];
    const measure = () => cards.forEach((card) => {
      const text = card.querySelector(".rv-card__text");
      const btn = card.querySelector(".rv-card__more");
      if (btn.getAttribute("aria-expanded") === "true") return;
      btn.hidden = text.scrollHeight <= text.clientHeight + 1;
    });
    reviewsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".rv-card__more");
      if (!btn) return;
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.closest(".rv-card").classList.toggle("is-open", open);
      btn.textContent = open ? "Скрий" : "Прочети целия";
    });
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(measure, 150); });
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    measure();
  }

  /* ---------- Opening hours + live open/closed (only when hours are known) ----------
     B.hours format: { 0: ["12:00", "22:00"], 1: ["11:00", "21:00"], … }  (0 = неделя; null = почивен ден) */
  const DAYS = ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"];
  const toH = (t) => { const [h, m] = t.split(":").map(Number); return h + m / 60; };
  const hours = B.hours && typeof B.hours === "object" ? B.hours : null;
  // the restaurant's local time (Europe/Sofia), whatever the visitor's own time zone is
  const sofiaNow = () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Sofia", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
    return { getDay: () => day, getHours: () => Number(parts.hour), getMinutes: () => Number(parts.minute) };
  };
  const isOpen = (d) => {
    const day = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
    const span = (k) => { const v = hours[k]; if (!v) return null; let [o, c] = v.map(toH); if (c <= o) c += 24; return [o, c]; };
    const t = span(day); if (t && h >= t[0] && h < t[1]) return true;
    const y = span((day + 6) % 7); return !!(y && y[1] > 24 && h < y[1] - 24);
  };
  const updateStatus = () => {
    const statusEls = document.querySelectorAll("[data-status]");
    if (!hours) { statusEls.forEach((el) => (el.hidden = true)); return; }
    const now = sofiaNow(), open = isOpen(now);
    statusEls.forEach((el) => {
      el.hidden = false;
      el.classList.toggle("is-closed", !open);
      el.querySelector("[data-status-text]").textContent = open ? "Отворено" : "Затворено";
    });
    const table = document.querySelector("[data-hours]");
    if (table) {
      const order = [1, 2, 3, 4, 5, 6, 0];
      table.querySelector("tbody").innerHTML = order.map((d) => {
        const v = hours[d];
        return `<tr class="${d === now.getDay() ? "is-today" : ""}"><th>${DAYS[d]}</th><td>${v ? `${v[0]} — ${v[1]}` : "Почивен ден"}</td></tr>`;
      }).join("");
      table.hidden = false;
      const fb = document.querySelector("[data-hours-fallback]"); if (fb) fb.hidden = true;
    }
  };
  updateStatus();
  if (hours) setInterval(updateStatus, 60_000);

  /* ---------- Newsletter (front-end only for now) ---------- */
  const form = document.querySelector("[data-news]");
  const msg = document.querySelector("[data-news-msg]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "Готово! Ще научаваш новините първи.";
      form.reset();
    });
  }

  /* ---------- Scroll reveals: tagged here, after every deferred script has
     rendered its content (menu.js builds the menu before DOMContentLoaded) ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    const watch = (el, cls, delay = 0) => {
      if (!el || el.classList.contains("rv") || el.classList.contains("rv-mask") || el.classList.contains("wipe")) return;
      el.classList.add(cls);
      el.style.setProperty("--rd", `${delay}ms`);
      io.observe(el);
    };
    // big titles rise out of a mask
    document.querySelectorAll(".section-head .display, .menu__head .display, .visit__head .display, .cat__title, .story__title .reveal-line").forEach((el, i) => {
      el.classList.remove("reveal-line");
      el.innerHTML = `<span class="rv-mask__in">${el.innerHTML}</span>`;
      watch(el, "rv-mask", el.classList.contains("story__title-indent") ? 120 : 0);
    });
    // supporting text fades up, staggered within its group
    const groups = [
      ".section-head .label, .section-head__copy",
      ".menu__head .label", ".visit__head .label",
      ".story__masthead",
      ".cat__idx, .cat__intro, .cat__count",
      ".footer__news > *", ".footer__cols > div",
      ".co .step", ".summary__inner"
    ];
    groups.forEach((sel) => {
      const seen = new Map();
      document.querySelectorAll(sel).forEach((el) => {
        const n = seen.get(el.parentElement) || 0;
        seen.set(el.parentElement, n + 1);
        watch(el, "rv", n * 90);
      });
    });
    // photos: a panel retracts while the image settles
    document.querySelectorAll(".sig__media, .story__img, .visit__photo, .menu__visual").forEach((el) => {
      const panel = document.createElement("span");
      panel.className = "wipe-panel"; panel.setAttribute("aria-hidden", "true");
      el.appendChild(panel);
      watch(el, "wipe", 120);
    });
  });

  /* ---------- Year ---------- */
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
