(function () {
  const TARGET = new Date("2026-10-12T09:10:00+09:00");
  const root = document.getElementById("countdown");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function renderCountdown() {
    if (!root) return;
    const diff = TARGET.getTime() - Date.now();
    if (diff <= 0) {
      root.classList.add("is-live");
      root.innerHTML =
        '<div class="unit"><span class="num">00</span><span class="u">日</span></div>' +
        '<span class="colon">:</span>' +
        '<div class="unit"><span class="num">00</span><span class="u">時</span></div>' +
        '<span class="colon">:</span>' +
        '<div class="unit"><span class="num">00</span><span class="u">分</span></div>' +
        '<span class="colon">:</span>' +
        '<div class="unit"><span class="num">00</span><span class="u">秒</span></div>';
      root.setAttribute("aria-label", "出雲駅伝はスタート済みです");
      return;
    }
    const total = Math.floor(diff / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    root.innerHTML =
      '<div class="unit"><span class="num">' + pad(days) + '</span><span class="u">日</span></div>' +
      '<span class="colon">:</span>' +
      '<div class="unit"><span class="num">' + pad(hours) + '</span><span class="u">時</span></div>' +
      '<span class="colon">:</span>' +
      '<div class="unit"><span class="num">' + pad(mins) + '</span><span class="u">分</span></div>' +
      '<span class="colon">:</span>' +
      '<div class="unit"><span class="num">' + pad(secs) + '</span><span class="u">秒</span></div>';
    root.setAttribute(
      "aria-label",
      "出雲駅伝まであと" + days + "日" + hours + "時間" + mins + "分" + secs + "秒"
    );
  }

  function scheduleCountdown() {
    renderCountdown();
    const wait = 1000 - (Date.now() % 1000);
    window.setTimeout(scheduleCountdown, wait);
  }

  if (root) scheduleCountdown();
})();

(function () {
  const slots = Array.from(document.querySelectorAll("[data-runner-slot]"));
  if (!slots.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const FRAME_MS = 250;
  const start = performance.now();

  function frame(now) {
    const t = now - start;
    const on = Math.floor(t / FRAME_MS) % 2;
    const ground = (t * 0.08) % 36;

    slots.forEach(function (slot) {
      const imgs = slot.querySelectorAll("[data-body] img");
      const road = slot.querySelector("[data-ground]");
      imgs.forEach(function (img, i) {
        img.classList.toggle("is-on", i === on);
      });
      if (road) {
        road.style.backgroundPosition = (-ground) + "px 0";
      }
    });
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();

(function () {
  const hero = document.querySelector(".hero");
  const ripple = document.querySelector("[data-hero-ripple]");
  if (!hero || !ripple) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const inner = ripple.querySelector(".hero__photo--warp");
  if (!inner) return;

  let x = 0;
  let y = 0;
  let fromX = 0;
  let fromY = 0;
  let toX = 0;
  let toY = 0;
  let t0 = 0;
  let dur = 5000;

  function scene() {
    return {
      w: hero.clientWidth,
      h: hero.clientHeight,
      rw: ripple.offsetWidth,
      rh: ripple.offsetHeight
    };
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickTarget(s) {
    const padX = s.rw * 0.35;
    const padY = s.rh * 0.35;
    return {
      x: randBetween(padX, Math.max(padX + 1, s.w - padX)),
      y: randBetween(padY, Math.max(padY + 1, s.h - padY))
    };
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function place(px, py) {
    const s = scene();
    const left = px - s.rw / 2;
    const top = py - s.rh / 2;
    ripple.style.transform = "translate(" + left + "px," + top + "px)";
    inner.style.width = s.w + "px";
    inner.style.height = s.h + "px";
    inner.style.left = -left + "px";
    inner.style.top = -top + "px";
    inner.style.transformOrigin = s.rw / 2 + "px " + s.rh / 2 + "px";
    inner.style.transform = "scale(1.16)";
  }

  function retarget(now) {
    fromX = x;
    fromY = y;
    const next = pickTarget(scene());
    toX = next.x;
    toY = next.y;
    t0 = now;
    dur = randBetween(4200, 9000);
  }

  const first = pickTarget(scene());
  x = first.x;
  y = first.y;
  place(x, y);
  retarget(performance.now());

  function frame(now) {
    let t = (now - t0) / dur;
    if (t >= 1) {
      x = toX;
      y = toY;
      retarget(now);
      t = 0;
    }
    const e = easeInOut(Math.max(0, Math.min(1, t)));
    x = fromX + (toX - fromX) * e;
    y = fromY + (toY - fromY) * e;
    const wobbleX = Math.sin(now / 780) * 10;
    const wobbleY = Math.cos(now / 1010) * 8;
    place(x + wobbleX, y + wobbleY);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () {
    const s = scene();
    x = Math.min(Math.max(x, s.rw * 0.3), s.w - s.rw * 0.3);
    y = Math.min(Math.max(y, s.rh * 0.3), s.h - s.rh * 0.3);
    toX = Math.min(Math.max(toX, s.rw * 0.3), s.w - s.rw * 0.3);
    toY = Math.min(Math.max(toY, s.rh * 0.3), s.h - s.rh * 0.3);
    place(x, y);
  });

  requestAnimationFrame(frame);
})();
