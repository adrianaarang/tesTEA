/* threshold-simulator.js — Simulador interactivo de umbral de decision */

import { t } from "./i18n.js";

let thresholdData = null;
let currentSimGroup = "adults";

async function loadThresholdData() {
  try {
    const response = await fetch("assets/data/threshold_sweep.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // no disponible
  }
  return null;
}

function findClosestPoint(points, threshold) {
  // Los puntos vienen en pasos de 0.02; buscamos el mas cercano al valor
  // exacto del slider (que tambien se mueve en pasos de 1/100 = 0.01,
  // asi que redondeamos al paso de datos mas cercano).
  let closest = points[0];
  let minDiff = Math.abs(points[0].threshold - threshold);
  for (const p of points) {
    const diff = Math.abs(p.threshold - threshold);
    if (diff < minDiff) {
      minDiff = diff;
      closest = p;
    }
  }
  return closest;
}

function updateSimulatorDisplay(threshold) {
  if (!thresholdData || !thresholdData.groups[currentSimGroup]) return;

  const groupData = thresholdData.groups[currentSimGroup];
  const point = findClosestPoint(groupData.points, threshold);

  document.getElementById("sim-threshold-value").textContent = point.threshold.toFixed(2);
  document.getElementById("sim-recall-value").textContent = (point.recall * 100).toFixed(1) + "%";
  document.getElementById("sim-precision-value").textContent = (point.precision * 100).toFixed(1) + "%";
  document.getElementById("sim-recall-fill").style.width = (point.recall * 100) + "%";
  document.getElementById("sim-precision-fill").style.width = (point.precision * 100) + "%";

  document.getElementById("sim-tp").textContent = point.tp;
  document.getElementById("sim-fp").textContent = point.fp;
  document.getElementById("sim-fn").textContent = point.fn;
  document.getElementById("sim-tn").textContent = point.tn;
}

function setSimGroup(groupKey) {
  currentSimGroup = groupKey;
  const groupData = thresholdData.groups[groupKey];
  if (!groupData) return;

  const label = document.getElementById("sim-model-label");
  if (label) {
    label.textContent = t("sim.model.label", {
      group: t(`group.${groupKey}`),
      model: groupData.model,
      n: groupData.n_test,
      positive: groupData.n_positive
    });
  }

  const slider = document.getElementById("sim-slider");
  const threshold = parseInt(slider.value, 10) / 100;
  updateSimulatorDisplay(threshold);
}

async function initThresholdSimulator() {
  thresholdData = await loadThresholdData();
  if (!thresholdData) return;

  const slider = document.getElementById("sim-slider");
  if (!slider) return;

  // Valor inicial
  setSimGroup(currentSimGroup);

  slider.addEventListener("input", () => {
    const threshold = parseInt(slider.value, 10) / 100;
    updateSimulatorDisplay(threshold);
  });

  document.querySelectorAll(".sim-group-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sim-group-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setSimGroup(btn.dataset.group);
    });
  });

  // Al cambiar de idioma, volvemos a construir la etiqueta del modelo
  document.addEventListener("testtea:langchange", () => {
    setSimGroup(currentSimGroup);
  });
}

export { initThresholdSimulator };
