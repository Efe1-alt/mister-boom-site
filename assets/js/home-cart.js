/* MISTER BOOM — homepage quick add.
   Uses the shared cart in shop.js (same storage as menu.html and checkout.html).
   Buttons: <button data-add="product-id">…<span class="qadd__label">…</span></button> */
(() => {
  const S = window.MB_SHOP;
  if (!S) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counts = document.querySelectorAll("[data-cart-count]");
  const cartBtns = document.querySelectorAll(".cart-btn");

  function render(bump) {
    const n = S.cart.count();
    counts.forEach((el) => {
      el.textContent = n;
      if (bump && !reduceMotion) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    cartBtns.forEach((b) => {
      b.classList.toggle("has-items", n > 0);
      b.setAttribute("aria-label", n ? `Количка: ${n} ${n === 1 ? "продукт" : "продукта"}, виж поръчката` : "Количка: празна");
      if (bump && !reduceMotion) { b.classList.remove("is-pulse"); void b.offsetWidth; b.classList.add("is-pulse"); }
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const p = S.byId[btn.dataset.add];
    if (!p) return;
    S.cart.add(p.id, S.defaultSelection(p), 1);
    render(true);

    // brief confirmation on the button itself (no popups)
    const label = btn.querySelector(".qadd__label");
    if (label && !btn.dataset.label) btn.dataset.label = label.textContent;
    btn.classList.add("is-done");
    if (label) label.textContent = "✓ Добавено";
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      btn.classList.remove("is-done");
      if (label) label.textContent = btn.dataset.label;
    }, 1200);
  });

  S.cart.onChange(() => render(false));   // other tabs / pages
  render(false);
})();
