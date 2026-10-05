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
