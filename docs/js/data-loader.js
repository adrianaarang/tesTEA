/* data-loader.js — Carga de datos del modelo desde JSONs */

// Datos dummy del EDA para usar hasta que el equipo exporte los reales
// Cuando Persona 5 exporte los JSONs a docs/assets/data/, sustituir estos valores

const DUMMY_METRICS = {
  models: [
    {
      name: "Baseline",
      accuracy: 0.73,
      precision: 0.00,
      recall: 0.00,
      f1: 0.00,
      auc_roc: 0.50,
      confusion_matrix: [[515, 0], [189, 0]]
    },
    {
      name: "Regresion Logistica",
      accuracy: 0.92,
      precision: 0.88,
      recall: 0.85,
      f1: 0.86,
      auc_roc: 0.96,
      confusion_matrix: [[498, 17], [28, 161]]
    },
    {
      name: "Random Forest",
      accuracy: 0.95,
      precision: 0.93,
      recall: 0.89,
      f1: 0.91,
      auc_roc: 0.98,
      confusion_matrix: [[506, 9], [21, 168]]
    },
    {
      name: "XGBoost",
      accuracy: 0.96,
      precision: 0.94,
      recall: 0.91,
      f1: 0.92,
      auc_roc: 0.99,
      confusion_matrix: [[508, 7], [17, 172]]
    }
  ],
  feature_importance: [
    { feature: "A4", importance: 0.18 },
    { feature: "A7", importance: 0.15 },
    { feature: "A10", importance: 0.13 },
    { feature: "A5", importance: 0.11 },
    { feature: "A9", importance: 0.10 },
    { feature: "A1", importance: 0.08 },
    { feature: "A8", importance: 0.07 },
    { feature: "A3", importance: 0.06 },
    { feature: "A6", importance: 0.05 },
    { feature: "A2", importance: 0.04 },
    { feature: "age", importance: 0.02 },
    { feature: "family_asd", importance: 0.01 }
  ],
  best_model: "XGBoost"
};

const DATASET_STATS = {
  total_records: 7833,
  datasets: [
    { name: "Adultos (UCI)", records: 704, columns: 21 },
    { name: "Combinado (Kaggle)", records: 6075, columns: 15 },
    { name: "Toddlers (Kaggle)", records: 1054, columns: 19 }
  ],
  class_balance: {
    adults: { no: 515, yes: 189 },
    combined: { no: 4271, yes: 1804 },
    toddlers: { no: 326, yes: 728 }
  }
};

// Intenta cargar el JSON real; si no existe, usa los datos dummy
async function loadMetrics() {
  try {
    const response = await fetch("assets/data/metrics.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // JSON real no disponible todavia, usamos datos dummy
  }
  return DUMMY_METRICS;
}

function getDatasetStats() {
  return DATASET_STATS;
}

export { loadMetrics, getDatasetStats, DUMMY_METRICS, DATASET_STATS };
