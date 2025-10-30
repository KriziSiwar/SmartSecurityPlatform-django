import pandas as pd
from datetime import date, timedelta
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
import joblib
from .models import Maintenance

MODEL_PATH = "main/model_next_maint.joblib"

def prepare_data():
    """Récupère les données depuis la base Django et les transforme en DataFrame"""
    maints = Maintenance.objects.select_related("site").all().order_by("equipement", "date_prevue")
    data = []
    prev = {}
    for m in maints:
        key = m.equipement.strip().lower() if m.equipement else None
        days_diff = ""
        if key in prev:
            delta = (m.date_prevue - prev[key]).days
            if delta > 0:
                days_diff = delta
        prev[key] = m.date_prevue

        data.append({
            "type_maintenance": m.type_maintenance,
            "equipement": m.equipement,
            "site_nom": m.site.nom if m.site else "",
            "duree_estimee": m.duree_estimee,
            "priorite": m.priorite,
            "statut": m.statut,
            "cout_estime": float(m.cout_estime or 0),
            "jours_suivant": days_diff
        })

    df = pd.DataFrame(data)
    df = df[df["jours_suivant"] != ""]
    df["jours_suivant"] = df["jours_suivant"].astype(int)
    return df


def train_model():
    """Entraîne le modèle et le sauvegarde"""
    df = prepare_data()
    if df.empty:
        return None, "Pas assez de données pour entraîner le modèle."

    X = df[["type_maintenance", "equipement", "site_nom", "duree_estimee", "priorite", "statut", "cout_estime"]]
    y = df["jours_suivant"]

    # Encodage des colonnes catégorielles
    cat_cols = ["type_maintenance", "equipement", "site_nom", "priorite", "statut"]
    X_encoded = pd.get_dummies(X, columns=cat_cols, drop_first=True)

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_encoded, y)

    joblib.dump((model, X_encoded.columns), MODEL_PATH)
    return model, f"✅ Modèle entraîné avec {len(df)} exemples."


def predict_next_maintenance(data):
    """Prédit le nombre de jours avant la prochaine maintenance"""
    try:
        model, cols = joblib.load(MODEL_PATH)
    except:
        model, _ = train_model()
        if model is None:
            return {"error": "Modèle non disponible"}

    X = pd.DataFrame([data])
    X_encoded = pd.get_dummies(X, columns=["type_maintenance", "equipement", "site_nom", "priorite", "statut"], drop_first=True)

    # Ajouter les colonnes manquantes
    for col in cols:
        if col not in X_encoded.columns:
            X_encoded[col] = 0
    X_encoded = X_encoded[cols]

    pred_days = int(round(float(model.predict(X_encoded)[0])))
    next_date = date.today() + timedelta(days=pred_days)

    return {
        "predicted_days": pred_days,
        "recommended_date": next_date.isoformat(),
        "message": "Basé sur l’historique de vos maintenances."
    }
