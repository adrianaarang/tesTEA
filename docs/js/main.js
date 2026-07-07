/* main.js — Orquestador principal y lógica del cuestionario AQ-10 */

import { loadMetrics, getDatasetStats } from "./data-loader.js";
import { renderFeatureImportance, renderConfusionMatrix, renderFullMetricsTable, renderHeadlineSummary, GROUP_LABELS } from "./charts.js";
import { initScrollReveal, animateCounters } from "./animations.js";
import { initNeuralBackground } from "./neural-bg.js";
import { initThresholdSimulator } from "./threshold-simulator.js";
import { initThemeToggle } from "./theme-toggle.js";
import { initPdfExport } from "./pdf-export.js";
import { t, getLang, initI18n } from "./i18n.js";

// Preguntas del cuestionario AQ-10 por grupo de edad y por idioma.
// adults y adolescents comparten el mismo cuestionario AQ-10 (misma fuente UCI)
// children usa una adaptación del AQ-10, toddlers usa el Q-CHAT-10
const QUESTIONS = {
  es: {
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
  },
  en: {
    adults: [
      "I often notice small sounds that other people don't.",
      "I tend to focus more on the big picture than on small details.",
      "I find it easy to do more than one thing at once.",
      "If there's an interruption, I can quickly get back to what I was doing.",
      "I find it easy to read between the lines when someone talks to me.",
      "I can tell when someone talking to me is getting bored or losing interest.",
      "When I read a story, I find it hard to picture what the characters look like.",
      "I find it easy to figure out people's intentions and feelings.",
      "I find it easy to imagine what it would be like to be in someone else's situation.",
      "I find it difficult to make new friends."
    ],
    adolescents: [
      "I often notice small sounds that other people don't.",
      "I tend to focus more on the big picture than on small details.",
      "I find it easy to do more than one thing at once.",
      "If there's an interruption, I can quickly get back to what I was doing.",
      "I find it easy to read between the lines when someone talks to me.",
      "I can tell when someone talking to me is getting bored or losing interest.",
      "When I read a story, I find it hard to picture what the characters look like.",
      "I find it easy to figure out people's intentions and feelings.",
      "I find it easy to imagine what it would be like to be in someone else's situation.",
      "I find it difficult to make new friends."
    ],
    children: [
      "Notices sounds that others don't.",
      "Focuses more on the big picture than on details.",
      "Can easily do several things at once.",
      "Quickly returns to an activity after an interruption.",
      "Understands when someone speaks to them with a double meaning.",
      "Notices when someone gets bored talking to them.",
      "Finds it hard to picture what characters in a story look like.",
      "Easily understands how others feel.",
      "Easily puts themselves in someone else's shoes.",
      "Finds it hard to make new friends."
    ],
    toddlers: [
      "Looks when something is pointed at.",
      "There's a suspicion their child might be deaf.",
      "Engages in imaginative play (pretending).",
      "Likes climbing on things (furniture, swings).",
      "Makes unusual finger movements near their eyes.",
      "Points to ask for something.",
      "Points to show interest in something.",
      "Shows interest in other children their age.",
      "Brings you objects to show you something.",
      "Responds when called by name."
    ]
  }
};

function getQuestions() {
  return QUESTIONS[getLang()] || QUESTIONS.es;
}

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

// Coeficientes del modelo de Regresion Logistica, cargados de model_coefficients.json
let modelCoefficients = null;

// El grupo "children" del cuestionario no tiene un dataset propio entrenado
// (los datos de ninos estan dentro del dataset "combined"), asi que para la
// demo de prediccion ML usamos el modelo de "combined" en ese caso.
function mapGroupToCoefKey(group) {
  return group === "children" ? "combined" : group;
}

async function loadModelCoefficients() {
  try {
    const response = await fetch("assets/data/model_coefficients.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // no disponible
  }
  return null;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Calcula la probabilidad segun el modelo de Regresion Logistica real,
// usando SOLO las 10 respuestas del cuestionario (sin edad ni otros datos
// demograficos que el modelo completo tambien usa). Es una aproximacion:
// en los datos de test, esta aproximacion correlaciona 0.96-0.99 con la
// prediccion real completa del modelo.
function computeMlPrediction() {
  if (!modelCoefficients) return null;

  const coefKey = mapGroupToCoefKey(currentGroup);
  const groupCoefs = modelCoefficients.groups[coefKey];
  if (!groupCoefs) return null;

  let score = groupCoefs.intercept;
  groupCoefs.aq_coefficients.forEach((item, i) => {
    const respuesta = answers[i] ?? 0;
    score += item.coef * respuesta;
  });

  return {
    probability: sigmoid(score),
    modelName: t("ml.model_name", { group: t(`group.${coefKey}`) })
  };
}

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
  const questions = getQuestions()[currentGroup];
  const progress = ((currentQuestion + 1) / 10) * 100;

  document.querySelector(".progress-fill").style.width = progress + "%";

  container.innerHTML = `
    <div class="question active">
      <div class="question-number">${t("q.number", { n: currentQuestion + 1 })}</div>
      <div class="question-text">${questions[currentQuestion]}</div>
      <div class="answer-options">
        <button class="answer-btn ${answers[currentQuestion] === 1 ? 'selected' : ''}"
                onclick="selectAnswer(1)">${t("q.agree")}</button>
        <button class="answer-btn ${answers[currentQuestion] === 0 ? 'selected' : ''}"
                onclick="selectAnswer(0)">${t("q.disagree")}</button>
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
  btnResult.title = allAnswered ? "" : t("q.answer_all");
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
    isHighRisk ? t("result.high.label") : t("result.low.label");

  document.getElementById("result-detail").textContent =
    isHighRisk
      ? t("result.high.detail", { score, threshold })
      : t("result.low.detail", { score, threshold });

  // Prediccion del modelo ML real (aproximada, ver computeMlPrediction)
  const mlResult = computeMlPrediction();
  if (mlResult) {
    const pct = (mlResult.probability * 100).toFixed(1);
    document.getElementById("ml-prob-value").textContent = t("ml.probability", { pct });
    document.getElementById("ml-prob-fill").style.width = pct + "%";
    document.getElementById("ml-prob-fill").className =
      "ml-prob-bar-fill " + (mlResult.probability >= 0.5 ? "ml-prob-high" : "ml-prob-low");
    document.getElementById("ml-model-name").textContent = mlResult.modelName;
  }
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
    label.textContent = t("data.group_label", {
      group: GROUP_LABELS[groupKey] || groupKey,
      model: group.best_model,
      n: group.n_test
    });
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
  initI18n();
  initThemeToggle();

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
  modelCoefficients = await loadModelCoefficients();
  initQuestionnaire();

  // Inicializar pestañas de análisis y el lightbox
  initAnalysisTabs();
  initLightbox();

  // Inicializar la exportacion a PDF (usa los datos ya cargados)
  initPdfExport(() => loadedMetrics);

  // Inicializar el fondo animado del hero y el simulador de umbral
  initNeuralBackground();
  await initThresholdSimulator();

  // Inicializar animaciones
  initScrollReveal();
  animateCounters();

  // Saludo para quien inspeccione la consola
  printConsoleEasterEgg();

  // Al cambiar de idioma, volvemos a renderizar todo el contenido dinamico
  // que no se actualiza solo via los atributos data-i18n (preguntas del
  // cuestionario, tabla de resultados, resumen destacado, panel de datos).
  document.addEventListener("testtea:langchange", () => {
    // Cuestionario: si estamos viendo una pregunta, se re-renderiza;
    // si estamos viendo el resultado, se recalcula y se re-muestra.
    const resultPanel = document.getElementById("result-panel");
    if (resultPanel && resultPanel.classList.contains("visible")) {
      showResult();
    } else {
      renderQuestion();
    }

    // Tabla completa y resumen destacado
    if (loadedMetrics) {
      renderFullMetricsTable("metrics-table", loadedMetrics.groups);
      renderHeadlineSummary("headline-summary", loadedMetrics.overall);
    }

    // Panel de "Los datos" (importancia + matriz) del grupo seleccionado
    renderGroupData(currentDataGroup);
  });
}

/* ============================================
   EASTER EGG: mensaje para quien mire la consola
   ============================================ */
function printConsoleEasterEgg() {
  console.log(
    "%c🍵 TesTEA",
    "font-size: 20px; font-weight: bold; color: #3A7D7B;"
  );
  console.log(
    "%cHola! Si estas viendo esto, probablemente eres desarrollador/a (o muy curioso/a).",
    "font-size: 13px; color: #64748B;"
  );
  console.log(
    "%cEste proyecto lo hizo el equipo de DataScope Solutions como parte de un bootcamp de IA & Big Data. Repo: https://github.com/adrianaarang/tesTEA",
    "font-size: 12px; color: #64748B;"
  );
  console.log(
    "%cGracias por mirar bajo el capo 👀",
    "font-size: 12px; color: #E8A838;"
  );
}

document.addEventListener("DOMContentLoaded", init);
