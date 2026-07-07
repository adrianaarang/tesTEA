/* pdf-export.js — Genera un PDF resumen del proyecto usando jsPDF (via CDN) */

import { t, getLang } from "./i18n.js";

const GROUP_ORDER = ["adults", "adolescents", "combined", "toddlers"];

function generatePdfSummary(metrics) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error("jsPDF no esta disponible (revisa la conexion o el CDN).");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const marginX = 20;
  let y = 20;
  const lineHeight = 6;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginX * 2;

  function addLine(text, opts = {}) {
    const { size = 10, bold = false, color = [30, 41, 59], gap = lineHeight } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(text, contentWidth);
    doc.text(wrapped, marginX, y);
    y += gap * wrapped.length;
  }

  function addSpace(mm = 4) {
    y += mm;
  }

  function checkPageBreak(neededMm = 20) {
    if (y + neededMm > 285) {
      doc.addPage();
      y = 20;
    }
  }

  // ---- Encabezado ----
  doc.setFillColor(58, 125, 123);
  doc.rect(0, 0, pageWidth, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TesTEA", marginX, 15);
  y = 34;

  const locale = getLang() === "en" ? "en-US" : "es-ES";
  const fecha = new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  addLine(`${t("pdf.generated")} ${fecha}`, { size: 9, color: [100, 116, 139] });
  addSpace(4);

  // ---- Contexto ----
  addLine(t("pdf.context.title"), { size: 13, bold: true, color: [58, 125, 123] });
  addSpace(1);
  addLine(t("pdf.context.body"), { size: 10 });
  addSpace(6);

  // ---- Tabla de resultados ----
  checkPageBreak(60);
  addLine(t("pdf.results.title"), { size: 13, bold: true, color: [58, 125, 123] });
  addSpace(3);

  const colX = [marginX, marginX + 35, marginX + 65, marginX + 90, marginX + 115, marginX + 140];
  const headers = [t("chart.group"), t("chart.model"), "Recall", "F1", "Precision", "n test"];

  doc.setFillColor(232, 244, 243);
  doc.rect(marginX - 2, y - 5, contentWidth + 4, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  y += 8;

  GROUP_ORDER.forEach(groupKey => {
    const group = metrics.groups[groupKey];
    if (!group) return;
    const best = group.models.find(m => m.name === group.best_model) || group.models[group.models.length - 1];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const row = [
      t(`group.${groupKey}`) || groupKey,
      best.name,
      (best.recall * 100).toFixed(1) + "%",
      best.f1.toFixed(3),
      (best.precision * 100).toFixed(1) + "%",
      String(group.n_test)
    ];
    row.forEach((val, i) => doc.text(val, colX[i], y));
    y += 7;
  });

  addSpace(8);

  // ---- Resumen destacado ----
  // NOTA: headline_group_label y note vienen redactados en espanol desde
  // metrics.json (generado por el notebook), asi que se muestran tal cual
  // incluso en el PDF en ingles. El resto del PDF si esta traducido.
  if (metrics.overall) {
    checkPageBreak(30);
    addLine(t("pdf.headline.title"), { size: 13, bold: true, color: [58, 125, 123] });
    addSpace(2);
    addLine(
      `${t("chart.recall_in")} ${(metrics.overall.recall * 100).toFixed(0)}% — ${metrics.overall.headline_group_label} ` +
      `(${metrics.overall.headline_model}, n test = ${metrics.overall.n_test}).`,
      { size: 10, bold: true }
    );
    addSpace(1);
    addLine(metrics.overall.note, { size: 9, color: [100, 116, 139] });
    addSpace(6);
  }

  // ---- Marco etico ----
  checkPageBreak(70);
  addLine(t("pdf.ethics.title"), { size: 13, bold: true, color: [58, 125, 123] });
  addSpace(2);

  const sesgos = [
    t("bias1.body"),
    t("bias4.body"),
    t("bias3.body"),
    t("bias2.body")
  ];
  sesgos.forEach(s => {
    checkPageBreak(12);
    addLine("•  " + s, { size: 9.5, gap: 5 });
    addSpace(1);
  });

  addSpace(6);
  checkPageBreak(20);
  addLine(t("pdf.ethics.closing"), { size: 9.5, bold: true });

  // ---- Pie de pagina ----
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("TesTEA — DataScope Solutions — github.com/adrianaarang/tesTEA", marginX, 292);
    doc.text(`${i}/${totalPages}`, pageWidth - marginX - 10, 292);
  }

  const filename = getLang() === "en" ? "TesTEA_technical_summary.pdf" : "TesTEA_resumen_tecnico.pdf";
  doc.save(filename);
}

function initPdfExport(getMetrics) {
  const btn = document.getElementById("btn-download-pdf");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const metrics = getMetrics();
    if (metrics) generatePdfSummary(metrics);
  });
}

export { initPdfExport, generatePdfSummary };
