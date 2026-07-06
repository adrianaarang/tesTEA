# TesTEA

Herramienta de cribado temprano de TEA (Trastorno del Espectro Autista) basada en Machine Learning. Predice nivel de riesgo a partir de cuestionarios conductuales (AQ-10/Q-CHAT-10) para asistir a pediatras en decisiones de derivación. Proyecto ético y open-source. **No es una herramienta diagnóstica.**

## Contexto de negocio

Nuestro cliente es una unidad de pediatría de atención primaria que quiere una herramienta de apoyo al cribado temprano de TEA para optimizar derivaciones a neuropediatría. El objetivo es ahorrar dos consultas (dar el test y corregirlo) y citar directamente para diagnóstico a los casos con mayor probabilidad.

## Pregunta de negocio

> Dado un cuestionario de cribado conductual (AQ-10) más datos demográficos básicos, ¿podemos predecir si un caso debe ser derivado a evaluación clínica especializada?

Es un problema de **clasificación binaria** (positivo en cribado / negativo en cribado). Entrenamos un modelo independiente para cada franja de edad, ya que cada una usa una versión distinta del cuestionario.

## Datasets

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

## Estructura del proyecto

```
testtea/
├── README.md
├── requirements.txt
├── .gitignore
├── KANBAN.md
├── data/
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
    ├── index.html
    ├── css/
    │   ├── base.css
    │   ├── theme.css
    │   ├── layout.css
    │   └── components.css
    ├── js/
    │   ├── main.js                   <- Cuestionario AQ-10 interactivo por grupo de edad
    │   ├── data-loader.js            <- Carga metrics.json real
    │   ├── charts.js                 <- Tabla de resultados, importancia, matriz de confusion
    │   └── animations.js
    └── assets/
        ├── data/metrics.json         <- Metricas reales exportadas desde el notebook 04
        └── img/                      <- Graficos generados por los notebooks
```

## Cómo empezar

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/adrianaarang/tesTEA.git
   cd tesTEA
   ```

2. Crear entorno virtual e instalar dependencias:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Descargar los datasets y colocarlos en `data/raw/` (ver tabla de Datasets arriba).

4. Ejecutar los notebooks en orden (01 → 02 → 03 → 04).

5. Para ver el front localmente, servir la carpeta `docs/` con un servidor HTTP simple:
   ```bash
   cd docs
   python -m http.server 8000
   ```
   Y abrir `http://localhost:8000` en el navegador.

## Equipo — DataScope Solutions

| Nombre | Rol |
|---|---|
| Isabella Tellez | Product Owner |
| Adriana Aránguez | Scrum Master |
| José Manuel Paredes | Desarrollador |
| Laura Silva | Desarrollador |
| Elizabeth Sena | Desarrollador |

## Licencia de datos

Datasets de uso educativo según licencia original de UCI/Kaggle.
