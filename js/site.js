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
    const cssW = 180;
    const cssH = 100;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const startedAt = performance.now();
    const lean = 0.36;
    const frames = [
      { lt: -0.78, lk: 0.28, rt: 0.64, rk: 0.1, la: 0.72, ra: -0.64 },
      { lt: -0.18, lk: 1.08, rt: 0.22, rk: 0.2, la: 0.28, ra: -0.24 },
      { lt: 0.48, lk: 1.28, rt: -0.42, rk: 0.16, la: -0.42, ra: 0.46 },
      { lt: 0.64, lk: 0.1, rt: -0.78, rk: 0.28, la: -0.64, ra: 0.72 },
      { lt: 0.22, lk: 0.2, rt: -0.18, rk: 1.08, la: -0.24, ra: 0.28 },
      { lt: -0.42, lk: 0.16, rt: 0.48, rk: 1.28, la: 0.46, ra: -0.42 }
    ];

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function mix(a, b, t) {
      const out = {};
      Object.keys(a).forEach(function (key) {
        out[key] = lerp(a[key], b[key], t);
      });
      return out;
    }

    function polar(x, y, angle, len) {
      return [x + Math.sin(angle) * len, y + Math.cos(angle) * len];
    }

    function bone(x1, y1, x2, y2, width) {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function draw(now) {
      const t = (now - startedAt) / 1000;
      const cycle = reduceMotion ? 0.12 : (t * 2.5) % 1;
      const idx = cycle * frames.length;
      const i0 = Math.floor(idx) % frames.length;
      const i1 = (i0 + 1) % frames.length;
      const pose = mix(frames[i0], frames[i1], idx - Math.floor(idx));
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(0, 0, 0, .22)";
      ctx.fillRect(0, 0, cssW, cssH);

      const groundY = cssH - 12;
      const scroll = reduceMotion ? 0 : (t * 180) % 14;
      ctx.strokeStyle = "rgba(230,195,122,.55)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let x = -20; x < cssW + 20; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x - scroll, groundY);
        ctx.lineTo(x - scroll + 4, groundY);
        ctx.stroke();
      }

      if (!reduceMotion) {
        ctx.strokeStyle = "rgba(255,45,120,.28)";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 4; i += 1) {
          const y = 30 + i * 11;
          const ox = (t * 130 + i * 19) % 42;
          ctx.beginPath();
          ctx.moveTo(10 - ox, y);
          ctx.lineTo(40 - ox, y);
          ctx.stroke();
        }
      }

      const bounce = 4.2 * Math.abs(Math.cos(cycle * Math.PI * 2));
      ctx.save();
      ctx.translate(92, 46 + bounce);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#ff3d82";
      ctx.fillStyle = "#ff3d82";
      ctx.shadowColor = "rgba(255,45,120,.65)";
      ctx.shadowBlur = reduceMotion ? 0 : 7;

      const shoulder = polar(0, 0, Math.PI - lean, 24);
      const sx = shoulder[0];
      const sy = shoulder[1];

      function drawLeg(thigh, knee, width) {
        const thighA = lean + thigh;
        const kneePt = polar(0, 0, thighA, 21);
        const foot = polar(kneePt[0], kneePt[1], thighA + knee, 19);
        bone(0, 0, kneePt[0], kneePt[1], width);
        bone(kneePt[0], kneePt[1], foot[0], foot[1], width * 0.9);
        ctx.beginPath();
        ctx.ellipse(foot[0] + 5, foot[1] + 1.6, 7.2, 2.7, lean + 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawArm(swing, width) {
        const upperA = lean * 0.35 + swing;
        const elbow = polar(sx, sy, upperA, 14);
        const hand = polar(elbow[0], elbow[1], upperA + 1.3, 13);
        bone(sx, sy, elbow[0], elbow[1], width);
        bone(elbow[0], elbow[1], hand[0], hand[1], width * 0.86);
      }

      const leftBack = pose.lt < pose.rt;
      if (leftBack) {
        drawArm(pose.la, 4);
        drawLeg(pose.lt, pose.lk, 5.4);
      } else {
        drawArm(pose.ra, 4);
        drawLeg(pose.rt, pose.rk, 5.4);
      }

      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 3, 8.2, 5.8, lean, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#f0d48a";
      ctx.shadowColor = "rgba(240,212,138,.5)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy + 4);
      ctx.lineTo(9, 8);
      ctx.stroke();
      ctx.strokeStyle = "#ff3d82";
      ctx.fillStyle = "#ff3d82";
      ctx.shadowColor = "rgba(255,45,120,.65)";

      if (leftBack) {
        drawArm(pose.ra, 4.4);
        drawLeg(pose.rt, pose.rk, 5.8);
      } else {
        drawArm(pose.la, 4.4);
        drawLeg(pose.lt, pose.lk, 5.8);
      }

      const head = polar(sx, sy, Math.PI - lean, 9.5);
      ctx.beginPath();
      ctx.arc(head[0], head[1], 6.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
  }

  if (root) scheduleCountdown();
  startRunner();
})();
