(function () {
  const TARGET = new Date("2026-10-12T09:10:00+09:00");
  const root = document.getElementById("countdown");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  function startRunner() {
    const canvas = document.getElementById("runner");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const cssW = 150;
    const cssH = 84;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const startedAt = performance.now();

    function draw(now) {
      const t = (now - startedAt) / 1000;
      const stride = reduceMotion ? 0.6 : t * 9.4;
      ctx.clearRect(0, 0, cssW, cssH);

      const offset = reduceMotion ? 0 : (t * 90) % 20;
      ctx.strokeStyle = "rgba(230,195,122,.4)";
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      for (let x = -24; x < cssW + 24; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x - offset, cssH - 12);
        ctx.lineTo(x - offset + 5, cssH - 12);
        ctx.stroke();
      }

      const bounce = reduceMotion ? 0 : Math.sin(stride) * 2.4;
      const a = Math.sin(stride);
      const b = Math.cos(stride);

      ctx.save();
      ctx.translate(78, 40 + bounce);
      ctx.rotate(0.2);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#ff2d78";
      ctx.fillStyle = "#ff2d78";
      ctx.shadowColor = "rgba(255,45,120,.8)";
      ctx.shadowBlur = reduceMotion ? 0 : 14;
      ctx.lineWidth = 3.1;

      ctx.beginPath();
      ctx.arc(2, -22, 6.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(1, -15);
      ctx.lineTo(-3, 10);
      ctx.stroke();

      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(-10 + b * 9, 2);
      ctx.lineTo(-6 + b * 13, 14);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(12 - b * 8, -4);
      ctx.lineTo(18 - b * 6, 6);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-3, 10);
      ctx.lineTo(-8 + a * 9, 24);
      ctx.lineTo(-2 + a * 15, 38);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-3, 10);
      ctx.lineTo(10 - a * 9, 22);
      ctx.lineTo(16 - a * 11, 36);
      ctx.stroke();

      ctx.restore();
      window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
  }

  if (root) scheduleCountdown();
  startRunner();
})();
