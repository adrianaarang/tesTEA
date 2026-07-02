# Tablero Kanban - Proyecto TesTEA

## Reparto de roles por tarea

Cada persona codifica una tarea, revisa otra y documenta otra.
Nadie hace solo codigo, solo revision o solo documentacion.

| Tarea | Codifica | Revisa (PR) | Documenta |
|---|---|---|---|
| Preprocesamiento | Laura Silva | Adriana Aránguez | José Manuel Paredes|
| Modelado | José Manuel Paredes | Laura Silva | Elizabeth Tena |
| Evaluacion + SHAP | Elizabeth Tena | José Manuel Paredes | Isabela Tellez |
| Front |Adriana Aránguez| Elizabeth Tena | Laura Silva |
| README + marco etico + JSONs | Isabela Tellez | Adriana Aránguez| Elizabeth Tena |

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
- **Documenta:** José Manuela Paredes
- **Definicion de terminado:**
  - [ ] Notebook 02_preprocesamiento.ipynb completo
  - [ ] Funciones reutilizables en src/preprocessing.py
  - [ ] Valores faltantes imputados (mediana para age, moda o "unknown" para categoricas con ?)
  - [ ] Variables categoricas codificadas (One-Hot Encoding)
  - [ ] Variables numericas escaladas (StandardScaler)
  - [ ] Columnas excluidas del feature set: result, Qchat-10-Score, score_total, age_desc, Case_No
  - [ ] Split 80/20 train/test ANTES de ajustar transformaciones (sin data leakage)
  - [ ] Pipeline de scikit-learn construido
  - [ ] train.csv y test.csv guardados en data/processed/
  - [ ] PR revisado y aprobado por Persona 4
  - [ ] Comentarios y celdas markdown escritos por Persona 2

### Modelado (dia 2-4)
- **Codifica:** José Manuel Paredes
- **Revisa:** Laura Silva
- **Documenta:** Elizabeth Tena
- **Definicion de terminado:**
  - [ ] Notebook 03_modelado.ipynb completo
  - [ ] Baseline (predecir siempre la clase mayoritaria)
  - [ ] Regresion Logistica entrenada y evaluada
  - [ ] Random Forest entrenado y evaluado
  - [ ] XGBoost entrenado y evaluado
  - [ ] Validacion cruzada estratificada (5-fold) para cada modelo
  - [ ] Hiperparametros optimizados con GridSearchCV o RandomizedSearchCV
  - [ ] class_weight="balanced" aplicado para manejar desbalance
  - [ ] Modelos guardados con pickle en data/processed/
  - [ ] PR revisado y aprobado por Persona 1
  - [ ] Comentarios y celdas markdown escritos por Persona 3

### Evaluacion y analisis critico (dia 4-5)
- **Codifica:** Elizabeth Tena
- **Revisa:** Juan Manuel Paredes
- **Documenta:** Isabella Tellez
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
- **Revisa:** Elizabeth Tena
- **Documenta:** Laura Silva
- **Definicion de terminado:**
  - [ ] Estructura HTML en docs/index.html
  - [ ] Estilos en docs/css/base.css, theme.css, layout.css, components.css
  - [ ] Scripts en docs/js/main.js, data-loader.js, charts.js, animations.js
  - [ ] Seccion hero con encuadre etico desde la primera pantalla
  - [ ] Visualizacion de importancia de cada pregunta AQ-10
  - [ ] Matriz de confusion interactiva
  - [ ] Metricas explicadas para no tecnicos
  - [ ] Seccion de limitaciones/sesgos como bloque destacado
  - [ ] Integracion de JSONs reales de docs/assets/data/
  - [ ] Responsive y accesible
  - [ ] Desplegable en GitHub Pages desde /docs
  - [ ] PR revisado y aprobado por Persona 3
  - [ ] Comentarios en el codigo escritos por Persona 1

### README, marco etico y exportacion de JSONs (dia 3-6)
- **Codifica:** Isabella Tellez 
- **Revisa:** Adriana Aránguez
- **Documenta:** Elizabeth Tena
- **Definicion de terminado:**
  - [ ] JSONs de metricas exportados a docs/assets/data/metrics.json
  - [ ] README completo: contexto de negocio, marco etico, metodologia, limitaciones, conclusiones
  - [ ] Marco etico con sesgos del dataset documentados (poblacion anglosajona, DSM-5, infradiagnostico en mujeres)
  - [ ] Instrucciones de instalacion y uso actualizadas
  - [ ] Tabla de equipo completada
  - [ ] PR revisado y aprobado por Persona 4
  - [ ] Redaccion final revisada por Persona 3

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
