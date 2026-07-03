# TesTEA

Herramienta de cribado temprano de TEA (Trastorno del Espectro Autista) basada en Machine Learning. Predice nivel de riesgo a partir de cuestionarios conductuales para asistir a pediatras en decisiones de derivacion. Proyecto etico y open-source. No es una herramienta diagnostica.

## Contexto de negocio

Nuestro cliente es una unidad de pediatria de atencion primaria que quiere una herramienta de apoyo al cribado temprano de TEA para optimizar derivaciones a neuropediatria. El objetivo es ahorrar dos consultas (dar el test y corregirlo) y citar directamente para diagnostico a los casos con mayor probabilidad.

## Pregunta de negocio

> Dado un cuestionario de cribado conductual (AQ-10) mas datos demograficos basicos, podemos predecir si un caso debe ser derivado a evaluacion clinica especializada?

Es un problema de **clasificacion binaria** (positivo en cribado / negativo en cribado).

## Datasets

- **autism_screening.csv** — Adultos (704 registros, UCI)
- **Autism_Screening_Data_Combined.csv** — Coleccion agrupada adultos + adolescentes + ninos (6075 registros, Kaggle)
- **Toddler_Autism_dataset_July_2018.csv** — Toddlers (1054 registros, Kaggle)

Los datasets no se incluyen en el repositorio por licencia. Descargar y colocar en `data/raw/`.

## Marco etico

TesTEA se posiciona como una herramienta de apoyo al cribado, no de diagnostico automatizado. Reconocemos los sesgos potenciales de los datos (sobrerrepresentacion de poblacion anglosajona, criterios DSM-5) y recomendamos validacion continua en multiples contextos. El bienestar y la autonomia de las personas evaluadas son nuestra prioridad.

## Estructura del proyecto

```
testtea/
├── README.md
├── requirements.txt
├── .gitignore
├── KANBAN.md
├── data/
│   ├── raw/                          <- CSVs originales (no versionados)
│   └── processed/                    <- Datos limpios tras preprocesamiento
├── notebooks/
│   ├── 01_eda.ipynb                  <- Exploracion y limpieza
│   ├── 02_preprocesamiento.ipynb     <- Encoding, escalado, split
│   ├── 03_modelado.ipynb             <- Baseline + Logistica + Random Forest + XGBoost
│   └── 04_evaluacion_analisis.ipynb  <- Metricas, ROC, SHAP, analisis critico
├── src/
│   ├── __init__.py
│   ├── preprocessing.py              <- Funciones de carga y preprocesamiento
│   └── evaluate.py                   <- Funciones de metricas y comparacion
└── docs/                             <- Front (GitHub Pages)
    ├── index.html
    ├── css/
    │   ├── base.css
    │   ├── theme.css
    │   ├── layout.css
    │   └── components.css
    ├── js/
    │   ├── main.js
    │   ├── data-loader.js
    │   ├── charts.js
    │   └── animations.js
    └── assets/
        ├── data/                     <- JSONs con metricas del modelo
        └── img/                      <- Graficos generados por los notebooks
```

## Como empezar

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

3. Descargar los datasets y colocarlos en `data/raw/`.

4. Ejecutar los notebooks en orden (01 -> 02 -> 03 -> 04).

## Equipo — DataScope Solutions

| Nombre | Rol |
|---|---|
| Isabella Tellez | Product Owner |
| Adriana Aránguez | Scrum Master |
| José Manuel Paredes| Desarrollador |
| Laura Silva| Desarrollador |
| Elizabeth Sena| Desarrollador |

## Licencia de datos

Datasets de uso educativo segun licencia original de UCI/Kaggle.
