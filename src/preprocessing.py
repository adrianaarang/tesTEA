from pathlib import Path
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer


# ============================================================
# CONFIGURACIÓN DE DATASETS
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
        ]
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
        ]
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
        ]
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


def clean_question_marks(df):
    """
    Reemplaza '?' por NaN para poder imputar después.
    """
    df = df.copy()
    df.replace("?", np.nan, inplace=True)
    return df


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
    return df


def split_features_target(df, target_col):
    """
    Separa X e y.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]
    return X, y


def build_preprocessor(numeric_cols, categorical_cols, passthrough_cols):
    """
    Construye el preprocesador con:
    - numéricas: mediana + StandardScaler
    - categóricas: unknown + OneHotEncoder
    - AQ cols: passthrough
    """

    numeric_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="unknown")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_cols),
            ("cat", categorical_pipeline, categorical_cols),
            ("aq", "passthrough", passthrough_cols)
        ]
    )

    return preprocessor


def preprocess_single_dataset(df, config, test_size=0.2, random_state=42):
    """
    Preprocesa un dataset completo según su configuración:
    1. limpia '?'
    2. codifica target
    3. elimina columnas no deseadas
    4. separa X e y
    5. hace train/test split
    6. ajusta el preprocesador SOLO con train
    7. transforma train y test
    8. devuelve train_df, test_df y el preprocessor
    """

    df = df.copy()

    # 1) Reemplazar '?' por NaN
    df = clean_question_marks(df)

    # 2) Codificar target
    target_col = config["target"]
    df = encode_target(df, target_col, config["target_map"])

    # 3) Eliminar columnas no deseadas
    df = drop_existing_columns(df, config["drop_cols"])

    # 4) Separar X e y
    X, y = split_features_target(df, target_col)

    # 5) Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    # 6) Construir preprocessor
    preprocessor = build_preprocessor(
        numeric_cols=config["numeric_cols"],
        categorical_cols=config["categorical_cols"],
        passthrough_cols=config["aq_cols"]
    )

   # 7) Ajustar SOLO con train y transformar train/test
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # 8) Si el resultado es sparse matrix, convertirlo a array denso
    if hasattr(X_train_processed, "toarray"):
        X_train_processed = X_train_processed.toarray()

    if hasattr(X_test_processed, "toarray"):
        X_test_processed = X_test_processed.toarray()

    # 9) Recuperar nombres de columnas transformadas
    feature_names = preprocessor.get_feature_names_out()

    # 10) Convertir a DataFrame
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

    # 10) Añadir target
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


def preprocess_and_save_dataset(df, dataset_name, output_dir, test_size=0.2, random_state=42):
    """
    Función de alto nivel:
    - busca la config del dataset
    - lo preprocesa
    - guarda train/test
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

    return train_df, test_df, preprocessor


def get_dataset_summary(df, dataset_name):
    """
    Devuelve un pequeño resumen útil para el notebook:
    - nombre del dataset
    - nº filas y columnas originales
    - target
    - columnas que se van a dropear
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
        "aq_cols": config["aq_cols"]
    }

    return summary