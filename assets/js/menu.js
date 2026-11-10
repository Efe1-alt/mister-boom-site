/* MISTER BOOM — menu page: rendering, product builder, cart drawer.
   Menu content: assets/js/menu-data.js · shared logic: assets/js/shop.js */
(() => {
  const S = window.MB_SHOP;
  if (!S) return;
  const { M, esc, money, signed, byId, cart } = S;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n) => String(n).padStart(2, "0");
  const products = M.products;

  /* ==========================================================================
     RENDER: notice, category bar, product grid
     ========================================================================== */
  const notice = $("[data-notice]");
  if (M.notice && notice) { notice.textContent = M.notice; notice.hidden = false; }

  const cats = M.categories.filter((c) => products.some((p) => p.category === c.id));
  const catList = $("[data-catbar-list]");
  catList.innerHTML = cats.map((c) => {
    const n = products.filter((p) => p.category === c.id).length;
    return `<a class="catbar__link" href="#cat-${c.id}" data-target="${c.id}"><span>${esc(c.label)}</span><sup>${pad(n)}</sup></a>`;
  }).join("") + `<span class="catbar__ink" aria-hidden="true"></span>`;

  const tagChip = (t) => t === "bestseller" ? `<span class="chip chip--red">Най-продаван</span>` : t === "new" ? `<span class="chip chip--light">Ново</span>` : "";
  const tagsHTML = (p) => (p.tags || []).map(tagChip).join("") + (p.badge ? `<span class="chip">${esc(p.badge)}</span>` : "");

  function cardHTML(p) {
    const custom = S.groupsFor(p).some((g) => !g.remove);
    const tags = tagsHTML(p);
    return `
      <article class="card${p.featured ? " card--feature" : ""}${p.image ? "" : " card--swatch"}" data-id="${p.id}">
        <div class="card__media${p.light ? " is-light" : ""}">
          ${S.mediaHTML(p)}
          ${tags ? `<div class="card__tags">${tags}</div>` : ""}
          <span class="card__peek mono" aria-hidden="true">Виж детайли →</span>
        </div>
        <div class="card__body">
          <h3 class="card__name"><button type="button" class="card__open" data-open="${p.id}">${esc(p.name)}</button></h3>
          <p class="card__desc">${esc(p.description)}</p>
          <div class="card__foot">
            <div class="card__price">
              <strong>${money(p.price)}</strong>
              ${custom ? `<span class="mono">С опции</span>` : ""}
            </div>
            <button type="button" class="add" data-add="${p.id}" aria-label="Добави ${esc(p.name)} в количката">
              <span class="add__label">Добави</span>
              <span class="add__icon"><svg aria-hidden="true"><use href="#i-plus" /></svg><svg class="add__done" aria-hidden="true"><use href="#i-check" /></svg></span>
            </button>
          </div>
        </div>
      </article>`;
  }

  $("[data-products]").innerHTML = cats.map((c, i) => {
    const items = products.filter((p) => p.category === c.id);
    return `
      <section class="cat" id="cat-${c.id}" data-cat="${c.id}" aria-labelledby="h-${c.id}">
        <header class="cat__head">
          <span class="cat__idx mono">${pad(i + 1)} / ${pad(cats.length)}</span>
          <h2 class="cat__title" id="h-${c.id}">${esc(c.label)}</h2>
          <p class="cat__intro">${esc(c.intro || "")}</p>
          <span class="cat__count mono">${pad(items.length)} ${items.length === 1 ? "продукт" : "продукта"}</span>
        </header>
        <div class="grid grid--${c.cols || 3}">${items.map(cardHTML).join("")}</div>
      </section>`;
  }).join("");

  // loading state: shimmer until each photo has decoded, then fade it in
  $$(".card__media").forEach((media) => {
    const img = $("img", media);
    const done = () => media.classList.add("is-loaded");
    if (!img || (img.complete && img.naturalWidth)) done();
    else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true }); }
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -6% 0px" });
    $$(".card").forEach((c, i) => { c.style.setProperty("--i", i % 4); c.classList.add("will-reveal"); io.observe(c); });
  }

  /* ---------- Category bar: smooth scroll + scroll-spy + sliding ink ---------- */
  const catbar = $("[data-catbar]");
  const links = $$(".catbar__link", catList);
  const ink = $(".catbar__ink", catList);
  const sections = $$(".cat");
  let activeCat = null;

  function setActive(id) {
    if (id === activeCat) return;
    activeCat = id;
    links.forEach((a) => {
      const on = a.dataset.target === id;
      a.classList.toggle("is-active", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        ink.style.width = a.offsetWidth + "px";
        ink.style.transform = `translateX(${a.offsetLeft}px)`;
        const left = a.offsetLeft - catList.clientWidth / 2 + a.offsetWidth / 2;
        catList.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
      } else a.removeAttribute("aria-current");
    });
  }
  const barTop = () => parseFloat(getComputedStyle(catbar).top) || 0;
  function spy() {
    const y = catbar.getBoundingClientRect().bottom + 24;
    let current = sections[0]?.dataset.cat;
    sections.forEach((s) => { if (s.getBoundingClientRect().top - y <= 0) current = s.dataset.cat; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1).dataset.cat;
    setActive(current);
    catbar.classList.toggle("is-stuck", catbar.getBoundingClientRect().top <= barTop() + 1);
  }
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById("cat-" + a.dataset.target);
    const top = target.getBoundingClientRect().top + window.scrollY - (catbar.offsetHeight + barTop()) - 8;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", "#cat-" + a.dataset.target);
  }));
  let spyTick = false;
  window.addEventListener("scroll", () => {
    if (spyTick) return; spyTick = true;
    requestAnimationFrame(() => { spy(); spyTick = false; });
  }, { passive: true });
  window.addEventListener("resize", () => { activeCat = null; spy(); });
  spy();

  /* ==========================================================================
     DIALOG HELPERS (native <dialog>: focus trap + Esc)
     ========================================================================== */
  const cartDlg = $("[data-cart]");
  const pd = $("[data-pd]");
  const cartbarEl = $("[data-cartbar]");

  function openDialog(d) {
    const from = document.activeElement;
    d._returnTo = from && !from.closest("dialog") ? from : $(".cart-btn");
    d.showModal();
    document.documentElement.classList.add("is-locked");
    cartbarEl.classList.add("is-tucked");
  }
  function closeDialog(d) {
    if (!d.open) return;
    if (reduceMotion) { d.close(); return; }
    d.classList.add("is-closing");
    d.addEventListener("animationend", () => { d.classList.remove("is-closing"); d.close(); }, { once: true });
  }
  [cartDlg, pd].forEach((d) => {
    d.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]")) {
        document.documentElement.classList.remove("is-locked");
        cartbarEl.classList.remove("is-tucked");
        if (d._returnTo && document.contains(d._returnTo)) d._returnTo.focus({ preventScroll: true });
      }
    });
    d.addEventListener("cancel", (e) => { e.preventDefault(); closeDialog(d); });
    d.addEventListener("click", (e) => { if (e.target === d) closeDialog(d); });
  });

  /* ==========================================================================
     CART DRAWER
     ========================================================================== */
  const cartBody = $("[data-cart-body]");
  const cartFoot = $("[data-cart-foot]");
  const clearBtn = $("[data-cart-clear]");
  const checkoutBtn = $("[data-checkout]");
  let lastCount = cart.count();

  function renderCart() {
    const count = cart.count();
    const t = S.totals();
    const bump = count > lastCount && !reduceMotion;
    lastCount = count;

    $$("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    $$("[data-cart-total]").forEach((el) => (el.textContent = money(t.total)));
    $(".cart-btn").classList.toggle("has-items", count > 0);
    cartbarEl.hidden = count === 0;
    clearBtn.hidden = count === 0;

    // fulfilment toggle + sums
    $$("[data-mode]", cartFoot).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === t.mode)));
    const d = S.F.delivery;
    $("[data-mode-meta='delivery']", cartFoot).textContent = d.fee == null ? "Уточнява се" : d.freeFrom != null && t.subtotal >= d.freeFrom ? "Безплатна" : money(d.fee);
    $("[data-sum-sub]").textContent = money(t.subtotal);
    $("[data-sum-fee]").textContent = S.feeText(t);
    $("[data-sum-total-label]").textContent = S.totalLabel(t);
    $("[data-sum-fee-label]").textContent = t.mode === "pickup" ? "Вземане" : "Доставка";
    $("[data-sum-total]").textContent = money(t.total);

    const freebar = $("[data-freebar]");
    freebar.hidden = !(t.mode === "delivery" && t.freeFrom != null);
    if (!freebar.hidden) {
      $("[data-freebar-text]").innerHTML = t.toFree > 0
        ? `Добави още <b>${money(t.toFree)}</b> за безплатна доставка`
        : `<b>Безплатната доставка е отключена</b>`;
      $("[data-freebar-fill]").style.transform = `scaleX(${Math.min(1, t.subtotal / t.freeFrom)})`;
      freebar.classList.toggle("is-done", t.toFree === 0);
    }
    const warn = $("[data-min-warn]");
    warn.hidden = !t.belowMin;
    if (t.belowMin) warn.textContent = `Минималната поръчка за доставка е ${money(t.minOrder)}. Добави още ${money(t.toMin)} или избери вземане.`;
    checkoutBtn.setAttribute("aria-disabled", String(t.belowMin));
    const eta = S.F[t.mode]?.eta;
    $$("[data-cart-eta]").forEach((el) => { el.textContent = eta || ""; el.closest("[data-eta-wrap]").hidden = !eta; });

    if (!count) {
      cartFoot.hidden = true;
      cartBody.innerHTML = `
        <div class="cart__empty">
          <svg aria-hidden="true"><use href="#burst" /></svg>
          <p class="cart__empty-title">Още е празно.</p>
          <p>Любимият ти бургер е на един клик разстояние.</p>
          <button type="button" class="btn btn--ghost" data-cart-close>Разгледай менюто</button>
        </div>`;
      return;
    }
    cartFoot.hidden = false;
    cartBody.innerHTML = `<ul class="cart__list">${cart.lines().map((l, n) => {
      const p = byId[l.id];
      const parts = S.summaryParts(p, l.sel);
      return `
        <li class="ci" data-key="${esc(l.key)}" style="--n:${Math.min(n, 6)}">
          <div class="ci__media">${S.mediaHTML(p)}</div>
          <div class="ci__info">
            <div class="ci__top">
              <h3 class="ci__name">${esc(p.name)}</h3>
              <strong class="ci__price">${money(cart.lineTotal(l))}</strong>
            </div>
            ${parts.length ? `<p class="ci__opts">${parts.map(esc).join(" · ")}</p>` : ""}
            <p class="ci__unit mono">${money(cart.unit(l))} / бр.</p>
            <div class="ci__row">
              <div class="qty qty--sm" role="group" aria-label="Количество за ${esc(p.name)}">
                <button type="button" class="qty__btn" data-line-qty="-1" aria-label="${l.qty === 1 ? "Премахни" : "Намали"}"><svg aria-hidden="true"><use href="#i-minus" /></svg></button>
                <output class="qty__val">${l.qty}</output>
                <button type="button" class="qty__btn" data-line-qty="1" aria-label="Увеличи" ${l.qty >= 99 ? "disabled" : ""}><svg aria-hidden="true"><use href="#i-plus" /></svg></button>
              </div>
              <button type="button" class="ci__edit link-line" data-line-edit>Промени</button>
              <button type="button" class="ci__remove link-line" data-line-remove>Премахни</button>
            </div>
          </div>
        </li>`;
    }).join("")}</ul>`;
  }

  cartBody.addEventListener("click", (e) => {
    if (e.target.closest("[data-cart-close]")) { closeDialog(cartDlg); return; }
    const li = e.target.closest(".ci"); if (!li) return;
    const key = li.dataset.key;
    const q = e.target.closest("[data-line-qty]");
    if (q) { cart.change(key, Number(q.dataset.lineQty)); keepFocus(key, "[data-line-qty='" + q.dataset.lineQty + "']"); return; }
    if (e.target.closest("[data-line-remove]")) { li.classList.add("is-leaving"); setTimeout(() => cart.remove(key), reduceMotion ? 0 : 280); return; }
    if (e.target.closest("[data-line-edit]")) { const l = cart.find(key); closeDialog(cartDlg); openProduct(l.id, { editKey: key }); }
  });
  // after a re-render keep keyboard focus on the same control
  function keepFocus(key, sel) {
    const li = cartBody.querySelector(`.ci[data-key="${CSS.escape(key)}"]`);
    (li?.querySelector(sel) || cartBody.querySelector(".qty__btn") || $("[data-cart-close]")).focus({ preventScroll: true });
    const val = li?.querySelector(".qty__val");
    if (val && !reduceMotion) val.classList.add("tick");
  }

  $$("[data-mode]", cartFoot).forEach((b) => b.addEventListener("click", () => S.setMode(b.dataset.mode)));
  checkoutBtn.addEventListener("click", (e) => { if (checkoutBtn.getAttribute("aria-disabled") === "true") e.preventDefault(); });

  // Clear cart: two-step confirmation inside the drawer
  let clearTimer;
  clearBtn.addEventListener("click", () => {
    if (clearBtn.classList.contains("is-armed")) {
      clearTimeout(clearTimer); clearBtn.classList.remove("is-armed"); clearBtn.textContent = "Изчисти";
      cart.clear(); showToast("Количката е изчистена", "cleared");
      return;
    }
    clearBtn.classList.add("is-armed"); clearBtn.textContent = "Сигурен ли си?";
    clearTimer = setTimeout(() => { clearBtn.classList.remove("is-armed"); clearBtn.textContent = "Изчисти"; }, 3000);
  });

  function openCart() {
    cartBody.classList.add("is-opening");
    setTimeout(() => cartBody.classList.remove("is-opening"), 900);
    openDialog(cartDlg);
  }
  $$("[data-cart-open]").forEach((b) => b.addEventListener("click", openCart));
  $("[data-cart-close]").addEventListener("click", () => closeDialog(cartDlg));
  cart.onChange(renderCart);

  /* ==========================================================================
     PRODUCT DIALOG — the builder
     ========================================================================== */
  const ui = {
    media: $("[data-pd-media]"), tags: $("[data-pd-tags]"), name: $("[data-pd-name]"), base: $("[data-pd-base]"),
    desc: $("[data-pd-desc]"), ingredients: $("[data-pd-ingredients]"), groups: $("[data-pd-groups]"),
    summary: $("[data-pd-summary]"), qty: $("[data-pd-qty]"), total: $("[data-pd-total]"), add: $("[data-pd-add]"),
    scroll: $("[data-pd-scroll]")
  };
  let cur = null; // { p, sel, qty, editKey }

  function groupMeta(g) {
    if (g.remove) return "По желание · Безплатно";
    if (g.type === "single") return "Задължително · Избери 1";
    const bits = [`По желание · До ${g.max}`];
    if (g.included) bits.push(g.included === 1 ? "1 включен" : `${g.included} включени`);
    return bits.join(" · ");
  }

  function renderGroups() {
    ui.groups.innerHTML = S.groupsFor(cur.p).map((g) => {
      const opts = g.options.map((o) => `
          <label class="opt${g.remove ? " opt--remove" : ""}">
            <input type="${g.type === "single" ? "radio" : "checkbox"}" name="g-${g.key}" value="${esc(o.id)}" data-group="${g.key}" />
            <span class="opt__box" aria-hidden="true"><svg><use href="#i-check" /></svg></span>
            <span class="opt__label">${esc(o.label)}</span>
            <span class="opt__price mono" data-price-for="${esc(o.id)}"></span>
          </label>`).join("");
      return `
        <fieldset class="og og--${g.remove ? "remove" : g.type}" data-og="${g.key}">
          <legend class="og__head">
            <span class="og__title">${esc(g.label)}</span>
            <span class="og__meta mono">${groupMeta(g)}</span>
          </legend>
          ${g.type === "multi" && !g.remove ? `<p class="og__count mono" data-count-for="${g.key}"></p>` : ""}
          <div class="og__opts">${opts}</div>
        </fieldset>`;
    }).join("");
  }

  function syncBuilder() {
    const { p, sel, qty } = cur;
    S.groupsFor(p).forEach((g) => {
      const fs = ui.groups.querySelector(`[data-og="${g.key}"]`);
      const chosen = [].concat(sel[g.key] || []);
      const atMax = g.type === "multi" && chosen.length >= (g.max || Infinity);
      const free = S.freeIds(g, chosen);
      const freeLeft = g.type === "multi" ? Math.max(0, (g.included || 0) - chosen.length) : 0;
      $$("input", fs).forEach((inp) => {
        const on = chosen.includes(inp.value);
        inp.checked = on;
        inp.disabled = !on && atMax;
        inp.closest(".opt").classList.toggle("is-on", on);
        inp.closest(".opt").classList.toggle("is-disabled", inp.disabled);
        const o = S.optionOf(g, inp.value);
        let txt = "";
        if (g.remove) txt = "";
        else if (g.type === "single") txt = o.price ? signed(o.price) : "";
        else if ((on && free.has(o.id)) || (!on && freeLeft > 0)) txt = "Включен";
        else txt = o.price ? signed(o.price) : "Безплатно";
        fs.querySelector(`[data-price-for="${CSS.escape(inp.value)}"]`).textContent = txt;
      });
      const cnt = fs.querySelector(`[data-count-for="${g.key}"]`);
      if (cnt) cnt.textContent = chosen.length ? `Избрани ${chosen.length} от ${g.max}` : "";
    });
    const unit = S.unitPrice(p, sel);
    const parts = S.summaryParts(p, sel);
    ui.summary.innerHTML = `<span class="mono">Твоят избор</span> ${parts.length ? parts.map(esc).join(" · ") : "Както е описан"}`;
    ui.qty.textContent = qty;
    ui.total.textContent = money(unit * qty);
    $("[data-qty='-1']", pd).disabled = qty <= 1;
    $("[data-qty='1']", pd).disabled = qty >= 99;
    const narrow = window.matchMedia("(max-width: 640px)").matches;
    ui.add.firstElementChild.textContent = cur.editKey ? "Запази промените"
      : narrow ? (qty > 1 ? `Добави ${qty}` : "Добави")
      : (qty > 1 ? `Добави ${qty} в количката` : "Добави в количката");
  }

  ui.groups.addEventListener("change", (e) => {
    const inp = e.target; if (!inp.dataset.group) return;
    const g = S.groupsFor(cur.p).find((x) => x.key === inp.dataset.group);
    if (g.type === "single") cur.sel[g.key] = inp.value;
    else {
      const set = new Set(cur.sel[g.key]);
      inp.checked ? set.add(inp.value) : set.delete(inp.value);
      cur.sel[g.key] = g.options.map((o) => o.id).filter((id) => set.has(id)).slice(0, g.max || Infinity);
    }
    syncBuilder();
    if (!reduceMotion) { ui.total.classList.remove("tick"); void ui.total.offsetWidth; ui.total.classList.add("tick"); }
  });

  $$("[data-qty]", pd).forEach((b) => b.addEventListener("click", () => {
    cur.qty = Math.max(1, Math.min(99, cur.qty + Number(b.dataset.qty)));
    syncBuilder();
    if (!reduceMotion) { ui.qty.classList.remove("tick"); void ui.qty.offsetWidth; ui.qty.classList.add("tick"); }
  }));

  ui.add.addEventListener("click", () => {
    const { p, sel, qty, editKey } = cur;
    if (editKey && cart.find(editKey)) { cart.replace(editKey, sel, qty); showToast(p.name, "updated"); }
    else { cart.add(p.id, sel, qty); showToast(`${p.name} × ${qty}`, "added"); flyToCart($(".pd__img", ui.media), 260); }
    closeDialog(pd);
  });

  function openProduct(id, { editKey } = {}) {
    const p = byId[id]; if (!p) return;
    const line = editKey && cart.find(editKey);
    cur = { p, sel: line ? S.clone(line.sel) : S.defaultSelection(p), qty: line ? line.qty : 1, editKey: line ? editKey : null };
    ui.media.innerHTML = S.mediaHTML(p, "pd__img");
    ui.media.classList.toggle("is-swatch", !p.image);
    ui.tags.innerHTML = tagsHTML(p) + `<span class="pd__cat mono">${esc(M.categories.find((c) => c.id === p.category)?.label || "")}</span>`;
    ui.name.textContent = p.name;
    ui.base.textContent = `Основна цена ${money(p.price)}`;
    ui.desc.textContent = p.description;
    ui.ingredients.innerHTML = (p.ingredients || []).map((i) => `<li>${esc(i.name)}</li>`).join("");
    renderGroups();
    syncBuilder();
    ui.scroll.scrollTop = 0;
    if (!pd.open) openDialog(pd);
    history.replaceState(null, "", "#p-" + p.id);
  }

  $("[data-pd-close]").addEventListener("click", () => closeDialog(pd));
  pd.addEventListener("close", () => {
    if (location.hash.startsWith("#p-")) history.replaceState(null, "", location.pathname + location.search);
  });

  /* ---------- Card interactions ---------- */
  $("[data-products]").addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const p = byId[add.dataset.add];
      cart.add(p.id, S.defaultSelection(p), 1);
      showToast(`${p.name} × 1`, "added");
      flyToCart($(".card__media img, .card__media .swatch", add.closest(".card")));
      add.classList.add("is-done");
      setTimeout(() => add.classList.remove("is-done"), 1400);
      return;
    }
    const card = e.target.closest(".card");
    if (card) openProduct(card.dataset.id);
  });

  /* ---------- Add-to-cart feedback: the product flies into the cart ---------- */
  function cartTarget() {
    const bar = cartbarEl.getBoundingClientRect();
    return bar.width > 0 && !cartbarEl.hidden ? $(".cartbar__count", cartbarEl) : $(".cart-btn");
  }
  function pulseCart() {
    const btn = cartTarget().closest("button");
    btn.classList.remove("is-pulse"); void btn.offsetWidth; btn.classList.add("is-pulse");
  }
  function flyToCart(src, delay = 0) {
    if (!src || reduceMotion) { pulseCart(); return; }
    const s = src.getBoundingClientRect();
    if (!s.width) { pulseCart(); return; }
    const ghost = src.cloneNode(true);
    ghost.removeAttribute("loading");
    ghost.classList.add("fly-ghost");
    Object.assign(ghost.style, { left: s.left + "px", top: s.top + "px", width: s.width + "px", height: s.height + "px" });
    setTimeout(() => {
      const t = cartTarget().getBoundingClientRect();
      const dx = t.left + t.width / 2 - (s.left + s.width / 2);
      const dy = t.top + t.height / 2 - (s.top + s.height / 2);
      const end = Math.max(0.05, 36 / s.width);
      document.body.appendChild(ghost);
      const anim = ghost.animate([
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 70}px) scale(${(1 + end) / 2.2})`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(${end})`, opacity: 0.35 }
      ], { duration: 820, easing: "cubic-bezier(.55, 0, .2, 1)" });
      anim.onfinish = () => { ghost.remove(); pulseCart(); };
    }, delay);
  }

  /* ---------- Toast ---------- */
  const toast = $("[data-toast]");
  let toastTimer;
  function showToast(text, verb) {
    const label = { added: "Добавено:", updated: "Обновено:", cleared: "" }[verb] ?? "";
    toast.innerHTML = `<svg aria-hidden="true"><use href="#i-check" /></svg><span>${label ? `<b>${label}</b> ` : ""}${esc(text)}</span>` +
      (verb === "cleared" ? "" : `<button type="button" data-toast-view>Виж поръчката</button>`);
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 3200);
  }
  toast.addEventListener("click", (e) => {
    if (e.target.closest("[data-toast-view]")) { toast.classList.remove("is-on"); openCart(); }
  });

  /* ---------- Deep links: #p-the-boom opens a product, #cart opens the cart ---------- */
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("p-") && byId[h.slice(2)]) openProduct(h.slice(2));
    else if (h === "cart") { history.replaceState(null, "", location.pathname); openCart(); }
    else if (h.startsWith("cat-")) {
      const t = links.find((a) => a.dataset.target === h.slice(4));
      if (t) setTimeout(() => t.click(), 60);
    }
  }
  window.addEventListener("hashchange", fromHash);

  renderCart();
  fromHash();
})();
