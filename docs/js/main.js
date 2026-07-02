/* main.js — Orquestador principal y logica del cuestionario AQ-10 */

import { loadMetrics, getDatasetStats } from "./data-loader.js";
import { renderFeatureImportance, renderConfusionMatrix, renderMetricsTable } from "./charts.js";
import { initScrollReveal, animateCounters } from "./animations.js";

// Preguntas del cuestionario AQ-10 (version adultos)
// Fuente: Allison, Auyeung, and Baron-Cohen (2012)
const QUESTIONS = {
  adults: [
    "Frecuentemente noto pequenos sonidos que otras personas no perciben.",
    "Suelo concentrarme mas en el panorama general que en los pequenos detalles.",
    "Me resulta facil hacer mas de una cosa a la vez.",
    "Si hay una interrupcion, puedo volver a lo que estaba haciendo rapidamente.",
    "Me resulta facil leer entre lineas cuando alguien me habla.",
    "Se cuando alguien que habla conmigo se aburre o pierde interes.",
    "Cuando leo una historia, me cuesta imaginar como se ven los personajes.",
    "Me resulta facil averiguar las intenciones y sentimientos de las personas.",
    "Me resulta facil imaginar como seria estar en la situacion de otra persona.",
    "Me resulta dificil hacer nuevas amistades."
  ],
  children: [
    "Nota sonidos que otros no perciben.",
    "Se concentra mas en el panorama general que en los detalles.",
    "Puede hacer varias cosas a la vez facilmente.",
    "Vuelve a su actividad rapidamente tras una interrupcion.",
    "Entiende cuando alguien le habla con doble sentido.",
    "Se da cuenta cuando alguien se aburre hablando con el/ella.",
    "Le cuesta imaginar como son los personajes de un cuento.",
    "Entiende facilmente como se sienten los demas.",
    "Se pone facilmente en el lugar de otra persona.",
    "Le cuesta hacer nuevos amigos."
  ],
  toddlers: [
    "Mira cuando le senalan algo.",
    "Cree que su hijo/a es sordo/a.",
    "Hace juego imaginativo (fingir cosas).",
    "Le gusta subirse a las cosas (muebles, columpios).",
    "Hace movimientos inusuales con los dedos cerca de los ojos.",
    "Senala con el dedo para pedir algo.",
    "Senala con el dedo para mostrar interes en algo.",
    "Se interesa por otros ninos de su edad.",
    "Le trae objetos para mostrarle algo.",
    "Responde cuando le llaman por su nombre."
  ]
};

// Las preguntas donde "De acuerdo" puntua 1 (el resto puntua al reves)
const SCORING_DIRECT = {
  adults: [0, 6, 9],
  children: [0, 6, 9],
  toddlers: [1, 4]
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

  // Boton anterior
  document.getElementById("btn-prev").addEventListener("click", () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestion();
    }
  });

  // Boton siguiente
  document.getElementById("btn-next").addEventListener("click", () => {
    if (currentQuestion < 9) {
      currentQuestion++;
      renderQuestion();
    }
  });

  // Boton ver resultado
  document.getElementById("btn-result").addEventListener("click", showResult);

  // Boton reiniciar
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

  // Mostrar/ocultar botones de navegacion
  document.getElementById("btn-prev").disabled = currentQuestion === 0;

  const allAnswered = answers.every(a => a !== null);
  document.getElementById("btn-next").style.display = currentQuestion < 9 ? "" : "none";
  const btnResult = document.getElementById("btn-result");
  btnResult.style.display = currentQuestion === 9 ? "" : "none";
  btnResult.disabled = !allAnswered;
  btnResult.title = allAnswered ? "" : "Responde todas las preguntas para ver el resultado";
}

// Funcion global para los botones de respuesta
window.selectAnswer = function(value) {
  answers[currentQuestion] = value;
  renderQuestion();

  // Avanzar automaticamente si no es la ultima
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
  const threshold = currentGroup === "toddlers" ? 4 : 6;
  const isHighRisk = score >= threshold;

  document.getElementById("questionnaire-form").style.display = "none";

  const panel = document.getElementById("result-panel");
  panel.classList.add("visible");

  document.getElementById("result-score-value").textContent = score + "/10";
  document.getElementById("result-score-value").className =
    "result-score " + (isHighRisk ? "risk-high" : "risk-low");

  document.getElementById("result-label").textContent =
    isHighRisk
      ? "Resultado: se recomienda derivacion a evaluacion especializada"
      : "Resultado: no se detectan indicadores significativos de TEA";

  document.getElementById("result-detail").textContent =
    isHighRisk
      ? `La puntuacion obtenida (${score}/10) esta por encima del umbral de cribado (${threshold}/10). Esto NO es un diagnostico, sino una indicacion de que seria conveniente realizar una evaluacion clinica mas detallada con un profesional especializado.`
      : `La puntuacion obtenida (${score}/10) esta por debajo del umbral de cribado (${threshold}/10). Esto sugiere que no hay indicadores significativos de TEA en las respuestas. Si persisten preocupaciones, consulte con un profesional.`;
}

function resetQuestionnaire() {
  currentQuestion = 0;
  answers = new Array(10).fill(null);

  document.getElementById("questionnaire-form").style.display = "block";
  document.getElementById("result-panel").classList.remove("visible");

  renderQuestion();
}

// Inicializacion general
async function init() {
  // Cargar metricas del modelo
  const metrics = await loadMetrics();

  // Renderizar graficos con datos
  renderFeatureImportance("feature-importance", metrics.feature_importance);
  renderMetricsTable("metrics-table", metrics.models);

  // Buscar el mejor modelo y renderizar su matriz de confusion
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
