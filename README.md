# 🧩 TesTEA

<div align="center">

**Herramienta de cribado temprano de TEA basada en Machine Learning**

Proyecto I · Módulo III · Bootcamp IA & Big Data · Somos F5 / 2026

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Demo-222222?logo=github&logoColor=white)](https://adrianaarang.github.io/tesTEA/)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![scikit--learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?logo=scikitlearn&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green)

</div>

---

## 📋 Descripción del proyecto

TesTEA es una herramienta de Business Intelligence y Machine Learning orientada a **unidades de pediatría de atención primaria** que quieren optimizar sus derivaciones a neuropediatría.

El proyecto transforma cuatro datasets públicos de cribado de autismo (basados en el cuestionario estandarizado **AQ-10 / Q-CHAT-10**) en un modelo predictivo y un front interactivo que responde preguntas clave:

- ¿Podemos predecir, a partir del cuestionario AQ-10 y datos demográficos básicos, si un caso debe derivarse a evaluación clínica especializada?
- ¿Qué preguntas del cuestionario tienen más poder discriminativo?
- ¿Cómo varía el rendimiento del modelo entre franjas de edad (adultos, adolescentes, niños, toddlers)?
- ¿Qué sesgos contienen los datos disponibles y qué impacto tendrían en un despliegue clínico real?

**No es una herramienta diagnóstica.** Es un apoyo al cribado inicial, pensado para ahorrar las dos consultas que hoy requiere administrar y corregir el test en papel.

---

## 🖥️ Demo

[![▶ Ver demo en vivo](https://img.shields.io/badge/▶%20Ver%20demo%20en%20vivo-adrianaarang.github.io/tesTEA-222222?style=for-the-badge&logo=github)](https://adrianaarang.github.io/tesTEA/)

El front incluye un cuestionario AQ-10 interactivo (elige tu grupo de edad y responde las 10 preguntas) y un panel de resultados con las métricas reales de los 4 modelos entrenados.

> **Nota:** Las métricas finales mostradas en el frontend proceden directamente de [`notebooks/04_evaluacion_analisis.ipynb`](notebooks/04_evaluacion_analisis.ipynb).

---

## 📊 Datasets

| Campo | Detalle |
|---|---|
| **Fuente principal (adultos)** | [UCI · Autism Screening Adult](https://archive.ics.uci.edu/dataset/426) |
| **Fuente (adolescentes)** | [UCI · Autistic Spectrum Disorder Screening Data for Adolescent](https://archive.ics.uci.edu/dataset/420) |
| **Fuente (agrupado)** | [Kaggle · Autism Screening Data](https://www.kaggle.com/datasets/andrewmvd/autism-screening-data) |
| **Fuente (toddlers)** | [Kaggle · Autism Screening for Toddlers](https://www.kaggle.com/datasets/fabdelja/autism-screening-for-toddlers) |
| **Registros totales** | 7.937 (704 adultos + 104 adolescentes + 6.075 agrupado + 1.054 toddlers) |
| **Cuestionario base** | AQ-10 (adultos/adolescentes/niños) y Q-CHAT-10 (toddlers) |
| **Licencia** | Uso educativo, según licencia original de UCI/Kaggle |

### Variables principales

`A1`–`A10` (respuestas del cuestionario), `age`/`Age_Mons`, `gender`/`Sex`, `ethnicity`, `jundice`/`Jaundice`, `austim`/`Family_ASD` (antecedentes familiares), `contry_of_res`, `relation`

Los datasets no se incluyen en el repositorio por licencia. Descargar de las fuentes de la tabla y colocar en `data/raw/`.

---

## 🏗️ Estructura del proyecto

```
testtea/
│
├── README.md
├── requirements.txt
├── .gitignore
├── KANBAN.md
│
├── data/
│   ├── raw/                          # CSVs/ARFF originales (excluidos de git)
│   └── processed/                    # Datasets limpios + preprocessors .pkl (versionados)
│
├── notebooks/
│   ├── 01_eda.ipynb                  # Exploracion de los 4 datasets
│   ├── 02_preprocesamiento.ipynb     # Encoding, escalado, split, agrupacion de categorias
│   ├── 03_modelado.ipynb             # Baseline + Logistica + Random Forest + XGBoost
│   └── 04_evaluacion_analisis.ipynb  # Metricas, ROC, SHAP, analisis critico
│
├── src/
│   ├── __init__.py
│   ├── preprocessing.py              # Pipeline de preprocesamiento (config por dataset)
│   └── evaluate.py                   # Funciones de metricas y comparacion
│
└── docs/                             # Front (GitHub Pages)
    ├── index.html
    ├── css/
    │   ├── base.css
    │   ├── theme.css
    │   ├── layout.css
    │   └── components.css
    ├── js/
    │   ├── main.js                   # Cuestionario AQ-10 interactivo por grupo de edad
    │   ├── data-loader.js            # Carga metrics.json real
    │   ├── charts.js                 # Tabla de resultados, importancia, matriz de confusion
    │   └── animations.js
    └── assets/
        ├── data/metrics.json         # Metricas reales exportadas desde el notebook 04
        └── img/                      # Graficos generados por los notebooks
```

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso | Justificación |
|---|---|---|
| **Python + pandas** | Carga y preprocesamiento | Estándar de facto para análisis tabular |
| **scikit-learn** | Pipelines, encoding, modelos base | `ColumnTransformer` + `Pipeline` evitan data leakage de forma nativa |
| **XGBoost** | Modelo de gradient boosting | Mejor rendimiento en el grupo combinado (el mas robusto estadisticamente) |
| **GridSearchCV + StratifiedKFold** | Validación y ajuste de hiperparámetros | Robusto en datasets pequeños (ej. adolescentes, 104 registros) sin sacrificar un validation set fijo |
| **HTML/CSS/JS (vanilla)** | Front interactivo | Sin build, despliegue directo en GitHub Pages desde `/docs` |
| **GitHub Pages** | Hosting del front | Gratuito, integrado con el repositorio |

### ¿Por qué un modelo por franja de edad y no uno único?

Cada franja de edad usa una versión distinta del cuestionario (AQ-10 vs Q-CHAT-10) y columnas demográficas diferentes. Forzar un espacio de features común implicaría perder información o inventar valores. La validación clínica original del AQ-10 también se hizo por separado en cada franja, así que replicar esa separación en el modelado es fiel al diseño del instrumento.

---

## 🚀 Instalación y ejecución local

```bash
# 1. Clonar el repositorio
git clone https://github.com/adrianaarang/tesTEA.git
cd tesTEA

# 2. Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # Mac/Linux

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Descargar los datasets (ver sección Datasets)
# Colocar los ficheros en data/raw/

# 5. Ejecutar los notebooks en orden
# 01_eda.ipynb -> 02_preprocesamiento.ipynb -> 03_modelado.ipynb -> 04_evaluacion_analisis.ipynb

# 6. Servir el front localmente
cd docs
python -m http.server 8000
```

El front estará disponible en `http://localhost:8000`

---

## 📈 Secciones del front

| Sección | Descripción |
|---|---|
| 🏠 Hero | Pitch del proyecto, encuadre ético desde la primera pantalla |
| 📊 El proyecto | Contexto de negocio y estadísticas generales (registros, datasets, modelos) |
| 🗂️ Los datos | Importancia de variables y matriz de confusión, seleccionables por franja de edad |
| 📈 Resultados | Resumen destacado + glosario de métricas en lenguaje llano + tabla completa de las 4 franjas × 4 modelos |
| ✅ Cuestionario | AQ-10/Q-CHAT-10 interactivo, con resultado de cribado en tiempo real |
| ⚠️ Limitaciones | Sesgos documentados en 4 tarjetas destacadas (anglosajón, DSM-5, infradiagnóstico en mujeres, muestra reducida en adolescentes) |
| 🎯 Conclusión | Recomendaciones al cliente y próximos pasos |

---

## 🔍 Hallazgos principales

- El grupo **combinado** (adultos+adolescentes+niños) alcanza **recall = 1.00** con XGBoost sobre 1.215 registros de test, el resultado más robusto estadísticamente.
- Las preguntas del AQ-10 con mayor poder discriminativo varían por franja de edad, pero A5, A6 y A9 aparecen consistentemente entre las más importantes.
- El grupo de **adultos** alcanza recall = 0.97 con Regresión Logística; **adolescentes** y **toddlers** alcanzan recall = 1.00, también con Regresión Logística, aunque sobre test sets mucho más pequeños (21 y 211 registros).
- La puntuación total del cuestionario ya separa razonablemente bien las dos clases por sí sola, confirmando que hay señal predictiva real más allá del scoring fijo estándar.

---

## ⚠️ Sesgos y limitaciones documentadas

| Sesgo | Nivel | Impacto |
|---|---|---|
| Sobrerrepresentación de población anglosajona | 🔴 Alto | El modelo debe validarse con población española antes de uso clínico real |
| Muestra reducida en adolescentes (104 registros) | 🔴 Alto | Mayor incertidumbre en ese modelo; interpretar sus métricas con cautela |
| Infradiagnóstico de TEA en mujeres (literatura clínica) | 🟡 Medio | El modelo puede heredar el mismo sesgo si no se monitoriza por sexo |
| Criterios DSM-5 no siempre alineados con guías locales | 🟡 Medio | Revisar equivalencia clínica antes de un despliegue real |
| Datos transversales, sin seguimiento longitudinal | 🟢 Bajo | No permite evaluar evolución del cribado en el tiempo |

---

## 🩺 Marco ético

TesTEA es un prototipo educativo de apoyo al cribado temprano de TEA. No constituye una herramienta diagnóstica ni un producto sanitario aprobado.

El proyecto contempla riesgos asociados a falsos negativos, falsos positivos, sesgos por sexo/género, edad, contexto cultural y limitaciones derivadas del uso de datasets públicos. Cualquier uso real requeriría validación clínica independiente, supervisión profesional, evaluación por subgrupos y cumplimiento estricto de la normativa de protección de datos.

Consulta el análisis completo en [`docs/MARCO_ETICO.md`](docs/MARCO_ETICO.md).

---

## 👩‍💻 Equipo — DataScope Solutions

| Nombre | Rol | GitHub |
|---|---|---|
| Isabella Tellez | Product Owner | [GitHub](https://github.com/Isabela-Tellez) |
| Adriana Aránguez | Scrum Master | [GitHub](https://github.com/adrianaarang) |
| José Manuel Paredes | Desarrollador | [GitHub](https://github.com/SiR0N) |
| Laura Silva | Desarrollador | [GitHub](https://github.com/LauraSilRu) |
| Elizabeth Sena | Desarrollador | — |

---

## 📄 Licencia

Datasets de uso educativo según licencia original de **UCI / Kaggle**.
El código de este proyecto está disponible bajo licencia **MIT**.
