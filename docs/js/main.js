/* main.js — Orquestador principal y lógica del cuestionario AQ-10 */

import { loadMetrics, getDatasetStats } from "./data-loader.js";
import { renderFeatureImportance, renderConfusionMatrix, renderFullMetricsTable, renderHeadlineSummary, GROUP_LABELS } from "./charts.js";
import { initScrollReveal, animateCounters } from "./animations.js";

// Preguntas del cuestionario AQ-10 por grupo de edad
// adults y adolescents comparten el mismo cuestionario AQ-10 (misma fuente UCI)
// children usa una adaptación del AQ-10, toddlers usa el Q-CHAT-10
const QUESTIONS = {
  adults: [
    "Frecuentemente noto pequeños sonidos que otras personas no perciben.",
    "Suelo concentrarme más en el panorama general que en los pequeños detalles.",
    "Me resulta fácil hacer más de una cosa a la vez.",
    "Si hay una interrupción, puedo volver a lo que estaba haciendo rápidamente.",
    "Me resulta fácil leer entre líneas cuando alguien me habla.",
    "Sé cuando alguien que habla conmigo se aburre o pierde interés.",
    "Cuando leo una historia, me cuesta imaginar cómo se ven los personajes.",
    "Me resulta fácil averiguar las intenciones y sentimientos de las personas.",
    "Me resulta fácil imaginar cómo sería estar en la situación de otra persona.",
    "Me resulta difícil hacer nuevas amistades."
  ],
  adolescents: [
    "Frecuentemente noto pequeños sonidos que otras personas no perciben.",
    "Suelo concentrarme más en el panorama general que en los pequeños detalles.",
    "Me resulta fácil hacer más de una cosa a la vez.",
    "Si hay una interrupción, puedo volver a lo que estaba haciendo rápidamente.",
    "Me resulta fácil leer entre líneas cuando alguien me habla.",
    "Sé cuando alguien que habla conmigo se aburre o pierde interés.",
    "Cuando leo una historia, me cuesta imaginar cómo se ven los personajes.",
    "Me resulta fácil averiguar las intenciones y sentimientos de las personas.",
    "Me resulta fácil imaginar cómo sería estar en la situación de otra persona.",
    "Me resulta difícil hacer nuevas amistades."
  ],
  children: [
    "Nota sonidos que otros no perciben.",
    "Se concentra más en el panorama general que en los detalles.",
    "Puede hacer varias cosas a la vez fácilmente.",
    "Vuelve a su actividad rápidamente tras una interrupción.",
    "Entiende cuando alguien le habla con doble sentido.",
    "Se da cuenta cuando alguien se aburre hablando con él/ella.",
    "Le cuesta imaginar cómo son los personajes de un cuento.",
    "Entiende fácilmente cómo se sienten los demás.",
    "Se pone fácilmente en el lugar de otra persona.",
    "Le cuesta hacer nuevos amigos."
  ],
  toddlers: [
    "Mira cuando le señalan algo.",
    "Cree que su hijo/a es sordo/a.",
    "Hace juego imaginativo (fingir cosas).",
    "Le gusta subirse a las cosas (muebles, columpios).",
    "Hace movimientos inusuales con los dedos cerca de los ojos.",
    "Señala con el dedo para pedir algo.",
    "Señala con el dedo para mostrar interés en algo.",
    "Se interesa por otros niños de su edad.",
    "Le trae objetos para mostrarle algo.",
    "Responde cuando le llaman por su nombre."
  ]
};

// Las preguntas donde "De acuerdo" puntua 1 (el resto puntua al reves)
const SCORING_DIRECT = {
  adults: [0, 6, 9],
  adolescents: [0, 6, 9],
  children: [0, 6, 9],
  toddlers: [1, 4]
};

// Umbral de cribado por grupo (sobre 10)
const THRESHOLDS = {
  adults: 6,
  adolescents: 6,
  children: 6,
  toddlers: 4
};

let currentGroup = "adults";
let currentQuestion = 0;
let answers = new Array(10).fill(null);

function initQuestionnaire() {
  // Botones de grupo de edad
  document.querySelectorAll(".age-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentGroup = btn.dataset.group;
      document.querySelectorAll(".age-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      resetQuestionnaire();
    });
  });

  renderQuestion();

  // Botón anterior
  document.getElementById("btn-prev").addEventListener("click", () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestion();
    }
  });

  // Botón siguiente
  document.getElementById("btn-next").addEventListener("click", () => {
    if (currentQuestion < 9) {
      currentQuestion++;
      renderQuestion();
    }
  });

  // Botón ver resultado
  document.getElementById("btn-result").addEventListener("click", showResult);

  // Botón reiniciar
  document.getElementById("btn-reset").addEventListener("click", resetQuestionnaire);
}

function renderQuestion() {
  const container = document.getElementById("questions-container");
  const questions = QUESTIONS[currentGroup];
  const progress = ((currentQuestion + 1) / 10) * 100;

  document.querySelector(".progress-fill").style.width = progress + "%";

  container.innerHTML = `
    <div class="question active">
      <div class="question-number">Pregunta ${currentQuestion + 1} de 10</div>
      <div class="question-text">${questions[currentQuestion]}</div>
      <div class="answer-options">
        <button class="answer-btn ${answers[currentQuestion] === 1 ? 'selected' : ''}"
                onclick="selectAnswer(1)">De acuerdo</button>
        <button class="answer-btn ${answers[currentQuestion] === 0 ? 'selected' : ''}"
                onclick="selectAnswer(0)">En desacuerdo</button>
      </div>
    </div>
  `;

  // Mostrar/ocultar botones de navegación
  document.getElementById("btn-prev").disabled = currentQuestion === 0;

  const allAnswered = answers.every(a => a !== null);
  document.getElementById("btn-next").style.display = currentQuestion < 9 ? "" : "none";
  const btnResult = document.getElementById("btn-result");
  btnResult.style.display = currentQuestion === 9 ? "" : "none";
  btnResult.disabled = !allAnswered;
  btnResult.title = allAnswered ? "" : "Responde todas las preguntas para ver el resultado";
}

// Función global para los botones de respuesta
window.selectAnswer = function(value) {
  answers[currentQuestion] = value;
  renderQuestion();

  // Avanzar automáticamente si no es la última
  if (currentQuestion < 9) {
    setTimeout(() => {
      currentQuestion++;
      renderQuestion();
    }, 300);
  }
};

function calculateScore() {
  const directItems = SCORING_DIRECT[currentGroup] || [];
  let score = 0;

  for (let i = 0; i < 10; i++) {
    if (answers[i] === null) continue;

    if (directItems.includes(i)) {
      score += answers[i];
    } else {
      score += 1 - answers[i];
    }
  }

  return score;
}

function showResult() {
  const score = calculateScore();
  const threshold = THRESHOLDS[currentGroup] ?? 6;
  const isHighRisk = score >= threshold;

  document.getElementById("questionnaire-form").style.display = "none";

  const panel = document.getElementById("result-panel");
  panel.classList.add("visible");

  document.getElementById("result-score-value").textContent = score + "/10";
  document.getElementById("result-score-value").className =
    "result-score " + (isHighRisk ? "risk-high" : "risk-low");

  document.getElementById("result-label").textContent =
    isHighRisk
      ? "Resultado: se recomienda derivación a evaluación especializada"
      : "Resultado: no se detectan indicadores significativos de TEA";

  document.getElementById("result-detail").textContent =
    isHighRisk
      ? `La puntuación obtenida (${score}/10) está por encima del umbral de cribado (${threshold}/10). Esto NO es un diagnóstico, sino una indicación de que sería conveniente realizar una evaluación clínica más detallada con un profesional especializado.`
      : `La puntuación obtenida (${score}/10) está por debajo del umbral de cribado (${threshold}/10). Esto sugiere que no hay indicadores significativos de TEA en las respuestas. Si persisten preocupaciones, consulte con un profesional.`;
}

function resetQuestionnaire() {
  currentQuestion = 0;
  answers = new Array(10).fill(null);

  document.getElementById("questionnaire-form").style.display = "block";
  document.getElementById("result-panel").classList.remove("visible");

  renderQuestion();
}

// Estado del selector de grupo en la seccion "Los datos" (importancia + matriz)
let currentDataGroup = "combined";
let loadedMetrics = null;

function renderGroupData(groupKey) {
  if (!loadedMetrics || !loadedMetrics.groups[groupKey]) return;

  const group = loadedMetrics.groups[groupKey];
  const bestModel = group.models.find(m => m.name === group.best_model)
    || group.models[group.models.length - 1];

  renderFeatureImportance("feature-importance", group.feature_importance);
  renderConfusionMatrix("confusion-matrix", bestModel.confusion_matrix);

  const label = document.getElementById("data-group-label");
  if (label) {
    label.textContent = `${GROUP_LABELS[groupKey] || groupKey} · modelo ${group.best_model} · n test = ${group.n_test}`;
  }
}

function initGroupSelector() {
  document.querySelectorAll(".data-group-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentDataGroup = btn.dataset.group;
      document.querySelectorAll(".data-group-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderGroupData(currentDataGroup);
    });
  });
}

/* ============================================
   ANALISIS TECNICO: pestanas + lightbox con navegacion
   ============================================ */

let lightboxImages = [];
let lightboxIndex = 0;

function initAnalysisTabs() {
  const tabs = document.querySelectorAll(".analysis-tab-btn");
  const panels = document.querySelectorAll(".analysis-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      panels.forEach(panel => {
        panel.style.display = panel.dataset.panel === target ? "" : "none";
      });
    });
  });
}

function collectPanelImages(panelEl) {
  return Array.from(panelEl.querySelectorAll(".analysis-thumb")).map(btn => ({
    src: btn.dataset.src,
    caption: btn.dataset.caption || ""
  }));
}

function openLightbox(panelEl, clickedIndex) {
  lightboxImages = collectPanelImages(panelEl);
  lightboxIndex = clickedIndex;
  renderLightboxImage();

  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
}

function renderLightboxImage() {
  const item = lightboxImages[lightboxIndex];
  if (!item) return;

  const img = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");

  img.src = item.src;
  img.alt = item.caption;
  caption.textContent = `${item.caption}  ·  ${lightboxIndex + 1} / ${lightboxImages.length}`;
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  renderLightboxImage();
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  renderLightboxImage();
}

function initLightbox() {
  document.querySelectorAll(".analysis-thumb").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".analysis-panel");
      const allThumbs = Array.from(panel.querySelectorAll(".analysis-thumb"));
      const idx = allThumbs.indexOf(btn);
      openLightbox(panel, idx);
    });
  });

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-next").addEventListener("click", lightboxNext);
  document.getElementById("lightbox-prev").addEventListener("click", lightboxPrev);

  // Cerrar al hacer clic fuera de la imagen (en el fondo oscuro)
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });

  // Navegacion con teclado: flechas y Escape
  document.addEventListener("keydown", (e) => {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox.classList.contains("open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") lightboxNext();
    if (e.key === "ArrowLeft") lightboxPrev();
  });
}

// Inicialización general
async function init() {
  // Cargar métricas reales del modelo (metrics.json, o dummy si aún no existe)
  loadedMetrics = await loadMetrics();

  // Resumen destacado (cifra titular + nota de robustez)
  renderHeadlineSummary("headline-summary", loadedMetrics.overall);

  // Stat card del hero: mismo recall titular que el resumen destacado
  const heroStat = document.getElementById("hero-recall-stat");
  if (heroStat) {
    heroStat.textContent = Math.round(loadedMetrics.overall.recall * 100) + "%";
  }

  // Tabla completa: las 4 franjas de edad x los 4 modelos
  renderFullMetricsTable("metrics-table", loadedMetrics.groups);

  // Importancia de variables y matriz de confusión del grupo seleccionado
  // (por defecto, "combined", el más robusto estadísticamente)
  initGroupSelector();
  renderGroupData(currentDataGroup);

  // Inicializar cuestionario interactivo
  initQuestionnaire();

  // Inicializar pestañas de análisis y el lightbox
  initAnalysisTabs();
  initLightbox();

  // Inicializar animaciones
  initScrollReveal();
  animateCounters();
}

document.addEventListener("DOMContentLoaded", init);
