# 🧩 TesTEA

<<<<<<< HEAD
<div align="center">
=======
Herramienta de cribado temprano de TEA (Trastorno del Espectro Autista) basada en Machine Learning. Predice nivel de riesgo a partir de cuestionarios conductuales (AQ-10/Q-CHAT-10) para asistir a pediatras en decisiones de derivación. Proyecto ético y open-source. **No es una herramienta diagnóstica.**
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521

**Herramienta de cribado temprano de TEA basada en Machine Learning**

<<<<<<< HEAD
Proyecto I · Módulo III · Bootcamp IA & Big Data · Somos F5 / Saturno Academy · 2026
=======
Nuestro cliente es una unidad de pediatría de atención primaria que quiere una herramienta de apoyo al cribado temprano de TEA para optimizar derivaciones a neuropediatría. El objetivo es ahorrar dos consultas (dar el test y corregirlo) y citar directamente para diagnóstico a los casos con mayor probabilidad.
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Demo-222222?logo=github&logoColor=white)](https://adrianaarang.github.io/tesTEA/)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![scikit--learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?logo=scikitlearn&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green)

<<<<<<< HEAD
</div>

---
=======
> Dado un cuestionario de cribado conductual (AQ-10) más datos demográficos básicos, ¿podemos predecir si un caso debe ser derivado a evaluación clínica especializada?

Es un problema de **clasificación binaria** (positivo en cribado / negativo en cribado). Entrenamos un modelo independiente para cada franja de edad, ya que cada una usa una versión distinta del cuestionario.
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521

## 📋 Descripción del proyecto

<<<<<<< HEAD
TesTEA es una herramienta de Business Intelligence y Machine Learning orientada a **unidades de pediatría de atención primaria** que quieren optimizar sus derivaciones a neuropediatría.

El proyecto transforma cuatro datasets públicos de cribado de autismo (basados en el cuestionario estandarizado **AQ-10 / Q-CHAT-10**) en un modelo predictivo y un front interactivo que responde preguntas clave:

- ¿Podemos predecir, a partir del cuestionario AQ-10 y datos demográficos básicos, si un caso debe derivarse a evaluación clínica especializada?
- ¿Qué preguntas del cuestionario tienen más poder discriminativo?
- ¿Cómo varía el rendimiento del modelo entre franjas de edad (adultos, adolescentes, niños, toddlers)?
- ¿Qué sesgos contienen los datos disponibles y qué impacto tendrían en un despliegue clínico real?

**No es una herramienta diagnóstica.** Es un apoyo al cribado inicial, pensado para ahorrar las dos consultas que hoy requiere administrar y corregir el test en papel.
=======
| Dataset | Origen | Registros | Franja de edad |
|---|---|---|---|
| `autism_screening.csv` | UCI | 704 | Adultos |
| `Autism-Adolescent-Data.arff` | UCI | 104 | Adolescentes |
| `Autism_Screening_Data_Combined.csv` | Kaggle | 6.075 | Adultos + adolescentes + niños (agrupado) |
| `Toddler_Autism_dataset_July_2018.csv` | Kaggle | 1.054 | Toddlers |

**Total: 7.937 registros** entre los cuatro datasets.

Los datasets no se incluyen en el repositorio por licencia. Descargar y colocar en `data/raw/`. El dataset de adolescentes viene en formato `.arff`, no `.csv`; el pipeline de `src/preprocessing.py` lo decodifica automáticamente.

## Marco ético

TesTEA se posiciona como una herramienta de apoyo al cribado, no de diagnóstico automatizado. Los resultados son orientativos y no sustituyen la evaluación clínica de un profesional especializado.

Reconocemos explícitamente las siguientes limitaciones:

- **Sesgo poblacional**: los datos están sobrerrepresentados en población anglosajona y usan criterios DSM-5, por lo que el modelo debería validarse con población española antes de un uso clínico real.
- **Sesgo de género**: el TEA se diagnostica con más frecuencia en hombres, pero hay evidencia de infradiagnóstico en mujeres por presentación clínica diferente. Recomendamos monitorizar el rendimiento del modelo por sexo.
- **Muestra reducida en adolescentes**: el dataset de adolescentes tiene solo 104 registros, muy por debajo de los otros tres grupos. El modelo para esta franja de edad tiene mayor incertidumbre y debe interpretarse con más cautela.

El bienestar y la autonomía de las personas evaluadas son nuestra prioridad por encima de cualquier métrica.

## Metodología

- **Preprocesamiento**: imputación de nulos, codificación one-hot de variables categóricas, escalado de variables numéricas, y agrupación de categorías poco frecuentes (implementada como transformer de scikit-learn con `fit`/`transform`, para evitar fuga de datos y funcionar igual en producción con un único paciente).
- **Modelado**: Baseline, Regresión Logística, Random Forest y XGBoost, con validación cruzada estratificada de 5 folds y búsqueda de hiperparámetros optimizada para **recall** (no accuracy ni F1), porque en cribado médico un falso negativo es más grave que un falso positivo.
- **Evaluación**: el test set se mantiene aislado hasta la evaluación final. Se reporta accuracy, precisión, recall, F1 y AUC-ROC por cada grupo de edad y modelo.

## Resultados

| Grupo | Mejor modelo | Recall | F1 | Precisión | n test |
|---|---|---|---|---|---|
| Adultos | XGBoost | 0.97 | 0.97 | 0.97 | 141 |
| Adolescentes | Regresión Logística | 1.00 | 1.00 | 1.00 | 21 |
| Combinado | XGBoost | 1.00 | 0.99 | 0.98 | 1.215 |
| Toddlers | Regresión Logística | 1.00 | 1.00 | 1.00 | 211 |

El grupo **combinado** es el resultado más robusto estadísticamente (mayor tamaño de test). Los recalls perfectos en adolescentes y toddlers deben interpretarse con cautela: sus test sets son mucho más pequeños (21 y 211 registros), por lo que esas cifras tienen más varianza de la que aparentan.
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521

---

## 🖥️ Demo

[![▶ Ver demo en vivo](https://img.shields.io/badge/▶%20Ver%20demo%20en%20vivo-adrianaarang.github.io/tesTEA-222222?style=for-the-badge&logo=github)](https://adrianaarang.github.io/tesTEA/)

El front incluye un cuestionario AQ-10 interactivo (elige tu grupo de edad y responde las 10 preguntas) y un panel de resultados con las métricas reales de los 4 modelos entrenados.

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
<<<<<<< HEAD
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
=======
│   ├── raw/                          <- CSVs/ARFF originales (no versionados)
│   └── processed/                    <- Datos limpios + preprocessors (.pkl) tras preprocesamiento
├── notebooks/
│   ├── 01_eda.ipynb                  <- Exploracion y limpieza (4 datasets)
│   ├── 02_preprocesamiento.ipynb     <- Encoding, escalado, split, agrupacion de categorias raras
│   ├── 03_modelado.ipynb             <- Baseline + Logistica + Random Forest + XGBoost
│   └── 04_evaluacion_analisis.ipynb  <- Metricas, ROC, SHAP, analisis critico
├── src/
│   ├── __init__.py
│   ├── preprocessing.py              <- Pipeline de preprocesamiento (config por dataset + RareCategoryGrouper)
│   └── evaluate.py                   <- Funciones de metricas y comparacion
└── docs/                             <- Front (GitHub Pages)
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521
    ├── index.html
    ├── css/
    │   ├── base.css
    │   ├── theme.css
    │   ├── layout.css
    │   └── components.css
    ├── js/
<<<<<<< HEAD
    │   ├── main.js                   # Cuestionario AQ-10 interactivo por grupo de edad
    │   ├── data-loader.js            # Carga metrics.json real
    │   ├── charts.js                 # Tabla de resultados, importancia, matriz de confusion
    │   └── animations.js
    └── assets/
        ├── data/metrics.json         # Metricas reales exportadas desde el notebook 04
        └── img/                      # Graficos generados por los notebooks
```

---
=======
    │   ├── main.js                   <- Cuestionario AQ-10 interactivo por grupo de edad
    │   ├── data-loader.js            <- Carga metrics.json real
    │   ├── charts.js                 <- Tabla de resultados, importancia, matriz de confusion
    │   └── animations.js
    └── assets/
        ├── data/metrics.json         <- Metricas reales exportadas desde el notebook 04
        └── img/                      <- Graficos generados por los notebooks
```

## Cómo empezar
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso | Justificación |
|---|---|---|
| **Python + pandas** | Carga y preprocesamiento | Estándar de facto para análisis tabular |
| **scikit-learn** | Pipelines, encoding, modelos base | `ColumnTransformer` + `Pipeline` evitan data leakage de forma nativa |
| **XGBoost** | Modelo de gradient boosting | Mejor rendimiento en 2 de los 4 grupos de edad |
| **GridSearchCV + StratifiedKFold** | Validación y ajuste de hiperparámetros | Robusto en datasets pequeños (ej. adolescentes, 104 registros) sin sacrificar un validation set fijo |
| **HTML/CSS/JS (vanilla)** | Front interactivo | Sin build, despliegue directo en GitHub Pages desde `/docs` |
| **GitHub Pages** | Hosting del front | Gratuito, integrado con el repositorio |

<<<<<<< HEAD
### ¿Por qué un modelo por franja de edad y no uno único?

Cada franja de edad usa una versión distinta del cuestionario (AQ-10 vs Q-CHAT-10) y columnas demográficas diferentes. Forzar un espacio de features común implicaría perder información o inventar valores. La validación clínica original del AQ-10 también se hizo por separado en cada franja, así que replicar esa separación en el modelado es fiel al diseño del instrumento.
=======
3. Descargar los datasets y colocarlos en `data/raw/` (ver tabla de Datasets arriba).

4. Ejecutar los notebooks en orden (01 → 02 → 03 → 04).

5. Para ver el front localmente, servir la carpeta `docs/` con un servidor HTTP simple:
   ```bash
   cd docs
   python -m http.server 8000
   ```
   Y abrir `http://localhost:8000` en el navegador.
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521

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
| 📈 Resultados | Resumen destacado + tabla completa de las 4 franjas × 4 modelos |
| ✅ Cuestionario | AQ-10/Q-CHAT-10 interactivo, con resultado de cribado en tiempo real |
| 🎯 Conclusión | Recomendaciones al cliente y próximos pasos |

---

## 🔍 Hallazgos principales

- El grupo **combinado** (adultos+adolescentes+niños) alcanza **recall = 1.00** con XGBoost sobre 1.215 registros de test, el resultado más robusto estadísticamente.
- Las preguntas del AQ-10 con mayor poder discriminativo varían por franja de edad, pero A5, A6 y A9 aparecen consistentemente entre las más importantes.
- El grupo de **adultos** alcanza recall = 0.97 con XGBoost; **adolescentes** y **toddlers** alcanzan recall = 1.00 con Regresión Logística, aunque sobre test sets mucho más pequeños (21 y 211 registros).
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

TesTEA se posiciona como una herramienta de **apoyo al cribado, no de diagnóstico automatizado**. Los resultados son orientativos y no sustituyen la evaluación clínica de un profesional especializado. El bienestar y la autonomía de las personas evaluadas son nuestra prioridad por encima de cualquier métrica.

---

## 👩‍💻 Equipo — DataScope Solutions

| Nombre | Rol |
|---|---|
| Isabella Tellez | Product Owner |
| Adriana Aránguez | Scrum Master |
| José Manuel Paredes | Desarrollador |
| Laura Silva | Desarrollador |
| Elizabeth Sena | Desarrollador |

[![GitHub](https://img.shields.io/badge/GitHub-adrianaarang-181717?logo=github)](https://github.com/adrianaarang)

<<<<<<< HEAD
---

## 📄 Licencia

Datasets de uso educativo según licencia original de **UCI / Kaggle**.
El código de este proyecto está disponible bajo licencia **MIT**.
=======
Datasets de uso educativo según licencia original de UCI/Kaggle.
>>>>>>> 085ca610c0a91951de12d30da5eea897a247b521
