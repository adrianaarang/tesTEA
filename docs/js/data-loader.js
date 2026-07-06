/* data-loader.js — Carga de datos reales del modelo desde metrics.json */

// Datos de respaldo por si metrics.json todavia no existe en el servidor.
// Misma estructura que el real: groups (por franja de edad) + overall (resumen destacado).
const DUMMY_METRICS = {
  groups: {
    adults: {
      n_test: 141,
      n_train: 563,
      models: [
        { name: "Baseline", accuracy: 0.73, precision: 0, recall: 0, f1: 0, auc_roc: 0.5, confusion_matrix: [[103, 0], [38, 0]] },
        { name: "Regresion Logistica", accuracy: 0.98, precision: 0.95, recall: 0.97, f1: 0.96, auc_roc: 0.99, confusion_matrix: [[101, 2], [1, 37]] },
        { name: "Random Forest", accuracy: 0.95, precision: 0.9, recall: 0.92, f1: 0.91, auc_roc: 0.97, confusion_matrix: [[99, 4], [3, 35]] },
        { name: "XGBoost", accuracy: 0.99, precision: 0.97, recall: 0.97, f1: 0.97, auc_roc: 0.99, confusion_matrix: [[102, 1], [1, 37]] }
      ],
      best_model: "XGBoost",
      feature_importance: [
        { feature: "A9_Score", importance: 0.24 }, { feature: "A5_Score", importance: 0.12 },
        { feature: "A6_Score", importance: 0.08 }, { feature: "A4_Score", importance: 0.05 }
      ]
    }
  },
  overall: {
    headline_group: "combined",
    headline_group_label: "Coleccion agrupada (adultos+adolescentes+ninos)",
    headline_model: "XGBoost",
    recall: 1.0,
    f1: 0.99,
    precision: 0.98,
    n_test: 1215,
    note: "Datos de ejemplo (metrics.json todavia no disponible)."
  }
};

const DATASET_STATS = {
  total_records: 7937,
  datasets: [
    { name: "Adultos (UCI)", records: 704, columns: 21 },
    { name: "Adolescentes (UCI)", records: 104, columns: 21 },
    { name: "Combinado (Kaggle)", records: 6075, columns: 15 },
    { name: "Toddlers (Kaggle)", records: 1054, columns: 19 }
  ]
};

// Intenta cargar el JSON real; si no existe, usa los datos dummy
async function loadMetrics() {
  try {
    const response = await fetch("assets/data/metrics.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // metrics.json no disponible todavia, usamos datos dummy
  }
  return DUMMY_METRICS;
}

function getDatasetStats() {
  return DATASET_STATS;
}

export { loadMetrics, getDatasetStats, DUMMY_METRICS, DATASET_STATS };
