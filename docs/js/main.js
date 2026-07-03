/* main.js — Orquestador principal y lógica del cuestionario AQ-10 */

import { loadMetrics, getDatasetStats } from "./data-loader.js";
import { renderFeatureImportance, renderConfusionMatrix, renderMetricsTable } from "./charts.js";
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

// Inicialización general
async function init() {
  // Cargar métricas del modelo
  const metrics = await loadMetrics();

  // Renderizar gráficos con datos
  renderFeatureImportance("feature-importance", metrics.feature_importance);
  renderMetricsTable("metrics-table", metrics.models);

  // Buscar el mejor modelo y renderizar su matriz de confusión
  const bestModel = metrics.models.find(m => m.name === metrics.best_model)
    || metrics.models[metrics.models.length - 1];
  renderConfusionMatrix("confusion-matrix", bestModel.confusion_matrix);

  // Inicializar cuestionario interactivo
  initQuestionnaire();

  // Inicializar animaciones
  initScrollReveal();
  animateCounters();
}

document.addEventListener("DOMContentLoaded", init);
