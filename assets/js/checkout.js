/* MISTER BOOM — checkout (FRONTEND DEMO ONLY).
   Nothing is sent anywhere: no API, no payment. On a valid submit the page
   shows a demo confirmation built from what's in this browser. */
(() => {
  const S = window.MB_SHOP;
  if (!S) return;
  const { esc, money, byId, cart } = S;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const form = $("[data-form]");
  const views = { checkout: $("[data-view='checkout']"), empty: $("[data-view='empty']"), done: $("[data-view='done']") };
  const show = (name) => Object.entries(views).forEach(([k, el]) => (el.hidden = k !== name));
  let submitted = false; // after first submit, errors update live

  /* ---------- Draft: keep typed details for this tab (sessionStorage) ---------- */
  const DRAFT = "mb-checkout-draft";
  const textFields = ["name", "phone", "email", "address", "city", "notes"];
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT) || "{}");
    textFields.forEach((k) => { if (typeof d[k] === "string") form.elements[k].value = d[k]; });
  } catch (_) {}
  const saveDraft = () => {
    try { sessionStorage.setItem(DRAFT, JSON.stringify(Object.fromEntries(textFields.map((k) => [k, form.elements[k].value])))); } catch (_) {}
  };

  /* ---------- Fulfilment + payment ---------- */
  const F = S.F;
  const dMeta = [F.delivery.eta, F.delivery.fee == null ? "Такса според адреса" : money(F.delivery.fee),
    F.delivery.freeFrom != null ? `безплатна над ${money(F.delivery.freeFrom)}` : null].filter(Boolean);
  $("[data-meta='delivery']").textContent = dMeta.join(" · ");
  $("[data-meta='pickup']").textContent = [F.pickup.eta, "Безплатно"].filter(Boolean).join(" · ");
  $("[data-pickup-address]").textContent = F.pickup.address || "";
  $("[data-pickup-eta]").textContent = F.pickup.eta ? `Готова за ${F.pickup.eta} след потвърждение. ` : "";

  const PAY_FOR = { delivery: "cod", pickup: "onsite" };
  function applyMode(mode) {
    form.elements.mode.value = mode;
    const delivery = mode === "delivery";
    const box = $("[data-delivery-fields]");
    box.classList.toggle("is-open", delivery);
    box.inert = !delivery;
    box.setAttribute("aria-hidden", String(!delivery));
    $("[data-pickup-info]").hidden = delivery;
    if (!delivery) ["address", "city"].forEach(clearError);
    // payment: only the method that fits the chosen fulfilment is available
    $$("[data-pay]").forEach((label) => {
      const inp = $("input", label);
      const allowed = inp.value === PAY_FOR[mode];
      inp.disabled = !allowed;
      label.classList.toggle("is-locked", !allowed);
    });
    form.elements.payment.value = PAY_FOR[mode];
    syncChoices();
    renderSummary();
  }
  function syncChoices() {
    $$(".choice").forEach((c) => c.classList.toggle("is-on", $("input", c).checked));
  }
  form.addEventListener("change", (e) => {
    if (e.target.name === "mode") { applyMode(e.target.value); S.setMode(e.target.value); }
    if (e.target.name === "payment") syncChoices();
  });

  /* ---------- Validation ---------- */
  const clean = (v) => v.replace(/\s+/g, " ").trim();
  const rules = {
    name(v) {
      v = clean(v);
      if (!v) return "Въведи име и фамилия.";
      if (!/^[\p{L}][\p{L}'’ .-]*$/u.test(v)) return "Името може да съдържа само букви, интервал и тире.";
      if (v.split(" ").filter((w) => w.replace(/[.'’-]/g, "").length >= 2).length < 2) return "Въведи и име, и фамилия.";
      return "";
    },
    phone(v) {
      const n = v.replace(/[\s\-().\/]/g, "");
      if (!n) return "Въведи телефон за връзка.";
      if (!/^(\+359|00359|0)\d{8,9}$/.test(n)) return "Невалиден телефон. Пример: 0888 123 456 или +359 888 123 456.";
      return "";
    },
    email(v) {
      v = v.trim();
      if (!v) return "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(v)) return "Невалиден имейл. Пример: ime@domain.bg";
      return "";
    },
    address(v) {
      if (form.elements.mode.value !== "delivery") return "";
      v = clean(v);
      if (!v) return "Въведи адрес за доставка.";
      if (v.length < 6 || !/\p{L}{2,}/u.test(v) || !/\d/.test(v)) return "Добави улица и номер, напр. ул. „Шипка“ 12.";
      return "";
    },
    city(v) {
      if (form.elements.mode.value !== "delivery") return "";
      v = clean(v);
      if (!v) return "Въведи град.";
      if (!/^[\p{L}][\p{L} .-]{1,}$/u.test(v)) return "Въведи валидно име на град.";
      return "";
    }
  };
  const LABELS = { name: "Име и фамилия", phone: "Телефон", email: "Имейл", address: "Адрес", city: "Град" };

  function setError(key, msg) {
    const field = $(`[data-field="${key}"]`);
    const input = form.elements[key];
    field.classList.toggle("has-error", !!msg);
    field.classList.toggle("is-valid", !msg && input.value.trim() !== "");
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    $(".field__error", field).textContent = msg;
  }
  function clearError(key) { setError(key, ""); $(`[data-field="${key}"]`).classList.remove("is-valid"); }
  const validate = (key) => { const msg = rules[key](form.elements[key].value); setError(key, msg); return msg; };

  Object.keys(rules).forEach((key) => {
    const input = form.elements[key];
    input.addEventListener("blur", () => { if (input.value.trim() || submitted) validate(key); });
    input.addEventListener("input", () => {
      saveDraft();
      const field = $(`[data-field="${key}"]`);
      if (submitted || field.classList.contains("has-error")) validate(key);
      if (submitted) renderErrorSummary();
    });
  });
  form.elements.notes.addEventListener("input", () => {
    $("[data-notes-count]").textContent = form.elements.notes.value.length;
    saveDraft();
  });
  $("[data-notes-count]").textContent = form.elements.notes.value.length;

  const errsum = $("[data-errsum]");
  function collectErrors() {
    const errs = [];
    Object.keys(rules).forEach((k) => { const m = validate(k); if (m) errs.push({ key: k, msg: m }); });
    const t = S.totals();
    if (!cart.count()) errs.push({ key: null, msg: "Количката е празна." });
    else if (t.belowMin) errs.push({ key: null, msg: `Минималната поръчка за доставка е ${money(t.minOrder)}. Добави още ${money(t.toMin)} или избери вземане.` });
    return errs;
  }
  function renderErrorSummary(errs = null) {
    if (!submitted) return;
    errs = errs || Object.keys(rules).map((k) => ({ key: k, msg: rules[k](form.elements[k].value) })).filter((e) => e.msg);
    if (!errs.length) { errsum.hidden = true; return; }
    errsum.hidden = false;
    errsum.innerHTML = `
      <div class="errsum__head"><svg aria-hidden="true"><use href="#i-alert" /></svg>
        <p><b>Поръчката не може да продължи.</b> Поправи ${errs.length === 1 ? "полето" : `тези ${errs.length} неща`}:</p></div>
      <ul>${errs.map((e) => e.key
        ? `<li><a href="#f-${e.key}" data-goto="${e.key}"><b>${LABELS[e.key]}:</b> ${esc(e.msg)}</a></li>`
        : `<li>${esc(e.msg)}</li>`).join("")}</ul>`;
  }
  errsum.addEventListener("click", (e) => {
    const a = e.target.closest("[data-goto]"); if (!a) return;
    e.preventDefault();
    const input = form.elements[a.dataset.goto];
    input.focus();
    input.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Order summary ---------- */
  function linesHTML(lines, editable) {
    return lines.map((l) => {
      const p = byId[l.id];
      const parts = S.summaryParts(p, l.sel);
      return `
        <li class="sl" data-key="${esc(l.key)}">
          <div class="sl__media">${S.mediaHTML(p)}${editable ? "" : `<span class="sl__qty mono">×${l.qty}</span>`}</div>
          <div class="sl__info">
            <div class="sl__top"><h3 class="sl__name">${esc(p.name)}</h3><strong class="sl__price">${money(S.unitPrice(p, l.sel) * l.qty)}</strong></div>
            ${parts.length ? `<p class="sl__opts">${parts.map(esc).join(" · ")}</p>` : ""}
            ${editable ? `
            <div class="sl__row">
              <div class="qty qty--sm" role="group" aria-label="Количество за ${esc(p.name)}">
                <button type="button" class="qty__btn" data-q="-1" aria-label="${l.qty === 1 ? "Премахни" : "Намали"}"><svg aria-hidden="true"><use href="#i-minus" /></svg></button>
                <output class="qty__val">${l.qty}</output>
                <button type="button" class="qty__btn" data-q="1" aria-label="Увеличи" ${l.qty >= 99 ? "disabled" : ""}><svg aria-hidden="true"><use href="#i-plus" /></svg></button>
              </div>
              <span class="sl__unit mono">${money(S.unitPrice(p, l.sel))} / бр.</span>
              <button type="button" class="sl__remove" data-remove aria-label="Премахни ${esc(p.name)}"><svg aria-hidden="true"><use href="#i-close" /></svg></button>
            </div>` : `<p class="sl__unit mono">${l.qty} × ${money(S.unitPrice(p, l.sel))}</p>`}
          </div>
        </li>`;
    }).join("");
  }
  function sumsHTML(t) {
    return `
      <div><dt>Междинна сума</dt><dd>${money(t.subtotal)}</dd></div>
      <div><dt>${t.mode === "pickup" ? "Вземане" : "Доставка"}</dt><dd>${S.feeText(t)}</dd></div>
      <div class="sums__total"><dt>${S.totalLabel(t)}</dt><dd>${money(t.total)}</dd></div>`;
  }

  const linesEl = $("[data-lines]");
  function renderSummary() {
    if (!views.done.hidden) return;
    const count = cart.count();
    if (!count) { show("empty"); return; }
    show("checkout");
    const t = S.totals(form.elements.mode.value || S.getMode());
    $("[data-count]").textContent = count;
    linesEl.innerHTML = linesHTML(cart.lines(), true);
    $("[data-sum-sub]").textContent = money(t.subtotal);
    $("[data-sum-fee-label]").textContent = t.mode === "pickup" ? "Вземане" : "Доставка";
    $("[data-sum-fee]").textContent = S.feeText(t);
    $("[data-sum-total-label]").textContent = S.totalLabel(t);
    $("[data-sum-total]").textContent = money(t.total);
    $("[data-submit-total]").textContent = money(t.total);
    const warn = $("[data-min-warn]");
    warn.hidden = !t.belowMin;
    if (t.belowMin) warn.textContent = `Минималната поръчка за доставка е ${money(t.minOrder)}. Добави още ${money(t.toMin)} или избери вземане.`;
  }
  linesEl.addEventListener("click", (e) => {
    const li = e.target.closest(".sl"); if (!li) return;
    const key = li.dataset.key;
    const q = e.target.closest("[data-q]");
    if (q) {
      cart.change(key, Number(q.dataset.q));
      const again = linesEl.querySelector(`.sl[data-key="${CSS.escape(key)}"] [data-q="${q.dataset.q}"]`);
      (again || linesEl.querySelector(".qty__btn") || $("[data-submit]"))?.focus({ preventScroll: true });
    }
    if (e.target.closest("[data-remove]")) cart.remove(key);
  });

  cart.onChange(() => { if (form.elements.mode.value !== S.getMode()) applyMode(S.getMode()); else renderSummary(); if (submitted) renderErrorSummary(); });

  /* ---------- Submit (demo) ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitted = true;
    const errs = collectErrors();
    if (errs.length) {
      renderErrorSummary(errs);
      errsum.focus({ preventScroll: true });
      errsum.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
      const btn = $("[data-submit]");
      if (!reduceMotion) { btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake"); }
      return;
    }
    errsum.hidden = true;
    const mode = form.elements.mode.value;
    const snapshot = {
      name: clean(form.elements.name.value),
      phone: clean(form.elements.phone.value),
      email: form.elements.email.value.trim(),
      mode,
      address: clean(form.elements.address.value),
      city: clean(form.elements.city.value),
      notes: clean(form.elements.notes.value),
      payment: form.elements.payment.value,
      lines: S.clone(cart.lines()),
      totals: S.totals(mode)
    };
    renderDone(snapshot);
    cart.clear();                       // demo order "completed": start fresh
    try { sessionStorage.removeItem(DRAFT); } catch (_) {}
  });

  function renderDone(o) {
    const PAY = { cod: "Плащане при получаване", onsite: "Плащане на място" };
    const row = (k, v) => v ? `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>` : "";
    $("[data-done-details]").innerHTML = `
      <section class="dcard">
        <h2 class="done__h mono">Контакт</h2>
        <dl>${row("Име", esc(o.name))}${row("Телефон", esc(o.phone))}${row("Имейл", esc(o.email))}</dl>
      </section>
      <section class="dcard">
        <h2 class="done__h mono">${o.mode === "delivery" ? "Доставка" : "Вземане от ресторанта"}</h2>
        <dl>${o.mode === "delivery"
          ? row("Адрес", esc(o.address)) + row("Град", esc(o.city)) + row("Инструкции", esc(o.notes)) + row("Очаквано време", esc(F.delivery.eta))
          : row("Адрес", esc(F.pickup.address)) + row("Очаквано време", esc(F.pickup.eta))}</dl>
      </section>
      <section class="dcard">
        <h2 class="done__h mono">Плащане</h2>
        <dl>${row("Начин", PAY[o.payment])}${row("Сума", money(o.totals.total))}</dl>
      </section>`;
    $("[data-done-lines]").innerHTML = linesHTML(o.lines, false);
    $("[data-done-sums]").innerHTML = sumsHTML(o.totals);
    show("done");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    views.done.focus({ preventScroll: true });
    document.title = "Демо поръчка — Mister Boom";
  }

  /* ---------- Init ---------- */
  applyMode(S.getMode());
  if (Object.keys(rules).some((k) => form.elements[k].value)) Object.keys(rules).forEach((k) => { if (form.elements[k].value) validate(k); });
})();
