/* Sand Desk ambient space: drifting star dust + occasional violet comets. */
(() => {
  const canvas = document.querySelector('[data-ambient-stars]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const stars = [];
  const comets = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let lastTime = 0;
  let nextCometAt = 0;
  let running = true;

  const random = (min, max) => min + Math.random() * (max - min);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const desired = Math.max(65, Math.min(190, Math.round((width * height) / 8500)));
    stars.length = 0;
    for (let i = 0; i < desired; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: random(.45, 1.45),
        alpha: random(.18, .76),
        phase: random(0, Math.PI * 2),
        twinkle: random(.45, 1.45),
        drift: random(.08, .34),
        hue: Math.random() < .24 ? 'violet' : 'white'
      });
    }
    comets.length = 0;
    nextCometAt = performance.now() + random(2600, 5200);
    drawStatic();
  }

  function drawStar(star, time, animate) {
    const shimmer = animate ? .72 + Math.sin(time * .001 * star.twinkle + star.phase) * .28 : 1;
    const alpha = Math.max(.08, Math.min(.92, star.alpha * shimmer));
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = star.hue === 'violet'
      ? `rgba(205,157,255,${alpha})`
      : `rgba(246,239,255,${alpha})`;
    ctx.shadowBlur = star.radius > 1.1 ? 8 : 4;
    ctx.shadowColor = star.hue === 'violet' ? 'rgba(175,91,255,.8)' : 'rgba(255,255,255,.55)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawComet(comet) {
    const tail = 95 + comet.speed * 13;
    const x2 = comet.x - comet.dx * tail;
    const y2 = comet.y - comet.dy * tail;
    const gradient = ctx.createLinearGradient(x2, y2, comet.x, comet.y);
    gradient.addColorStop(0, 'rgba(159,71,255,0)');
    gradient.addColorStop(.58, 'rgba(172,88,255,.18)');
    gradient.addColorStop(.9, 'rgba(222,181,255,.75)');
    gradient.addColorStop(1, 'rgba(255,255,255,.98)');
    ctx.save();
    ctx.lineWidth = comet.width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = gradient;
    ctx.shadowBlur = 13;
    ctx.shadowColor = 'rgba(167,75,255,.95)';
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(comet.x, comet.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,247,255,.96)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.width * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function spawnComet() {
    const fromTop = Math.random() < .35;
    const x = fromTop ? random(width * .18, width * .98) : random(-80, width * .72);
    const y = fromTop ? random(-100, height * .10) : random(-70, height * .46);
    const angle = random(.33, .62);
    const speed = random(4.4, 7.2);
    comets.push({
      x, y,
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      speed,
      width: random(1.1, 2.1),
      life: 0,
      maxLife: random(62, 105)
    });
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => drawStar(star, 0, false));
  }

  function frame(time) {
    if (!running) return;
    const dt = Math.min(2.2, (time - (lastTime || time)) / 16.67 || 1);
    lastTime = time;
    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      star.x += star.drift * dt * .22;
      star.y -= star.drift * dt * .11;
      if (star.x > width + 3) star.x = -3;
      if (star.y < -3) star.y = height + 3;
      drawStar(star, time, true);
    }

    if (time > nextCometAt && comets.length < 2) {
      spawnComet();
      nextCometAt = time + random(5200, 10500);
    }

    for (let i = comets.length - 1; i >= 0; i--) {
      const comet = comets[i];
      comet.x += comet.dx * comet.speed * dt;
      comet.y += comet.dy * comet.speed * dt;
      comet.life += dt;
      drawComet(comet);
      if (comet.life > comet.maxLife || comet.x > width + 220 || comet.y > height + 180) {
        comets.splice(i, 1);
      }
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduceMotion) {
      drawStatic();
      return;
    }
    if (!raf) {
      running = true;
      lastTime = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  resize();
  if (!reduceMotion) start();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  // On touch devices, keep the stars slower and the comet frequency lower.
  if (!finePointer) nextCometAt += 1800;
})();
