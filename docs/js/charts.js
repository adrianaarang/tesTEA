/* charts.js — Renderizado de graficos: barras de importancia y matriz de confusion */

function renderFeatureImportance(containerId, features) {
  const container = document.getElementById(containerId);
  if (!container || !features) return;

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

function renderMetricsTable(containerId, models) {
  const container = document.getElementById(containerId);
  if (!container || !models) return;

  const bestRecall = Math.max(...models.map(m => m.recall));

  container.innerHTML = `
    <table class="metrics-table">
      <thead>
        <tr>
          <th>Modelo</th>
          <th>Accuracy</th>
          <th>Precision</th>
          <th>Recall</th>
          <th>F1</th>
          <th>AUC-ROC</th>
        </tr>
      </thead>
      <tbody>
        ${models.map(m => `
          <tr>
            <td>${m.name} ${m.recall === bestRecall && m.recall > 0 ? '<span class="tag">mejor recall</span>' : ''}</td>
            <td class="metric-val">${m.accuracy.toFixed(3)}</td>
            <td class="metric-val">${m.precision.toFixed(3)}</td>
            <td class="metric-val ${m.recall === bestRecall && m.recall > 0 ? 'best' : ''}">${m.recall.toFixed(3)}</td>
            <td class="metric-val">${m.f1.toFixed(3)}</td>
            <td class="metric-val">${m.auc_roc.toFixed(3)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

export { renderFeatureImportance, renderConfusionMatrix, renderMetricsTable };
