/* charts.js — Renderizado de graficos: tabla completa, resumen destacado, importancia, matriz de confusion */

const GROUP_LABELS = {
  adults: "Adultos",
  adolescents: "Adolescentes",
  combined: "Combinado",
  toddlers: "Toddlers"
};

function renderFeatureImportance(containerId, features) {
  const container = document.getElementById(containerId);
  if (!container || !features || features.length === 0) {
    if (container) container.innerHTML = "<p style='color:var(--text-faint); font-size:0.85rem;'>No hay datos de importancia disponibles para este modelo.</p>";
    return;
  }

  const maxVal = Math.max(...features.map(f => f.importance));

  container.innerHTML = features.map(f => {
    const pct = (f.importance / maxVal * 100).toFixed(1);
    return `
      <div class="feature-bar">
        <div class="name">${f.feature}</div>
        <div class="track">
          <div class="fill" data-width="${pct}" style="width: 0%"></div>
        </div>
        <div class="value">${(f.importance * 100).toFixed(1)}%</div>
      </div>
    `;
  }).join("");

  // Si el contenedor ya esta visible (no dentro de un .reveal pendiente),
  // activamos las barras directamente
  container.querySelectorAll(".fill[data-width]").forEach(fill => {
    requestAnimationFrame(() => {
      fill.style.width = fill.dataset.width + "%";
    });
  });
}

function renderConfusionMatrix(containerId, matrix, labels) {
  const container = document.getElementById(containerId);
  if (!container || !matrix) return;

  const predLabels = labels || ["NO TEA", "TEA"];
  const tn = matrix[0][0];
  const fp = matrix[0][1];
  const fn = matrix[1][0];
  const tp = matrix[1][1];

  container.innerHTML = `
    <div class="confusion-grid">
      <div class="corner"></div>
      <div class="header">Pred: ${predLabels[0]}</div>
      <div class="header">Pred: ${predLabels[1]}</div>
      <div class="header" style="writing-mode: vertical-lr; transform: rotate(180deg);">Real: ${predLabels[0]}</div>
      <div class="cell tn">${tn}</div>
      <div class="cell fp">${fp}</div>
      <div class="header" style="writing-mode: vertical-lr; transform: rotate(180deg);">Real: ${predLabels[1]}</div>
      <div class="cell fn">${fn}</div>
      <div class="cell tp">${tp}</div>
    </div>
  `;
}

// Tabla completa: todas las franjas de edad x todos los modelos.
// Se excluye Baseline de la marca "mejor modelo" (es solo referencia minima),
// y se resalta el modelo elegido como mejor de cada grupo (best_model del JSON).
function renderFullMetricsTable(containerId, groups) {
  const container = document.getElementById(containerId);
  if (!container || !groups) return;

  const groupOrder = ["adults", "adolescents", "combined", "toddlers"];
  let rows = "";

  groupOrder.forEach(groupKey => {
    const group = groups[groupKey];
    if (!group) return;

    group.models.forEach((m, idx) => {
      const isBest = m.name === group.best_model;
      const isBaseline = m.name === "Baseline";
      rows += `
        <tr class="${isBaseline ? 'row-baseline' : ''}">
          ${idx === 0 ? `<td rowspan="${group.models.length}" class="group-cell">${GROUP_LABELS[groupKey] || groupKey}<br><span class="group-meta">n test = ${group.n_test}</span></td>` : ""}
          <td>${m.name} ${isBest ? '<span class="tag">mejor</span>' : ''}</td>
          <td class="metric-val">${m.accuracy.toFixed(3)}</td>
          <td class="metric-val">${m.precision.toFixed(3)}</td>
          <td class="metric-val ${isBest ? 'best' : ''}">${m.recall.toFixed(3)}</td>
          <td class="metric-val">${m.f1.toFixed(3)}</td>
          <td class="metric-val">${m.auc_roc !== null ? m.auc_roc.toFixed(3) : "—"}</td>
        </tr>
      `;
    });
  });

  container.innerHTML = `
    <table class="metrics-table metrics-table-full">
      <thead>
        <tr>
          <th>Grupo</th>
          <th>Modelo</th>
          <th>Accuracy</th>
          <th>Precision</th>
          <th>Recall</th>
          <th>F1</th>
          <th>AUC-ROC</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Resumen destacado: la cifra titular que se muestra en la parte superior
// de la seccion de resultados, con su aviso de contexto (nota de robustez).
function renderHeadlineSummary(containerId, overall) {
  const container = document.getElementById(containerId);
  if (!container || !overall) return;

  container.innerHTML = `
    <div class="headline-summary">
      <div class="headline-number">${(overall.recall * 100).toFixed(0)}%</div>
      <div class="headline-text">
        <div class="headline-title">Recall en ${overall.headline_group_label}</div>
        <div class="headline-sub">Modelo ${overall.headline_model} · F1 ${overall.f1.toFixed(2)} · Precision ${overall.precision.toFixed(2)} · n test = ${overall.n_test}</div>
      </div>
    </div>
    <p class="headline-note">${overall.note}</p>
  `;
}

export { renderFeatureImportance, renderConfusionMatrix, renderFullMetricsTable, renderHeadlineSummary, GROUP_LABELS };
