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
        # CAMBIO: se anade zero_division=0 explicito. Sin esto, cuando un
        # modelo (por ejemplo el Baseline) nunca predice la clase positiva,
        # sklearn devuelve 0.0 igualmente pero lanza un UserWarning cada vez
        # ("Precision is ill-defined..."). Con 4 datasets x 4 modelos son
        # hasta 16 warnings ensuciando la salida del notebook. Al ponerlo
        # explicito, el comportamiento es el mismo (0.0) pero sin el aviso,
        # y queda claro que es una decision consciente, no un descuido.
        "precision": precision_score(y_true, y_pred, zero_division=0),
        "recall": recall_score(y_true, y_pred, zero_division=0), # Métrica crítica: Falsos negativos importan más
        "f1": f1_score(y_true, y_pred, zero_division=0),
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
    # CAMBIO: antes se hacia pd.DataFrame(X_test).copy() y luego se asignaban
    # y_true/y_pred directamente como columnas nuevas. El problema: cuando
    # pandas asigna una Serie a una columna, alinea por INDICE, no por
    # posicion. Si X_test conserva el indice original del train_test_split
    # pero y_true (o y_pred) viene con el indice reseteado -o al reves-,
    # las filas se desalinean SIN ningun error ni aviso: la columna 'actual'
    # se llena de NaN o con el valor de otra fila distinta. Lo comprobamos
    # con un caso de prueba antes de corregirlo.
    #
    # La solucion es forzar que las tres piezas (X_test, y_true, y_pred) se
    # combinen por POSICION, reseteando el indice de las tres antes de
    # juntarlas. Asi, la fila 0 de X_test siempre se empareja con la fila 0
    # de y_true y de y_pred, sin importar que indice tuvieran originalmente.
    df_analysis = pd.DataFrame(X_test).reset_index(drop=True)
    df_analysis['actual'] = pd.Series(y_true).reset_index(drop=True)
    df_analysis['predicted'] = pd.Series(y_pred).reset_index(drop=True)

    # Filtro: Real = 1 (TEA) y Predicho = 0 (No TEA)
    false_negatives = df_analysis[(df_analysis['actual'] == 1) & (df_analysis['predicted'] == 0)]
    return false_negatives
