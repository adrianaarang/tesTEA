# Tablero Kanban - Proyecto TesTEA

## Reparto de roles por tarea

Cada persona codifica una tarea, revisa otra y documenta otra.
Nadie hace solo codigo, solo revision o solo documentacion.

| Tarea | Codifica | Revisa (PR) | Documenta |
|---|---|---|---|
| Preprocesamiento | Laura Silva | Adriana Aránguez | José Manuel Paredes|
| Modelado | José Manuel Paredes | Laura Silva | Elizabeth Sena |
| Evaluacion + SHAP | Isabella Tellez | José Manuel Paredes | Elizabeth Sena |
| Front |Adriana Aránguez| Elizabeth Sena | Laura Silva |
| README + marco etico + JSONs | Elizabeth Sena | Adriana Aránguez| Isabella Tellez |

- **Codifica:** escribe el codigo y lo sube en su rama
- **Revisa:** hace code review del PR antes de hacer merge a main
- **Documenta:** escribe los comentarios en primera persona y las celdas markdown del notebook o la seccion correspondiente del README

## Terminado

### EDA
- **Codifica:** Todo el equipo
- **Definicion de terminado:**
  - [x] Datasets cargados y explorados (adults, combined, toddlers)
  - [x] Valores faltantes identificados (2 nulos en age de adults)
  - [x] Distribucion del target analizada (desbalance de clases documentado)
  - [x] Correlaciones entre variables numericas calculadas
  - [x] Respuestas AQ-10 analizadas por clase
  - [x] Graficos exportados a docs/assets/img/
  - [x] Decisiones para preprocesamiento documentadas
  - [x] Notebook 01_eda.ipynb completo

## En Progreso

## Backlog

### Preprocesamiento (dia 1-2)
- **Codifica:** Laura Silva
- **Revisa:** Adriana Aránguez
- **Documenta:** José Manuel Paredes
- **Definicion de terminado:**
  - [x] Notebook 02_preprocesamiento.ipynb completo
  - [x] Funciones reutilizables en src/preprocessing.py
  - [x] Valores faltantes imputados (mediana para age, moda o "unknown" para categoricas con ?)
  - [x] Variables categoricas codificadas (One-Hot Encoding)
  - [x] Variables numericas escaladas (StandardScaler)
  - [x] Columnas excluidas del feature set: result, Qchat-10-Score, score_total, age_desc, Case_No
  - [x] Split 80/20 train/test ANTES de ajustar transformaciones (sin data leakage)
  - [x] Pipeline de scikit-learn construido
  - [x] train.csv y test.csv guardados en data/processed/
  - [x] PR revisado y aprobado por Persona 4
  - [x] Comentarios y celdas markdown escritos por Persona 2

### Modelado (dia 2-4)
- **Codifica:** José Manuel Paredes
- **Revisa:** Laura Silva
- **Documenta:** Elizabeth Sena
- **Definicion de terminado:**
  - [x] Notebook 03_modelado.ipynb completo
  - [x] Baseline (predecir siempre la clase mayoritaria)
  - [x] Regresion Logistica entrenada y evaluada
  - [x] Random Forest entrenado y evaluado
  - [x] XGBoost entrenado y evaluado
  - [x] Validacion cruzada estratificada (5-fold) para cada modelo
  - [x] Hiperparametros optimizados con GridSearchCV o RandomizedSearchCV
  - [x] class_weight="balanced" aplicado para manejar desbalance
  - [x] Modelos guardados con pickle en data/processed/
  - [x] PR revisado y aprobado por Persona 1
  - [x] Comentarios y celdas markdown escritos por Persona 3

### Evaluacion y analisis critico (dia 4-5)
- **Codifica:** Isabella Tellez
- **Revisa:** Juan Manuel Paredes
- **Documenta:** Elizabeth Sena
- **Definicion de terminado:**
  - [ ] Notebook 04_evaluacion_analisis.ipynb completo
  - [ ] Funciones reutilizables en src/evaluate.py
  - [ ] Metricas calculadas: accuracy, precision, recall, F1, AUC-ROC
  - [ ] Recall priorizado como metrica principal (contexto de cribado medico)
  - [ ] Matriz de confusion visualizada para cada modelo
  - [ ] Curva ROC comparativa
  - [ ] SHAP o importancia de variables para interpretar el mejor modelo
  - [ ] Comparacion de rendimiento entre grupos de edad
  - [ ] Analisis de falsos negativos (los mas criticos en cribado)
  - [ ] PR revisado y aprobado por Persona 2
  - [ ] Comentarios y celdas markdown escritos por Persona 5

### Front completo (dia 2-6)
- **Codifica:** Adriana Aránguez
- **Revisa:** Elizabeth Sena
- **Documenta:** Laura Silva
- **Definicion de terminado:**
  - [x] Estructura HTML en docs/index.html
  - [x] Estilos en docs/css/base.css, theme.css, layout.css, components.css
  - [x] Scripts en docs/js/main.js, data-loader.js, charts.js, animations.js
  - [x] Seccion hero con encuadre etico desde la primera pantalla
  - [x] Visualizacion de importancia de cada pregunta AQ-10
  - [x] Matriz de confusion interactiva
  - [x] Metricas explicadas para no tecnicos
  - [x] Seccion de limitaciones/sesgos como bloque destacado
  - [x] Integracion de JSONs reales de docs/assets/data/
  - [x] Responsive y accesible
  - [ ] Desplegable en GitHub Pages desde /docs
  - [x] PR revisado y aprobado por Isabella
  - [x] Comentarios en el codigo escritos por Persona 1

### README, marco etico y exportacion de JSONs (dia 3-6)
- **Codifica:** Elizabeth Sena
- **Revisa:** Adriana Aránguez
- **Documenta:**Isabella Tellez
- **Definicion de terminado:**
  - [x] JSONs de metricas exportados a docs/assets/data/metrics.json
  - [x] README completo: contexto de negocio, marco etico, metodologia, limitaciones, conclusiones
  - [x] Marco etico con sesgos del dataset documentados (poblacion anglosajona, DSM-5, infradiagnostico en mujeres)
  - [x] Instrucciones de instalacion y uso actualizadas
  - [x] Tabla de equipo completada
  - [x] PR revisado y aprobado por Persona 4
  - [x] Redaccion final revisada por Persona 3

### Slides y pitch (dia 5-7)
- **Responsable:** Todo el equipo
- **Reparto de slides:**
  - [ ] Persona 1: slide "Proceso: que hemos hecho y por que" (preprocesamiento)
  - [ ] Persona 2: slide "Resultados: que dice el modelo, que metricas"
  - [ ] Persona 3: slide "Limitaciones, sesgos y mejoras posibles"
  - [ ] Persona 4: demo en vivo del front
  - [ ] Persona 5: slides "Quienes somos" + "Conclusion: que le recomendamos al cliente"
- **Definicion de terminado:**
  - [ ] Pitch ensayado al menos 2 veces
  - [ ] Duracion ajustada a 10-12 minutos
  - [ ] Feedback incorporado tras ensayos

## Dependencias entre tareas

Persona 1 (preprocesamiento) desbloquea a Persona 2 (modelado)
Persona 2 (modelado) desbloquea a Persona 3 (evaluacion)
Persona 3 (evaluacion) desbloquea a Persona 5 (JSONs)
Persona 5 (JSONs) desbloquea a Persona 4 (front, datos reales)
Persona 4 (front) puede empezar desde el dia 2 con datos dummy del EDA
Slides (todo el equipo) empieza cuando hay resultados del modelado (dia 5)

## Ramas Git

Cada persona trabaja en su propia rama y abre PR para merge a main:
- feature/preprocesamiento (Persona 1)
- feature/modelado (Persona 2)
- feature/evaluacion (Persona 3)
- feature/front (Persona 4)
- feature/readme-docs (Persona 5)

## Contratos acordados (dia 1)

### Formato de data/processed/train.csv y test.csv
- Columnas: A1-A10, age (escalado), gender, ethnicity, jaundice, family_asd, target
- Target: 0 = no TEA, 1 = TEA
- Sin columnas de ID, result, score_total ni age_desc

### Formato de docs/assets/data/metrics.json
```json
{
  "models": [
    {
      "name": "Baseline",
      "accuracy": 0.00,
      "precision": 0.00,
      "recall": 0.00,
      "f1": 0.00,
      "auc_roc": 0.00,
      "confusion_matrix": [[0, 0], [0, 0]]
    }
  ],
  "feature_importance": [
    {"feature": "A1", "importance": 0.00}
  ],
  "best_model": "nombre_del_mejor_modelo"
}
```
