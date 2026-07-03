from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer


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
        # CAMBIO: columnas con muchas categorias distintas (ethnicity y
        # contry_of_res generan muchas columnas one-hot). Se agrupan las
        # categorias poco frecuentes en "other" antes de codificar, para
        # no disparar la dimensionalidad. En adults el ratio filas/columnas
        # es tolerable (563 filas de train), pero se aplica igualmente por
        # consistencia con adolescents y porque no hace dano.
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
        # CAMBIO: combined no tiene columnas categoricas de alta cardinalidad
        # (Sex, Jauundice y Family_ASD son todas binarias), asi que no
        # necesita agrupacion. Se deja la lista vacia por consistencia
        # de estructura entre configs.
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
        # CAMBIO: Ethnicity en toddlers tambien tiene bastantes categorias.
        # Con 843 filas de train el ratio es mas holgado que en adolescents,
        # pero se agrupa igualmente para mantener el mismo criterio en
        # todos los datasets.
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
        # CAMBIO: este es el caso critico. Con solo 83 filas de train y
        # columnas como ethnicity o contry_of_res con muchas categorias
        # distintas, el one-hot encoding generaba 64 columnas finales
        # (ratio filas/columnas de ~1.3:1), lo que favorece el sobreajuste
        # sobre todo en modelos de arboles (Random Forest, XGBoost).
        # Agrupamos las categorias poco frecuentes en "other" para reducir
        # el numero de columnas resultantes.
        "group_rare_cols": ["ethnicity", "contry_of_res", "relation"],
        # CAMBIO: umbral mas alto que el resto (10 en vez de 5) porque el
        # dataset es mucho mas pequeno; con min_freq=5 sobre 104 registros
        # casi ninguna categoria se agruparia y el problema seguiria igual.
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
    Reemplaza '?' por NaN para poder imputar despues.
    """
    df = df.copy()
    df.replace("?", np.nan, inplace=True)
    return df


# CAMBIO: funcion nueva. Agrupa en una categoria "other" los valores de
# una columna categorica que aparecen menos de min_freq veces. Esto reduce
# el numero de columnas que genera el OneHotEncoder despues, evitando que
# datasets pequenos (como adolescents) terminen con mas columnas que filas.
# Se aplica ANTES del split train/test porque es una operacion descriptiva
# sobre los valores de la columna (no aprende nada del target), asi que no
# introduce data leakage.
def group_rare_categories(df, col, min_freq=5):
    """
    Reemplaza por 'other' las categorias de `col` que aparecen menos de
    `min_freq` veces en el dataset. Los valores nulos o '?' no se tocan
    aqui, se gestionan despues en la imputacion del pipeline.
    """
    df = df.copy()
    counts = df[col].value_counts(dropna=True)
    categorias_raras = counts[counts < min_freq].index
    df[col] = df[col].apply(lambda x: "other" if x in categorias_raras else x)
    return df


def drop_existing_columns(df, columns_to_drop):
    """
    Elimina solo las columnas que existan realmente en el dataframe.
    Asi evitamos errores si una columna no esta en ese dataset.
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


def build_preprocessor(numeric_cols, categorical_cols, passthrough_cols):
    """
    Construye el preprocesador con:
    - numericas: mediana + StandardScaler
    - categoricas: unknown + OneHotEncoder
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
    Preprocesa un dataset completo segun su configuracion:
    1. decodifica bytes si vienen de un .arff
    2. limpia '?'
    3. agrupa categorias poco frecuentes en 'other'
    4. codifica target
    5. elimina columnas no deseadas
    6. separa X e y
    7. hace train/test split
    8. ajusta el preprocesador SOLO con train
    9. transforma train y test
    10. devuelve train_df, test_df y el preprocessor
    """

    df = df.copy()

    # 1) Decodificar bytes si el dataset viene de un .arff
    df = decode_arff_bytes(df)

    # 2) Reemplazar '?' por NaN
    df = clean_question_marks(df)

    # CAMBIO: paso nuevo. Agrupamos categorias poco frecuentes ANTES de
    # separar target y hacer el split, usando la lista group_rare_cols
    # y el umbral rare_min_freq definidos en la config de cada dataset.
    # Si un dataset no tiene columnas configuradas para esto (lista vacia,
    # como combined), este bucle simplemente no hace nada.
    for col in config.get("group_rare_cols", []):
        if col in df.columns:
            df = group_rare_categories(df, col, min_freq=config.get("rare_min_freq", 5))

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
        passthrough_cols=config["aq_cols"]
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

    # 12) Anadir target
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
    Funcion de alto nivel:
    - busca la config del dataset
    - lo preprocesa (incluye agrupacion de categorias raras si aplica)
    - guarda train/test
    - guarda el preprocessor entrenado
    - devuelve train_df, test_df y preprocessor
    """
    if dataset_name not in DATASET_CONFIG:
        raise ValueError(f"Dataset '{dataset_name}' no esta en DATASET_CONFIG.")

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
    Devuelve un pequeno resumen util para el notebook:
    - nombre del dataset
    - n filas y columnas originales
    - target
    - columnas que se van a dropear
    """
    if dataset_name not in DATASET_CONFIG:
        raise ValueError(f"Dataset '{dataset_name}' no esta en DATASET_CONFIG.")

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
        # CAMBIO: anadido al resumen para que quede visible en el notebook
        # que columnas se agrupan y con que umbral, sin tener que ir a mirar
        # el codigo de preprocessing.py
        "group_rare_cols": config.get("group_rare_cols", []),
        "rare_min_freq": config.get("rare_min_freq", 5)
    }

    return summary
