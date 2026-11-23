// El fondo espacial animado se inicializa en ambient.js.
const video=document.getElementById('planetVideo');video.addEventListener('canplay',()=>video.classList.add('ready'));video.play().catch(()=>{});

// Animación de demostración del dashboard. Los valores son ficticios y solo ilustran la interfaz.
(() => {
  const dashboard = document.querySelector('.dashboard-wrap');
  if (!dashboard) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = [...dashboard.querySelectorAll('[data-counter]')];
  const moneyCounter = dashboard.querySelector('.revenue-counter');
  const statCards = [...dashboard.querySelectorAll('.stat')];
  const chart = dashboard.querySelector('.chart-area svg');
  const bars = [...dashboard.querySelectorAll('.mini-bars .bar')];
  let liveInterval = null;
  let hasStarted = false;

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return `${Math.round(value).toLocaleString('es-ES')} €`;
    }
    if (format === 'days') {
      return `${value.toLocaleString('es-ES', {minimumFractionDigits: 1, maximumFractionDigits: 1})} días`;
    }
    return Math.round(value).toLocaleString('es-ES');
  };

  const animateCounter = (el, from, to, duration, keepShaking = false) => {
    const format = el.dataset.format || 'integer';
    const startTime = performance.now();
    el.classList.remove('counter-settled');
    if (el === moneyCounter) el.classList.add('is-counting');

    const frame = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      el.textContent = formatValue(current, format);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatValue(to, format);
        if (el === moneyCounter) {
          el.classList.remove('is-counting');
          el.classList.add('counter-settled');
        }
      }
    };
    requestAnimationFrame(frame);
  };

  const startChartAndBars = () => {
    if (chart) {
      // Calcula la longitud real de la línea para que el trazo se dibuje suavemente.
      const line = chart.querySelector('.chart-line');
      if (line && typeof line.getTotalLength === 'function') {
        const length = line.getTotalLength();
        line.style.strokeDasharray = `${length}`;
        line.style.strokeDashoffset = `${length}`;
      }
      requestAnimationFrame(() => chart.classList.add('chart-ready'));
    }

    bars.forEach((bar, index) => {
      const target = bar.style.height || '70%';
      bar.dataset.targetHeight = target;
      bar.style.height = '5%';
      bar.classList.remove('bar-ready');
      setTimeout(() => {
        bar.style.height = target;
        bar.classList.add('bar-ready');
      }, 140 + index * 95);
    });
  };

  const initialCountUp = () => {
    counters.forEach((el) => {
      const target = Number(el.dataset.value);
      const start = Number(el.dataset.start || 0);
      animateCounter(el, start, target, el === moneyCounter ? 2450 : 2100);
    });
  };

  const updateLiveValue = (el, newTarget, duration = 620) => {
    const format = el.dataset.format || 'integer';
    const currentText = el.textContent.trim();
    let current;
    if (format === 'currency') {
      current = Number(currentText.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.')) || Number(el.dataset.value);
    } else if (format === 'days') {
      current = Number(currentText.replace(/[^\d,.-]/g, '').replace(',', '.')) || Number(el.dataset.value);
    } else {
      current = Number(currentText.replace(/[^\d-]/g, '')) || Number(el.dataset.value);
    }

    el.classList.remove('is-ticking');
    void el.offsetWidth;
    el.classList.add('is-ticking');
    const card = el.closest('.stat');
    if (card) {
      card.classList.add('is-updating');
      setTimeout(() => card.classList.remove('is-updating'), 520);
    }
    animateCounter(el, current, newTarget, duration);
  };

  const startLiveSimulation = () => {
    if (liveInterval || reducedMotion) return;
    liveInterval = setInterval(() => {
      if (document.hidden) return;

      // Pequeñas variaciones para transmitir actividad, sin saltos exagerados.
      const moneyNow = Number(moneyCounter.textContent.replace(/[^\d]/g, '')) || 8420;
      const moneyDrift = Math.random() < 0.57 ? 1 : -1;
      const nextMoney = Math.max(8350, Math.min(8510, moneyNow + moneyDrift * (2 + Math.round(Math.random() * 9))));
      updateLiveValue(moneyCounter, nextMoney, 540);

      const repairsEl = counters.find(el => el.dataset.format === 'integer');
      const currentRepairs = Number(repairsEl.textContent.replace(/[^\d]/g, '')) || 48;
      const nextRepairs = Math.max(45, Math.min(51, currentRepairs + (Math.random() < .52 ? 1 : -1)));
      updateLiveValue(repairsEl, nextRepairs, 480);

      const daysEl = counters.find(el => el.dataset.format === 'days');
      const nextDays = [1.7, 1.8, 1.9, 2.0][Math.floor(Math.random() * 4)];
      updateLiveValue(daysEl, nextDays, 520);
    }, 3100);
  };

  const start = () => {
    if (hasStarted) return;
    hasStarted = true;

    if (reducedMotion) {
      counters.forEach(el => {
        el.textContent = formatValue(Number(el.dataset.value), el.dataset.format);
      });
      startChartAndBars();
      return;
    }

    startChartAndBars();
    initialCountUp();
    setTimeout(startLiveSimulation, 2750);
  };

  // Comienza al entrar en pantalla, para que el usuario vea los números crecer al llegar al panel.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        start();
        observer.disconnect();
      }
    }, {threshold: 0.18});
    observer.observe(dashboard);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasStarted && !reducedMotion && !liveInterval) startLiveSimulation();
  });
})();


// Efecto 3D del dashboard: inclinación suave según la posición del cursor.
(() => {
  const surface = document.querySelector('.dashboard-wrap .dashboard');
  const frame = document.querySelector('.dashboard-wrap');
  if (!surface || !frame) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion || !finePointer || window.innerWidth <= 900) return;

  let raf = 0;
  let lastX = 0;
  let lastY = 0;

  const update = () => {
    raf = 0;
    const rect = surface.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (lastX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (lastY - rect.top) / rect.height));
    const rotateY = (px - .5) * 5.2;
    const rotateX = (.5 - py) * 3.6;
    surface.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
    surface.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
    surface.style.setProperty('--shine-x', `${(px * 100).toFixed(1)}%`);
    surface.style.setProperty('--shine-y', `${(py * 100).toFixed(1)}%`);
    surface.classList.add('is-tilting');
  };

  frame.addEventListener('pointermove', (event) => {
    lastX = event.clientX;
    lastY = event.clientY;
    if (!raf) raf = requestAnimationFrame(update);
  }, {passive:true});

  frame.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    surface.style.setProperty('--tilt-x', '0deg');
    surface.style.setProperty('--tilt-y', '0deg');
    surface.style.setProperty('--shine-x', '50%');
    surface.style.setProperty('--shine-y', '0%');
    surface.classList.remove('is-tilting');
  }, {passive:true});
})();

