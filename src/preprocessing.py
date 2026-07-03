from pathlib import Path
import numpy as np
import pandas as pd
import joblib  # CAMBIO: anadido para poder guardar el preprocessor entrenado

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
    },

    # CAMBIO: anadida la configuracion que faltaba para el dataset de adolescentes.
    # Viene del archivo Autism-Adolescent-Data.arff (UCI), con la misma estructura
    # de columnas que el dataset de adultos (A1_Score...A10_Score, age, gender, etc.)
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


# CAMBIO: funcion nueva. Los archivos .arff (adolescentes) se leen con
# scipy.io.arff, que devuelve las columnas de texto como bytes (b'YES', b'f'...)
# en vez de strings normales. Si no se decodifican antes, ni el mapeo del target
# ni la limpieza de '?' funcionan correctamente. Esta funcion se debe llamar
# justo despues de cargar cualquier dataset que venga de un .arff.
def decode_arff_bytes(df):
    """
    Decodifica a string las columnas de tipo bytes que vienen de un .arff.
    No afecta a datasets que ya son strings (CSV), esos se quedan igual.
    """
    df = df.copy()
    for col in df.select_dtypes([object]).columns:
        # Solo decodificamos si el contenido es realmente bytes
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

    # CAMBIO: antes, si un valor del target no estaba en target_map, .map()
    # lo convertia en NaN sin avisar. Eso podia colar registros invalidos
    # o hacer fallar el stratify del train_test_split con un error confuso.
    # Ahora lo comprobamos explicitamente y paramos con un mensaje claro.
    n_nulos = df[target_col].isnull().sum()
    if n_nulos > 0:
        valores_no_reconocidos = df[df[target_col].isnull()][target_col].unique()
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
    3. codifica target
    4. elimina columnas no deseadas
    5. separa X e y
    6. hace train/test split
    7. ajusta el preprocesador SOLO con train
    8. transforma train y test
    9. devuelve train_df, test_df y el preprocessor
    """

    df = df.copy()

    # CAMBIO: paso nuevo, decodificar bytes antes de nada si el dataset
    # viene de un .arff (por ejemplo adolescentes). Si ya son strings
    # normales (CSV), esta funcion no hace nada.
    df = decode_arff_bytes(df)

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

    # 11) Anadir target
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


# CAMBIO: funcion nueva para persistir el preprocessor entrenado.
# Antes preprocess_and_save_dataset devolvia el preprocessor pero no lo
# guardaba en disco, asi que se perdia al cerrar el notebook. Lo necesitamos
# para poder aplicar la misma transformacion en el notebook de modelado/evaluacion
# sin tener que reentrenarlo, y para usarlo si el front simula predicciones.
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
    - lo preprocesa
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

    # CAMBIO: ahora tambien se guarda el preprocessor, no solo se devuelve
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
        "aq_cols": config["aq_cols"]
    }

    return summary