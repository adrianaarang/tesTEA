import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    roc_auc_score, 
    roc_curve, 
    confusion_matrix
)

def calculate_metrics(y_true, y_pred, y_proba):
    """
    Calcula las métricas principales de clasificación.
    Prioriza el 'recall' debido al contexto de cribado médico. 
    """
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred),
        "recall": recall_score(y_true, y_pred), # Métrica crítica: Falsos negativos importan más
        "f1": f1_score(y_true, y_pred),
        "auc_roc": roc_auc_score(y_true, y_proba)
    }

def plot_confusion_matrix(y_true, y_pred, model_name):
    """
    Genera y visualiza la matriz de confusión para un modelo específico.
    """
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
    plt.title(f"Confusion Matrix - {model_name}")
    plt.ylabel("Actual")
    plt.xlabel("Predicted")
    plt.show()

def plot_comparative_roc_curve(models_probabilities, y_true):
    """
    Grafica las curvas ROC de múltiples modelos en el mismo lienzo para compararlos.
    'models_probabilities' debe ser un diccionario: {"NombreModelo": y_proba}
    """
    plt.figure(figsize=(8, 6))

    for model_name, y_proba in models_probabilities.items():
        fpr, tpr, _ = roc_curve(y_true, y_proba)
        auc_score = roc_auc_score(y_true, y_proba)
        plt.plot(fpr, tpr, label=f"{model_name} (AUC = {auc_score:.2f})")

    plt.plot([0, 1], [0, 1], 'k--', label="Random Guess")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Comparative ROC Curve")
    plt.legend(loc="lower right")
    plt.grid(True)
    plt.show()

def analyze_false_negatives(X_test, y_true, y_pred):
    """
    Extrae y devuelve las filas correspondientes a los Falsos Negativos.
    Casos donde el paciente tenía TEA pero el modelo predijo que no (Los más críticos).
    """
    # Corrección: pd.DataFrame con 'F' mayúscula
    df_analysis = pd.DataFrame(X_test).copy()
    df_analysis['actual'] = y_true
    df_analysis['predicted'] = y_pred

    # Filtro: Real = 1 (TEA) y Predicho = 0 (No TEA)
    false_negatives = df_analysis[(df_analysis['actual'] == 1) & (df_analysis['predicted'] == 0)]
    return false_negatives