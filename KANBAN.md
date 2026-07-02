# Tablero Kanban - Proyecto TesTEA

## Terminado

### EDA
- **Responsable:** todo el equipo
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
- **Responsable:** Persona 1
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

### Modelado (dia 2-4)
- **Responsable:** Persona 2
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

### Evaluacion y analisis critico (dia 4-5)
- **Responsable:** Persona 3
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
  - [ ] JSONs de metricas exportados a docs/assets/data/
  - [ ] Marco etico escrito en el README
  - [ ] Secciones de Metodologia, Limitaciones y Conclusiones del README completas

### Front completo (dia 2-6)
- **Responsable:** Persona 4
- **Definicion de terminado:**
  - [ ] Estructura HTML en docs/index.html
  - [ ] Estilos en docs/css/base.css, theme.css, layout.css, components.css
  - [ ] Scripts en docs/js/main.js, data-loader.js, charts.js, animations.js
  - [ ] Seccion hero con encuadre etico desde la primera pantalla
  - [ ] Visualizacion de importancia de cada pregunta AQ-10
  - [ ] Matriz de confusion interactiva
  - [ ] Metricas explicadas para no tecnicos
  - [ ] Seccion de limitaciones/sesgos como bloque destacado
  - [ ] Integracion de JSONs reales de docs/assets/data/ (cuando Persona 3 los exporte)
  - [ ] Responsive y accesible
  - [ ] Desplegable en GitHub Pages desde /docs

### Slides, pitch y documentacion (dia 3-7)
- **Responsable:** Persona 5
- **Definicion de terminado:**
  - [ ] Slides con estructura del enunciado:
    - [ ] Quienes somos (equipo y rol en DataScope Solutions)
    - [ ] El problema del cliente: que pregunta queremos responder
    - [ ] Los datasets: de donde vienen y que contienen
    - [ ] Proceso: que hemos hecho y por que (decisiones clave)
    - [ ] Resultados: que dice el modelo, que metricas hemos usado
    - [ ] Limitaciones, sesgos y mejoras posibles
    - [ ] Conclusion: que le recomendamos al cliente
  - [ ] Marco etico integrado en la narrativa del pitch
  - [ ] README final revisado y completo
  - [ ] Pitch ensayado al menos 2 veces con el equipo
  - [ ] Duracion ajustada a 10-12 minutos
  - [ ] Feedback incorporado tras ensayos

## Dependencias entre tareas

Persona 1 (preprocesamiento) desbloquea a Persona 2 (modelado)
Persona 2 (modelado) desbloquea a Persona 3 (evaluacion)
Persona 3 (evaluacion) desbloquea a Persona 4 (front, datos reales) y Persona 5 (slides con resultados)
Persona 4 (front) puede empezar desde el dia 2 con datos dummy del EDA

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
