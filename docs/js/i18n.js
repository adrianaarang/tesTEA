/* i18n.js — Motor de traduccion ES/EN y diccionario completo */

let currentLang = "es";

const DICT = {
  es: {
    "nav.proyecto": "El proyecto",
    "nav.datos": "Los datos",
    "nav.resultados": "Resultados",
    "nav.cuestionario": "Cuestionario",
    "nav.simulador": "Simulador",
    "nav.sesgos": "Limitaciones",
    "nav.analisis": "Análisis",

    "hero.label": "DataScope Solutions / Proyecto de clasificación / Módulo III",
    "hero.title": "Dos consultas menos.<br>Una derivación <em>mejor</em>.",
    "hero.subtitle": "TesTEA es una herramienta de cribado temprano de TEA basada en machine learning. Analiza las respuestas del cuestionario AQ-10 y asiste a profesionales de atención primaria en la decisión de derivar a evaluación especializada.",
    "hero.badge1": "Cribado, no diagnóstico",
    "hero.badge2": "7.937 registros analizados",
    "hero.badge3": "Recall como métrica prioritaria",
    "hero.ethics": '<strong>Marco ético:</strong> TesTEA es una herramienta de apoyo al cribado, no un sistema de diagnóstico automatizado. Los resultados son orientativos y no sustituyen la evaluación clínica por parte de un profesional especializado. Reconocemos los sesgos potenciales de los datos (sobrerrepresentación de población anglosajona, criterios DSM-5, posible infradiagnóstico en mujeres) y recomendamos validación continua en contextos diversos. <a href="#sesgos" class="ethics-link">Ver detalle de sesgos y limitaciones ↓</a>',

    "theme.toDark": "Cambiar a modo oscuro",
    "theme.toLight": "Cambiar a modo claro",

    "proyecto.label": "El proyecto",
    "proyecto.title": "El problema que resuelve TesTEA",
    "proyecto.body": "Una unidad de pediatría de atención primaria quiere optimizar las derivaciones a neuropediatría. Actualmente, el proceso de cribado con el cuestionario AQ-10 requiere dos consultas: una para administrar el test y otra para corregirlo e interpretar los resultados. TesTEA reduce ese proceso a una sola interacción digital, derivando directamente a diagnóstico los casos con mayor probabilidad.",
    "stat.records": "registros analizados",
    "stat.datasets": "datasets combinados",
    "stat.models": "modelos entrenados",
    "stat.recall": "recall del mejor modelo",

    "datos.label": "Los datos",
    "datos.title": "Cuatro datasets, cuatro franjas de edad",
    "datos.body": "Trabajamos con datos de adultos (UCI), adolescentes (UCI), una colección agrupada de adultos, adolescentes y niños (Kaggle) y un dataset específico de toddlers (Kaggle). Todos basados en el cuestionario estandarizado AQ-10/Q-CHAT-10. Cada franja de edad tiene su propio modelo entrenado.",

    "group.adults": "Adultos",
    "group.adolescents": "Adolescentes",
    "group.combined": "Combinado",
    "group.toddlers": "Toddlers",

    "datacard1.title": "Importancia de cada pregunta",
    "datacard1.body": "Qué preguntas del AQ-10 pesan más en la predicción del modelo, para el grupo seleccionado.",
    "datacard2.title": "Matriz de confusión del mejor modelo",
    "datacard2.body": "Falsos negativos (abajo-izquierda) son los más críticos en cribado.",
    "detail.link": "📊 Ver análisis técnico completo (matrices, SHAP y comparativas) →",

    "resultados.label": "Resultados",
    "resultados.title": "Comparación de modelos",
    "resultados.body": "Priorizamos el recall (sensibilidad) porque en un contexto de cribado médico, un falso negativo (no derivar a alguien que lo necesita) es mucho más grave que un falso positivo (derivar a alguien que al final no lo necesita).",
    "pdf.button": "📄 Descargar resumen técnico (PDF)",

    "glossary.summary": "¿Qué significa cada métrica?",
    "glossary.hint": "(clic para ver)",
    "glossary.accuracy.term": "Accuracy",
    "glossary.accuracy.alias": "(exactitud)",
    "glossary.accuracy.body": "De cada 100 casos, cuántos clasifica bien el modelo en total (positivos y negativos juntos). Puede engañar si hay muchos más casos de un tipo que de otro.",
    "glossary.precision.term": "Precision",
    "glossary.precision.alias": "(precisión)",
    "glossary.precision.body": "De todos los casos que el modelo marca como positivos, cuántos lo son de verdad. Precisión alta = pocas falsas alarmas.",
    "glossary.recall.term": "Recall",
    "glossary.recall.alias": "(sensibilidad)",
    "glossary.recall.body": "De todos los casos que realmente son positivos, cuántos detecta el modelo. Es la métrica más importante aquí: recall alto significa que casi ningún caso se escapa sin ser derivado.",
    "glossary.f1.term": "F1",
    "glossary.f1.body": "Un único número que resume el equilibrio entre precisión y recall. Útil para comparar modelos de un vistazo.",
    "glossary.auc.term": "AUC-ROC",
    "glossary.auc.body": "Qué tan bien distingue el modelo entre positivos y negativos en general. 1.0 = distinción casi perfecta, 0.5 = equivalente a tirar una moneda al aire.",
    "results.table.title": "Todos los modelos, las cuatro franjas de edad",

    "cuestionario.label": "Prueba el cuestionario",
    "cuestionario.title": "Cribado AQ-10 interactivo",
    "cuestionario.body": "Elige el grupo de edad, responde las 10 preguntas y obtendrás el resultado del cribado. Recuerda: esto no es un diagnóstico.",

    "age.adult": "Adulto",
    "age.adolescent": "Adolescente",
    "age.child": "Niño/a",
    "age.toddler": "Bebé/Toddler",

    "q.agree": "De acuerdo",
    "q.disagree": "En desacuerdo",
    "q.number": "Pregunta {n} de 10",
    "btn.prev": "Anterior",
    "btn.next": "Siguiente",
    "btn.result": "Ver resultado",
    "btn.reset": "Repetir cuestionario",

    "ml.label": "¿Y qué dice el modelo de Machine Learning?",
    "ml.note": "Predicción de la Regresión Logística entrenada en este proyecto (aproximada: usa solo tus 10 respuestas, sin edad ni otros datos demográficos que el modelo real también considera). Modelo:",
    "result.disclaimer": "Este resultado es orientativo y no constituye un diagnóstico clínico. Si el resultado sugiere derivación, consulte con un profesional especializado para una evaluación completa.",
    "result.high.label": "Resultado: se recomienda derivación a evaluación especializada",
    "result.low.label": "Resultado: no se detectan indicadores significativos de TEA",
    "result.high.detail": "La puntuación obtenida ({score}/10) está por encima del umbral de cribado ({threshold}/10). Esto NO es un diagnóstico, sino una indicación de que sería conveniente realizar una evaluación clínica más detallada con un profesional especializado.",
    "result.low.detail": "La puntuación obtenida ({score}/10) está por debajo del umbral de cribado ({threshold}/10). Esto sugiere que no hay indicadores significativos de TEA en las respuestas. Si persisten preocupaciones, consulte con un profesional.",

    "simulador.label": "Juega con el modelo",
    "simulador.title": "Simulador de umbral de decisión",
    "simulador.body": 'El modelo no da un "sí" o un "no": da una probabilidad. Alguien tiene que decidir a partir de qué probabilidad se deriva a un paciente -eso es el <strong>umbral de decisión</strong>-. Mueve el control y mira en tiempo real cómo cambia el recall (sensibilidad) y la precisión según dónde pongas el corte, con datos reales del test set.',
    "sim.threshold": "Umbral",
    "sim.recall": "Recall",
    "sim.recall.hint": "(prioritario)",
    "sim.precision": "Precisión",
    "sim.tp.label": "Verdaderos positivos<br>(detectados bien)",
    "sim.fp.label": "Falsos positivos<br>(derivación de más)",
    "sim.fn.label": "Falsos negativos<br>(casos que se escapan)",
    "sim.tn.label": "Verdaderos negativos<br>(descartados bien)",
    "sim.note": "Fíjate qué pasa si subes mucho el umbral: la precisión mejora, pero los falsos negativos empiezan a subir. Por eso, en cribado médico, preferimos un umbral que mantenga el recall alto aunque sacrifique algo de precisión.",
    "sim.model.label": "{group} · modelo {model} · n test = {n} ({positive} casos positivos reales)",

    "sesgos.label": "Limitaciones",
    "sesgos.title": "Sesgos y limitaciones documentadas",
    "sesgos.body": "Estas limitaciones no invalidan el proyecto, pero delimitan claramente su alcance: TesTEA es una prueba de concepto que demuestra viabilidad técnica, no un producto listo para uso clínico sin validación adicional.",
    "bias.high": "Alto",
    "bias.medium": "Medio",
    "bias1.title": "Sobrerrepresentación anglosajona",
    "bias1.body": "Los cuatro datasets (UCI y Kaggle) proceden mayoritariamente de estudios en Reino Unido y Estados Unidos. El modelo puede no generalizar bien a otros contextos culturales o lingüísticos, incluido el español, sin validación previa.",
    "bias2.title": "Criterios DSM-5",
    "bias2.body": "El cuestionario y las etiquetas de cribado se basan en el DSM-5, usado principalmente en EE. UU. Otros sistemas clínicos como la CIE-11 (más habitual en España) pueden diferir en los criterios de derivación.",
    "bias3.title": "Infradiagnóstico en mujeres",
    "bias3.body": "El TEA se diagnostica con más frecuencia en hombres; en mujeres la presentación conductual suele pasar más desapercibida. Si los datos heredan ese patrón, el modelo puede reproducirlo. Recomendamos monitorizar el rendimiento por sexo.",
    "bias4.title": "Muestra reducida en adolescentes",
    "bias4.body": "Solo 104 registros, muy por debajo de los otros tres grupos. El modelo para esta franja tiene mayor incertidumbre y sus métricas deben interpretarse con más cautela hasta ampliar los datos disponibles.",

    "analisis.label": "Para quien quiera mirar bajo el capó",
    "analisis.title": "Análisis técnico completo",
    "analisis.body": "Las 16 combinaciones de modelo × grupo de edad (agrupadas en 4 imágenes), la interpretabilidad SHAP de cada franja, y las comparativas agregadas. Haz clic en cualquier imagen para verla en grande.",
    "tab.confusion": "Matrices de confusión",
    "tab.shap": "Interpretabilidad SHAP",
    "tab.comparativas": "Comparativas",
    "analysis.metrics_label": "Métricas por grupo de edad",
    "analysis.recall_label": "Recall por modelo y grupo",

    "conclusion.label": "Conclusión",
    "conclusion.title": "Lo que le recomendamos al cliente",
    "conclusion.p1": "<strong>TesTEA demuestra que es posible automatizar el cribado AQ-10 con un nivel de recall suficiente para uso como herramienta de apoyo en atención primaria.</strong> El modelo identifica correctamente más del 90% de los casos positivos, reduciendo significativamente el riesgo de falsos negativos.",
    "conclusion.p2": 'Recomendamos desplegar TesTEA como herramienta complementaria (no sustitutiva) en consultas de atención primaria, teniendo en cuenta los sesgos y limitaciones documentados <a href="#sesgos" class="ethics-link">más arriba</a> antes de cualquier uso clínico real.',
    "conclusion.p3": "<strong>Siguiente paso:</strong> incorporar datos de centros españoles de atención primaria para reentrenar el modelo con población local, ampliar la muestra de adolescentes, monitorizar el rendimiento por sexo, y realizar un piloto controlado comparando las derivaciones de TesTEA con las derivaciones manuales.",

    "team.label": "Por qué hicimos esto",
    "team.note": "TesTEA empezó como el proyecto final de un módulo de Machine Learning, pero se convirtió en algo que nos importaba de verdad. Cuando una familia espera meses para una primera cita de neuropediatría, cada semana cuenta. Si un modelo entrenado con datos públicos puede ayudar a priorizar quién necesita esa cita antes, merece la pena intentarlo -con toda la humildad que exige trabajar con datos de salud, y sin perder de vista que esto es un prototipo académico, no un producto clínico terminado.",
    "team.signature": "— El equipo de DataScope Solutions",
    "footer.title": "TESTEA — DataScope Solutions — Módulo III",
    "footer.team": "Equipo",

    "pdf.context.title": "Contexto de negocio",
    "pdf.context.body": "Herramienta de cribado temprano de TEA basada en Machine Learning, orientada a unidades de pediatría de atención primaria. Predice el nivel de riesgo a partir del cuestionario AQ-10/Q-CHAT-10 y datos demográficos básicos, para asistir en decisiones de derivación a evaluación especializada. No es una herramienta diagnóstica.",
    "pdf.results.title": "Resultados por grupo de edad",
    "pdf.headline.title": "Resultado destacado",
    "pdf.ethics.title": "Marco ético y limitaciones",
    "pdf.ethics.closing": "TesTEA es un prototipo académico que demuestra viabilidad técnica, no un producto clínico listo para uso real sin validación adicional.",
    "pdf.generated": "Generado el",

    "chart.no_importance": "No hay datos de importancia disponibles para este modelo.",
    "chart.no_condition": "NO TEA",
    "chart.condition": "TEA",
    "chart.pred": "Pred",
    "chart.real": "Real",
    "chart.best": "mejor",
    "chart.group": "Grupo",
    "chart.model": "Modelo",
    "chart.recall_in": "Recall en",

    "q.answer_all": "Responde todas las preguntas para ver el resultado",
    "ml.probability": "{pct}% de probabilidad",
    "ml.model_name": "Regresión Logística ({group})",
    "data.group_label": "{group} · modelo {model} · n test = {n}"
  },

  en: {
    "nav.proyecto": "The project",
    "nav.datos": "The data",
    "nav.resultados": "Results",
    "nav.cuestionario": "Questionnaire",
    "nav.simulador": "Simulator",
    "nav.sesgos": "Limitations",
    "nav.analisis": "Analysis",

    "hero.label": "DataScope Solutions / Classification project / Module III",
    "hero.title": "Two fewer visits.<br>A <em>better</em> referral.",
    "hero.subtitle": "TesTEA is an early ASD screening tool based on machine learning. It analyzes AQ-10 questionnaire responses and helps primary care professionals decide whether to refer a case for specialized evaluation.",
    "hero.badge1": "Screening, not diagnosis",
    "hero.badge2": "7,937 records analyzed",
    "hero.badge3": "Recall as the priority metric",
    "hero.ethics": '<strong>Ethical framework:</strong> TesTEA is a screening support tool, not an automated diagnostic system. Results are indicative and do not replace clinical evaluation by a specialized professional. We acknowledge potential data biases (overrepresentation of Anglo-Saxon populations, DSM-5 criteria, possible underdiagnosis in women) and recommend continued validation across diverse contexts. <a href="#sesgos" class="ethics-link">See bias and limitation details ↓</a>',

    "theme.toDark": "Switch to dark mode",
    "theme.toLight": "Switch to light mode",

    "proyecto.label": "The project",
    "proyecto.title": "The problem TesTEA solves",
    "proyecto.body": "A primary care pediatric unit wants to optimize referrals to neuropediatrics. Currently, screening with the AQ-10 questionnaire requires two visits: one to administer the test and another to score and interpret the results. TesTEA reduces this to a single digital interaction, directly referring the highest-probability cases for diagnosis.",
    "stat.records": "records analyzed",
    "stat.datasets": "datasets combined",
    "stat.models": "models trained",
    "stat.recall": "recall of the best model",

    "datos.label": "The data",
    "datos.title": "Four datasets, four age groups",
    "datos.body": "We work with data from adults (UCI), adolescents (UCI), a combined collection of adults, adolescents and children (Kaggle), and a specific toddlers dataset (Kaggle). All based on the standardized AQ-10/Q-CHAT-10 questionnaire. Each age group has its own trained model.",

    "group.adults": "Adults",
    "group.adolescents": "Adolescents",
    "group.combined": "Combined",
    "group.toddlers": "Toddlers",

    "datacard1.title": "Importance of each question",
    "datacard1.body": "Which AQ-10 questions weigh most in the model's prediction, for the selected group.",
    "datacard2.title": "Confusion matrix of the best model",
    "datacard2.body": "False negatives (bottom-left) are the most critical in screening.",
    "detail.link": "📊 See full technical analysis (matrices, SHAP and comparisons) →",

    "resultados.label": "Results",
    "resultados.title": "Model comparison",
    "resultados.body": "We prioritize recall (sensitivity) because in a medical screening context, a false negative (not referring someone who needs it) is far more serious than a false positive (referring someone who ultimately doesn't need it).",
    "pdf.button": "📄 Download technical summary (PDF)",

    "glossary.summary": "What does each metric mean?",
    "glossary.hint": "(click to see)",
    "glossary.accuracy.term": "Accuracy",
    "glossary.accuracy.alias": "",
    "glossary.accuracy.body": "Out of every 100 cases, how many the model classifies correctly overall (positives and negatives together). It can be misleading if one class is much more common than the other.",
    "glossary.precision.term": "Precision",
    "glossary.precision.alias": "",
    "glossary.precision.body": "Of all the cases the model flags as positive, how many actually are. High precision = few false alarms.",
    "glossary.recall.term": "Recall",
    "glossary.recall.alias": "(sensitivity)",
    "glossary.recall.body": "Of all the cases that are actually positive, how many the model detects. This is the most important metric here: high recall means almost no case slips through undetected.",
    "glossary.f1.term": "F1",
    "glossary.f1.body": "A single number summarizing the balance between precision and recall. Useful for comparing models at a glance.",
    "glossary.auc.term": "AUC-ROC",
    "glossary.auc.body": "How well the model distinguishes between positives and negatives overall. 1.0 = near-perfect separation, 0.5 = equivalent to a coin flip.",
    "results.table.title": "All models, across the four age groups",

    "cuestionario.label": "Try the questionnaire",
    "cuestionario.title": "Interactive AQ-10 screening",
    "cuestionario.body": "Choose the age group, answer the 10 questions, and get the screening result. Remember: this is not a diagnosis.",

    "age.adult": "Adult",
    "age.adolescent": "Adolescent",
    "age.child": "Child",
    "age.toddler": "Toddler",

    "q.agree": "Agree",
    "q.disagree": "Disagree",
    "q.number": "Question {n} of 10",
    "btn.prev": "Previous",
    "btn.next": "Next",
    "btn.result": "See result",
    "btn.reset": "Retake questionnaire",

    "ml.label": "So what does the Machine Learning model say?",
    "ml.note": "Prediction from the Logistic Regression model trained in this project (approximate: it uses only your 10 answers, without age or other demographic data that the full model also considers). Model:",
    "result.disclaimer": "This result is indicative and does not constitute a clinical diagnosis. If the result suggests referral, consult a specialized professional for a full evaluation.",
    "result.high.label": "Result: referral to specialized evaluation is recommended",
    "result.low.label": "Result: no significant ASD indicators detected",
    "result.high.detail": "The score obtained ({score}/10) is above the screening threshold ({threshold}/10). This is NOT a diagnosis, but an indication that a more detailed clinical evaluation with a specialized professional would be advisable.",
    "result.low.detail": "The score obtained ({score}/10) is below the screening threshold ({threshold}/10). This suggests there are no significant ASD indicators in the responses. If concerns persist, consult a professional.",

    "simulador.label": "Play with the model",
    "simulador.title": "Decision threshold simulator",
    "simulador.body": 'The model doesn\'t give a "yes" or "no": it gives a probability. Someone has to decide from what probability a patient is referred -that\'s the <strong>decision threshold</strong>-. Move the control and watch in real time how recall (sensitivity) and precision change depending on where you set the cutoff, using real test set data.',
    "sim.threshold": "Threshold",
    "sim.recall": "Recall",
    "sim.recall.hint": "(priority)",
    "sim.precision": "Precision",
    "sim.tp.label": "True positives<br>(correctly detected)",
    "sim.fp.label": "False positives<br>(over-referral)",
    "sim.fn.label": "False negatives<br>(missed cases)",
    "sim.tn.label": "True negatives<br>(correctly ruled out)",
    "sim.note": "Notice what happens if you raise the threshold a lot: precision improves, but false negatives start to climb. That's why, in medical screening, we prefer a threshold that keeps recall high even if it costs some precision.",
    "sim.model.label": "{group} · model {model} · n test = {n} ({positive} real positive cases)",

    "sesgos.label": "Limitations",
    "sesgos.title": "Documented biases and limitations",
    "sesgos.body": "These limitations don't invalidate the project, but they clearly define its scope: TesTEA is a proof of concept that demonstrates technical feasibility, not a product ready for clinical use without further validation.",
    "bias.high": "High",
    "bias.medium": "Medium",
    "bias1.title": "Anglo-Saxon overrepresentation",
    "bias1.body": "All four datasets (UCI and Kaggle) come mostly from studies in the UK and the US. The model may not generalize well to other cultural or linguistic contexts, including Spain, without prior validation.",
    "bias2.title": "DSM-5 criteria",
    "bias2.body": "The questionnaire and screening labels are based on the DSM-5, used mainly in the US. Other clinical systems such as ICD-11 (more common in Spain) may differ in referral criteria.",
    "bias3.title": "Underdiagnosis in women",
    "bias3.body": "ASD is diagnosed more often in men; in women the behavioral presentation tends to go more unnoticed. If the data inherits that pattern, the model may reproduce it. We recommend monitoring performance by sex.",
    "bias4.title": "Small adolescent sample",
    "bias4.body": "Only 104 records, well below the other three groups. The model for this age group has greater uncertainty and its metrics should be interpreted with more caution until more data is available.",

    "analisis.label": "For those who want to look under the hood",
    "analisis.title": "Full technical analysis",
    "analisis.body": "The 16 model × age group combinations (grouped into 4 images), SHAP interpretability for each group, and the aggregated comparisons. Click any image to view it larger.",
    "tab.confusion": "Confusion matrices",
    "tab.shap": "SHAP interpretability",
    "tab.comparativas": "Comparisons",
    "analysis.metrics_label": "Metrics by age group",
    "analysis.recall_label": "Recall by model and group",

    "conclusion.label": "Conclusion",
    "conclusion.title": "What we recommend to the client",
    "conclusion.p1": "<strong>TesTEA shows that it's possible to automate AQ-10 screening with a level of recall sufficient for use as a support tool in primary care.</strong> The model correctly identifies more than 90% of positive cases, significantly reducing the risk of false negatives.",
    "conclusion.p2": 'We recommend deploying TesTEA as a complementary tool (not a replacement) in primary care visits, taking into account the biases and limitations documented <a href="#sesgos" class="ethics-link">above</a> before any real clinical use.',
    "conclusion.p3": "<strong>Next step:</strong> incorporate data from Spanish primary care centers to retrain the model on the local population, expand the adolescent sample, monitor performance by sex, and run a controlled pilot comparing TesTEA's referrals with manual referrals.",

    "team.label": "Why we built this",
    "team.note": "TesTEA started as the final project of a Machine Learning module, but it became something we genuinely cared about. When a family waits months for a first neuropediatrics appointment, every week counts. If a model trained on public data can help prioritize who needs that appointment sooner, it's worth trying -with all the humility that working with health data demands, and without losing sight that this is an academic prototype, not a finished clinical product.",
    "team.signature": "— The DataScope Solutions team",
    "footer.title": "TESTEA — DataScope Solutions — Module III",
    "footer.team": "Team",

    "pdf.context.title": "Business context",
    "pdf.context.body": "Early ASD screening tool based on Machine Learning, aimed at primary care pediatric units. It predicts risk level from the AQ-10/Q-CHAT-10 questionnaire and basic demographic data, to assist referral decisions to specialized evaluation. It is not a diagnostic tool.",
    "pdf.results.title": "Results by age group",
    "pdf.headline.title": "Highlighted result",
    "pdf.ethics.title": "Ethical framework and limitations",
    "pdf.ethics.closing": "TesTEA is an academic prototype that demonstrates technical feasibility, not a clinical product ready for real use without further validation.",
    "pdf.generated": "Generated on",

    "chart.no_importance": "No importance data available for this model.",
    "chart.no_condition": "No ASD",
    "chart.condition": "ASD",
    "chart.pred": "Pred",
    "chart.real": "Actual",
    "chart.best": "best",
    "chart.group": "Group",
    "chart.model": "Model",
    "chart.recall_in": "Recall in",

    "q.answer_all": "Answer all the questions to see the result",
    "ml.probability": "{pct}% probability",
    "ml.model_name": "Logistic Regression ({group})",
    "data.group_label": "{group} · model {model} · n test = {n}"
  }
};

function t(key, vars) {
  const dict = DICT[currentLang] || DICT.es;
  let text = dict[key] !== undefined ? dict[key] : (DICT.es[key] !== undefined ? DICT.es[key] : key);

  if (vars) {
    Object.keys(vars).forEach(k => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return text;
}

function getLang() {
  return currentLang;
}

function applyTranslations() {
  document.documentElement.setAttribute("lang", currentLang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = t(key);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    el.setAttribute("aria-label", t(key));
  });

  // Avisamos al resto de modulos (charts.js, main.js, simulador...) para
  // que vuelvan a renderizar el contenido dinamico en el nuevo idioma.
  document.dispatchEvent(new CustomEvent("testtea:langchange", { detail: { lang: currentLang } }));
}

function setLang(lang) {
  if (lang !== "es" && lang !== "en") return;
  currentLang = lang;
  localStorage.setItem("testtea-lang", lang);
  applyTranslations();

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

function initI18n() {
  const saved = localStorage.getItem("testtea-lang");
  currentLang = saved === "en" ? "en" : "es";

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  applyTranslations();
}

export { t, getLang, setLang, initI18n };
