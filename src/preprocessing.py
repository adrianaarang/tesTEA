from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.base import BaseEstimator, TransformerMixin


# ============================================================
# CONFIGURACION DE DATASETS
# ============================================================

DATASET_CONFIG = {
    "adults": {
        "target": "Class/ASD",
        "target_map": {
            "YES": 1, "NO": 0,
            "Yes": 1, "No": 0,
            "yes": 1, "no": 0
        },
        "drop_cols": ["result", "age_desc", "score_total"],
        "numeric_cols": ["age"],
        "categorical_cols": [
            "gender",
            "ethnicity",
            "jundice",
            "austim",
            "contry_of_res",
            "used_app_before",
            "relation"
        ],
        "aq_cols": [
            "A1_Score", "A2_Score", "A3_Score", "A4_Score", "A5_Score",
            "A6_Score", "A7_Score", "A8_Score", "A9_Score", "A10_Score"
        ],
        # Estas columnas pueden generar muchas categorías tras one-hot
        "group_rare_cols": ["ethnicity", "contry_of_res", "relation"],
        "rare_min_freq": 5
    },

    "combined": {
        "target": "Class",
        "target_map": {
            "YES": 1, "NO": 0,
            "Yes": 1, "No": 0,
            "yes": 1, "no": 0
        },
        "drop_cols": ["score_total"],
        "numeric_cols": ["Age"],
        "categorical_cols": [
            "Sex",
            "Jauundice",
            "Family_ASD"
        ],
        "aq_cols": [
            "A1", "A2", "A3", "A4", "A5",
            "A6", "A7", "A8", "A9", "A10"
        ],
        # No necesita agrupación de raras
        "group_rare_cols": [],
        "rare_min_freq": 5
    },

    "toddlers": {
        "target": "Class/ASD Traits ",
        "target_map": {
            "YES": 1, "NO": 0,
            "Yes": 1, "No": 0,
            "yes": 1, "no": 0
        },
        "drop_cols": ["Qchat-10-Score", "Case_No", "score_total"],
        "numeric_cols": ["Age_Mons"],
        "categorical_cols": [
            "Sex",
            "Ethnicity",
            "Jaundice",
            "Family_mem_with_ASD",
            "Who completed the test"
        ],
        "aq_cols": [
            "A1", "A2", "A3", "A4", "A5",
            "A6", "A7", "A8", "A9", "A10"
        ],
        "group_rare_cols": ["Ethnicity"],
        "rare_min_freq": 5
    },

    "adolescents": {
        "target": "Class/ASD",
        "target_map": {
            "YES": 1, "NO": 0,
            "Yes": 1, "No": 0,
            "yes": 1, "no": 0
        },
        "drop_cols": ["result", "age_desc", "score_total"],
        "numeric_cols": ["age"],
        "categorical_cols": [
            "gender",
            "ethnicity",
            "jundice",
            "austim",
            "contry_of_res",
            "used_app_before",
            "relation"
        ],
        "aq_cols": [
            "A1_Score", "A2_Score", "A3_Score", "A4_Score", "A5_Score",
            "A6_Score", "A7_Score", "A8_Score", "A9_Score", "A10_Score"
        ],
        # En adolescents interesa agrupar más porque el dataset es pequeño
        "group_rare_cols": ["ethnicity", "contry_of_res", "relation"],
        "rare_min_freq": 10
    }
}


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def load_dataset(path):
    """
    Carga un CSV desde la ruta indicada.
    """
    return pd.read_csv(path)


def decode_arff_bytes(df):
    """
    Decodifica a string las columnas de tipo bytes que vienen de un .arff.
    No afecta a datasets que ya son strings (CSV), esos se quedan igual.
    """
    df = df.copy()
    for col in df.select_dtypes([object]).columns:
        if df[col].apply(lambda x: isinstance(x, bytes)).any():
            df[col] = df[col].str.decode("utf-8")
    return df


def clean_question_marks(df):
    """
    Reemplaza '?' por NaN para poder imputar después.
    """
    df = df.copy()
    df.replace("?", np.nan, inplace=True)
    return df


class RareCategoryGrouper(BaseEstimator, TransformerMixin):
    """
    Agrupa en 'other' las categorías poco frecuentes de determinadas
    columnas categóricas, aprendiendo qué categorías son frecuentes
    SOLO con los datos de entrenamiento.
    """

    def __init__(self, min_freq=5, columns=None):
        self.min_freq = min_freq
        self.columns = columns

    def fit(self, X, y=None):
        """
        Aprende, a partir de X_train, qué categorías se consideran
        frecuentes en cada columna.
        """
        X = pd.DataFrame(X).copy()

        # Si no se especifican columnas, usamos todas las de X
        self.columns_ = self.columns if self.columns is not None else X.columns.tolist()

        # Diccionario: columna -> conjunto de categorías frecuentes
        self.frequent_categories_ = {}

        for col in self.columns_:
            if col in X.columns:
                counts = X[col].value_counts(dropna=True)
                frequent = counts[counts >= self.min_freq].index.tolist()
                self.frequent_categories_[col] = set(frequent)

        return self

    def transform(self, X):
        """
        Reemplaza por 'other' las categorías que no se aprendieron
        como frecuentes en fit().
        """
        X = pd.DataFrame(X).copy()

        for col, frequent_values in self.frequent_categories_.items():
            if col in X.columns:
                X[col] = X[col].apply(
                    lambda x: x if pd.isna(x) or x in frequent_values else "other"
                )

        return X

    def get_feature_names_out(self, input_features=None):
        """
        Devuelve los mismos nombres de columnas de entrada, porque este
        transformer no crea ni elimina columnas: solo reemplaza valores
        poco frecuentes por 'other'.
        """
        if input_features is None:
            return np.array(self.columns_, dtype=object)
        return np.array(input_features, dtype=object)


def drop_existing_columns(df, columns_to_drop):
    """
    Elimina solo las columnas que existan realmente en el dataframe.
    Así evitamos errores si una columna no está en ese dataset.
    """
    df = df.copy()
    existing_cols = [col for col in columns_to_drop if col in df.columns]
    df.drop(columns=existing_cols, inplace=True)
    return df


def encode_target(df, target_col, target_map):
    """
    Convierte la columna target a 0/1 usando el diccionario target_map.
    """
    df = df.copy()
    df[target_col] = df[target_col].map(target_map)

    n_nulos = df[target_col].isnull().sum()
    if n_nulos > 0:
        raise ValueError(
            f"{n_nulos} valores de '{target_col}' no reconocidos en target_map. "
            f"Revisa el diccionario target_map o los datos originales."
        )

    return df


def split_features_target(df, target_col):
    """
    Separa X e y.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]
    return X, y


def build_preprocessor(
    numeric_cols,
    categorical_cols,
    passthrough_cols,
    rare_group_cols=None,
    rare_min_freq=5
):
    """
    Construye el preprocesador con:
    - numéricas: imputación por mediana + StandardScaler
    - categóricas normales: imputación + OneHotEncoder
    - categóricas con rare grouping: imputación + RareCategoryGrouper + OneHotEncoder
    - AQ cols: passthrough

    rare_group_cols permite indicar qué columnas categóricas deben agrupar
    categorías poco frecuentes en 'other'.
    """

    rare_group_cols = rare_group_cols or []

    # Separar categóricas en dos grupos:
    # 1) las que sí llevan agrupación de raras
    # 2) las que no
    rare_categorical_cols = [col for col in categorical_cols if col in rare_group_cols]
    normal_categorical_cols = [col for col in categorical_cols if col not in rare_group_cols]

    numeric_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="unknown")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    rare_categorical_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="unknown")),
        ("rare_grouper", RareCategoryGrouper(min_freq=rare_min_freq)),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    transformers = [
        ("num", numeric_pipeline, numeric_cols),
        ("aq", "passthrough", passthrough_cols)
    ]

    # Solo añadimos el bloque de categóricas normales si hay columnas
    if normal_categorical_cols:
        transformers.append(
            ("cat", categorical_pipeline, normal_categorical_cols)
        )

    # Solo añadimos el bloque de categóricas con rare grouping si hay columnas
    if rare_categorical_cols:
        transformers.append(
            ("cat_rare", rare_categorical_pipeline, rare_categorical_cols)
        )

    preprocessor = ColumnTransformer(transformers=transformers)

    return preprocessor


def preprocess_single_dataset(df, config, test_size=0.2, random_state=42):
    """
    Preprocesa un dataset completo según su configuración:
    1. decodifica bytes si vienen de un .arff
    2. limpia '?'
    3. codifica el target
    4. elimina columnas no deseadas
    5. separa X e y
    6. hace train/test split
    7. construye el preprocesador
    8. ajusta el preprocesador SOLO con train
       (incluyendo imputación, agrupación de categorías raras y codificación)
    9. transforma train y test
    10. devuelve train_df, test_df y el preprocessor
    """

    df = df.copy()

    # 1) Decodificar bytes si el dataset viene de un .arff
    df = decode_arff_bytes(df)

    # 2) Reemplazar '?' por NaN
    df = clean_question_marks(df)

    # 3) Codificar target
    target_col = config["target"]
    df = encode_target(df, target_col, config["target_map"])

    # 4) Eliminar columnas no deseadas
    df = drop_existing_columns(df, config["drop_cols"])

    # 5) Separar X e y
    X, y = split_features_target(df, target_col)

    # 6) Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    # 7) Construir preprocessor
    preprocessor = build_preprocessor(
        numeric_cols=config["numeric_cols"],
        categorical_cols=config["categorical_cols"],
        passthrough_cols=config["aq_cols"],
        rare_group_cols=config.get("group_rare_cols", []),
        rare_min_freq=config.get("rare_min_freq", 5)
    )

    # 8) Ajustar SOLO con train y transformar train/test
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # 9) Si el resultado es sparse matrix, convertirlo a array denso
    if hasattr(X_train_processed, "toarray"):
        X_train_processed = X_train_processed.toarray()

    if hasattr(X_test_processed, "toarray"):
        X_test_processed = X_test_processed.toarray()

    # 10) Recuperar nombres de columnas transformadas
    feature_names = preprocessor.get_feature_names_out()

    # 11) Convertir a DataFrame
    X_train_processed_df = pd.DataFrame(
        X_train_processed,
        columns=feature_names,
        index=X_train.index
    )

    X_test_processed_df = pd.DataFrame(
        X_test_processed,
        columns=feature_names,
        index=X_test.index
    )

    # 12) Añadir target
    train_df = X_train_processed_df.copy()
    train_df["target"] = y_train.values

    test_df = X_test_processed_df.copy()
    test_df["target"] = y_test.values

    return train_df, test_df, preprocessor


def save_processed_data(train_df, test_df, output_dir, prefix):
    """
    Guarda train y test procesados con un prefijo.
    Ejemplo:
    adults_train.csv
    adults_test.csv
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    train_path = output_dir / f"{prefix}_train.csv"
    test_path = output_dir / f"{prefix}_test.csv"

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    print(f"Guardado: {train_path}")
    print(f"Guardado: {test_path}")


def save_preprocessor(preprocessor, output_dir, prefix):
    """
    Guarda el preprocessor entrenado con joblib.
    Ejemplo: adults_preprocessor.pkl
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    preprocessor_path = output_dir / f"{prefix}_preprocessor.pkl"
    joblib.dump(preprocessor, preprocessor_path)

    print(f"Guardado: {preprocessor_path}")


def preprocess_and_save_dataset(df, dataset_name, output_dir, test_size=0.2, random_state=42):
    """
    Función de alto nivel:
    - busca la config del dataset
    - lo preprocesa
    - guarda train/test
    - guarda el preprocessor entrenado
    - devuelve train_df, test_df y preprocessor
    """
    if dataset_name not in DATASET_CONFIG:
        raise ValueError(f"Dataset '{dataset_name}' no está en DATASET_CONFIG.")

    config = DATASET_CONFIG[dataset_name]

    train_df, test_df, preprocessor = preprocess_single_dataset(
        df=df,
        config=config,
        test_size=test_size,
        random_state=random_state
    )

    save_processed_data(
        train_df=train_df,
        test_df=test_df,
        output_dir=output_dir,
        prefix=dataset_name
    )

    save_preprocessor(
        preprocessor=preprocessor,
        output_dir=output_dir,
        prefix=dataset_name
    )

    return train_df, test_df, preprocessor


def get_dataset_summary(df, dataset_name):
    """
    Devuelve un pequeño resumen útil para el notebook:
    - nombre del dataset
    - n filas y columnas originales
    - target
    - columnas que se van a dropear
    - columnas numéricas, categóricas y AQ
    - columnas con agrupación de raras y umbral usado
    """
    if dataset_name not in DATASET_CONFIG:
        raise ValueError(f"Dataset '{dataset_name}' no está en DATASET_CONFIG.")

    config = DATASET_CONFIG[dataset_name]

    summary = {
        "dataset": dataset_name,
        "n_rows": df.shape[0],
        "n_cols": df.shape[1],
        "target": config["target"],
        "drop_cols": config["drop_cols"],
        "numeric_cols": config["numeric_cols"],
        "categorical_cols": config["categorical_cols"],
        "aq_cols": config["aq_cols"],
        "group_rare_cols": config.get("group_rare_cols", []),
        "rare_min_freq": config.get("rare_min_freq", 5)
    }

    return summary