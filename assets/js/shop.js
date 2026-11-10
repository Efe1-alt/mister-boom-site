/* MISTER BOOM — shared shop core: money, product options, cart store, totals.
   Used by menu.js and checkout.js. Frontend only: the cart lives in this
   browser's localStorage and is never sent anywhere. */
window.MB_SHOP = (() => {
  const M = window.MB_MENU;
  if (!M) throw new Error("Липсва MB_MENU — зареден ли е menu-data.js?");

  /* ---------- Helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = new Intl.NumberFormat(M.locale || "bg-BG", { style: "currency", currency: M.currency || "EUR", minimumFractionDigits: 2 });
  const money = (c) => fmt.format(c / 100);
  const signed = (c) => (c > 0 ? "+" : "−") + fmt.format(Math.abs(c) / 100);
  const byId = Object.fromEntries(M.products.map((p) => [p.id, p]));
  const safeQty = (n) => { n = Math.floor(Number(n)); return Number.isFinite(n) ? Math.max(0, Math.min(99, n)) : 0; };
  const storage = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  };

  /* ---------- Product options ---------- */
  const groupCache = new Map();
  function groupsFor(p) {
    if (groupCache.has(p.id)) return groupCache.get(p.id);
    const groups = [];
    (p.options || []).forEach((o) => {
      const base = M.groups[o.group];
      if (!base) { console.warn(`Непозната група „${o.group}“ в ${p.id}`); return; }
      const { group, ...overrides } = o;
      groups.push({ key: group, ...base, ...overrides, options: base.options });
    });
    // ids are based on the ingredient's position, so any alphabet works for names
    const removable = (p.ingredients || []).map((i, n) => ({ ...i, rid: "r" + n })).filter((i) => i.removable);
    if (removable.length) {
      groups.push({
        key: "remove", label: "Без някои съставки", type: "multi", remove: true,
        max: removable.length, options: removable.map((i) => ({ id: i.rid, label: i.name, price: 0 }))
      });
    }
    groupCache.set(p.id, groups);
    return groups;
  }
  const optionOf = (g, id) => g.options.find((o) => o.id === id);

  function defaultSelection(p) {
    const sel = {};
    groupsFor(p).forEach((g) => {
      sel[g.key] = g.type === "single" ? (optionOf(g, g.default) ? g.default : g.options[0].id) : [];
    });
    return sel;
  }

  // The `included` most expensive picks in a multi group are free.
  function multiCost(g, ids) {
    const prices = ids.map((id) => optionOf(g, id)?.price || 0).sort((a, b) => b - a);
    return prices.slice(g.included || 0).reduce((a, b) => a + b, 0);
  }
  function freeIds(g, ids) {
    if (g.type !== "multi" || !g.included) return new Set();
    return new Set([...ids].sort((a, b) => optionOf(g, b).price - optionOf(g, a).price).slice(0, g.included));
  }

  function unitPrice(p, sel) {
    let total = p.price;
    groupsFor(p).forEach((g) => {
      const v = sel[g.key];
      total += g.type === "single" ? (optionOf(g, v)?.price || 0) : multiCost(g, v || []);
    });
    return Math.max(0, total);
  }

  function summaryParts(p, sel) {
    const parts = [];
    groupsFor(p).forEach((g) => {
      const v = sel[g.key];
      if (g.type === "single") { const o = optionOf(g, v); if (o) parts.push(o.label); }
      else if (v && v.length) {
        const labels = v.map((id) => optionOf(g, id)?.label).filter(Boolean);
        if (g.remove) parts.push("Без " + labels.map((l) => l.charAt(0).toLowerCase() + l.slice(1)).join(", без "));
        else parts.push(...labels);
      }
    });
    return parts;
  }

  // Validate a selection against current data (the menu may have changed)
  function sanitize(p, sel) {
    const clean = defaultSelection(p);
    groupsFor(p).forEach((g) => {
      const v = sel?.[g.key];
      if (g.type === "single") { if (optionOf(g, v)) clean[g.key] = v; }
      else if (Array.isArray(v)) clean[g.key] = [...new Set(v)].filter((id) => optionOf(g, id)).slice(0, g.max || Infinity);
    });
    return clean;
  }

  const lineKey = (id, sel) => id + "|" + Object.keys(sel).sort().map((k) => k + ":" + [].concat(sel[k]).sort().join(",")).join(";");
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function mediaHTML(p, cls = "") {
    if (p.image) return `<img class="${cls}${p.light ? " img--light" : ""}" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" />`;
    return `<div class="swatch ${cls}" style="--sw:${esc(p.swatch || "#191919")};--ink:${esc(p.ink || "#F5F5F5")}">
      <svg aria-hidden="true"><use href="#burst" /></svg><span>${esc(p.name)}</span></div>`;
  }

  /* ---------- Cart store ---------- */
  const STORE = "mb-cart-v1";
  const MODE = "mb-fulfilment-v1";
  const listeners = new Set();
  let lines = load();

  function load() {
    try {
      const raw = JSON.parse(storage.get(STORE) || "[]");
      if (!Array.isArray(raw)) return [];
      const merged = [];
      raw.forEach((l) => {
        const p = byId[l?.id]; const qty = safeQty(l?.qty);
        if (!p || qty < 1) return;
        const sel = sanitize(p, l.sel);
        const key = lineKey(p.id, sel);
        const ex = merged.find((m) => m.key === key);
        if (ex) ex.qty = safeQty(ex.qty + qty); else merged.push({ id: p.id, sel, qty, key });
      });
      return merged;
    } catch (_) { return []; }
  }
  function commit() {
    storage.set(STORE, JSON.stringify(lines.map(({ id, sel, qty }) => ({ id, sel, qty }))));
    listeners.forEach((fn) => fn());
  }

  const cart = {
    lines: () => lines,
    find: (key) => lines.find((l) => l.key === key),
    count: () => lines.reduce((a, l) => a + l.qty, 0),
    unit: (l) => unitPrice(byId[l.id], l.sel),
    lineTotal: (l) => unitPrice(byId[l.id], l.sel) * l.qty,
    subtotal: () => lines.reduce((a, l) => a + unitPrice(byId[l.id], l.sel) * l.qty, 0),
    add(id, sel, qty = 1) {
      const p = byId[id]; qty = safeQty(qty); if (!p || qty < 1) return;
      const clean = sanitize(p, sel); const key = lineKey(id, clean);
      const ex = lines.find((l) => l.key === key);
      if (ex) ex.qty = safeQty(ex.qty + qty); else lines.push({ id, sel: clone(clean), qty, key });
      commit();
    },
    setQty(key, qty) {
      const l = lines.find((x) => x.key === key); if (!l) return;
      qty = safeQty(qty);
      if (qty < 1) lines = lines.filter((x) => x !== l); else l.qty = qty;
      commit();
    },
    change(key, delta) { const l = lines.find((x) => x.key === key); if (l) cart.setQty(key, l.qty + delta); },
    remove(key) { lines = lines.filter((l) => l.key !== key); commit(); },
    replace(key, sel, qty) {
      const l = lines.find((x) => x.key === key); if (!l) return;
      const p = byId[l.id]; const clean = sanitize(p, sel); const newKey = lineKey(l.id, clean);
      qty = Math.max(1, safeQty(qty));
      const clash = lines.find((x) => x.key === newKey && x !== l);
      if (clash) { clash.qty = safeQty(clash.qty + qty); lines = lines.filter((x) => x !== l); }
      else Object.assign(l, { sel: clone(clean), qty, key: newKey });
      commit();
    },
    clear() { lines = []; commit(); },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };

  // keep several open tabs in sync
  window.addEventListener("storage", (e) => {
    if (e.key === STORE) { lines = load(); listeners.forEach((fn) => fn()); }
    if (e.key === MODE) listeners.forEach((fn) => fn());
  });

  /* ---------- Fulfilment + totals ---------- */
  const F = M.fulfilment || { delivery: { label: "Доставка", fee: null }, pickup: { label: "Вземане", fee: 0 } };
  // the pickup address always comes from the central business data
  if (window.MB_BUSINESS?.address?.full && F.pickup) F.pickup.address = window.MB_BUSINESS.address.full;
  const getMode = () => (storage.get(MODE) === "pickup" ? "pickup" : "delivery");
  const setMode = (m) => { storage.set(MODE, m === "pickup" ? "pickup" : "delivery"); listeners.forEach((fn) => fn()); };

  function totals(mode = getMode()) {
    const subtotal = cart.subtotal();
    const cfg = F[mode] || {};
    let fee = mode === "delivery" ? cfg.fee : 0;
    const feeUnknown = fee == null;          // not provided by the restaurant yet
    if (feeUnknown) fee = 0;
    const freeFrom = mode === "delivery" ? cfg.freeFrom ?? null : null;
    if (freeFrom != null && subtotal >= freeFrom) fee = 0;
    const minOrder = mode === "delivery" ? cfg.minOrder || 0 : 0;
    return {
      mode, subtotal, fee, feeUnknown, total: subtotal + (subtotal > 0 ? fee : 0),
      freeFrom, toFree: freeFrom != null ? Math.max(0, freeFrom - subtotal) : null,
      minOrder, belowMin: subtotal > 0 && subtotal < minOrder, toMin: Math.max(0, minOrder - subtotal)
    };
  }

  // shared labels for the delivery line
  const feeText = (t) => t.mode === "pickup" ? "Безплатно" : t.feeUnknown ? "Уточнява се" : t.fee === 0 ? "Безплатна" : money(t.fee);
  const totalLabel = (t) => t.mode === "delivery" && t.feeUnknown ? "Общо без доставка" : "Общо";

  return {
    M, F, esc, feeText, totalLabel, money, signed, byId, safeQty, storage,
    groupsFor, optionOf, defaultSelection, freeIds, unitPrice, summaryParts, sanitize, lineKey, clone, mediaHTML,
    cart, getMode, setMode, totals
  };
})();
