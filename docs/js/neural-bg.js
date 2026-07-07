/* neural-bg.js — Fondo animado de red neuronal en el hero, reactivo al raton */

function initNeuralBackground() {
  const canvas = document.getElementById("neural-bg");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;

  let width, height;
  let points = [];
  let mouse = { x: null, y: null };

  const NUM_POINTS = 42;
  const MAX_DIST = 130;
  const MOUSE_RADIUS = 160;

  function resize() {
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function createPoints() {
    points = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // Mover puntos y rebotar en los bordes
    points.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    // Lineas entre puntos cercanos
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.55;
          ctx.strokeStyle = `rgba(43, 94, 92, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }

      // Linea hacia el raton si esta cerca (efecto reactivo)
      if (mouse.x !== null) {
        const dx = points[i].x - mouse.x;
        const dy = points[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const opacity = (1 - dist / MOUSE_RADIUS) * 0.5;
          ctx.strokeStyle = `rgba(232, 168, 56, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // Puntos
    points.forEach(p => {
      ctx.fillStyle = "rgba(43, 94, 92, 0.75)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!prefersReducedMotion) {
      requestAnimationFrame(step);
    }
  }

  resize();
  createPoints();

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("resize", () => {
    resize();
    createPoints();
  });

  if (prefersReducedMotion) {
    // Si el usuario prefiere menos movimiento, dibujamos un fotograma
    // estatico (los puntos y lineas iniciales) y no seguimos animando
    step();
  } else {
    requestAnimationFrame(step);
  }
}

export { initNeuralBackground };
