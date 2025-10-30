import pandas as pd
from datetime import date, timedelta
from sklearn.ensemble import RandomForestRegressor
import joblib
from .models import Maintenance

MODEL_PATH = "main/model_next_maint.joblib"


def prepare_data():
    """Charge les maintenances réelles depuis la base Django"""
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
    """Entraîne le modèle IA"""
    df = prepare_data()
    if df.empty:
        return None, "⚠️ Pas assez de données pour entraîner le modèle."

    X = df[["type_maintenance", "equipement", "site_nom", "duree_estimee", "priorite", "statut", "cout_estime"]]
    y = df["jours_suivant"]

    X_encoded = pd.get_dummies(X, columns=["type_maintenance", "equipement", "site_nom", "priorite", "statut"], drop_first=True)

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_encoded, y)

    joblib.dump((model, X_encoded.columns), MODEL_PATH)
    return model, f"✅ Modèle entraîné avec {len(df)} exemples."


def predict_all_maintenances():
    """Prédit la prochaine date de maintenance pour CHAQUE équipement"""
    try:
        model, cols = joblib.load(MODEL_PATH)
    except:
        model, _ = train_model()
        if model is None:
            return {"error": "Modèle non disponible"}

    df = prepare_data()
    results = []

    # Liste des équipements uniques
    equipments = df["equipement"].unique()

    for equip in equipments:
        last_entry = df[df["equipement"] == equip].iloc[-1]
        input_data = {
            "type_maintenance": last_entry["type_maintenance"],
            "equipement": last_entry["equipement"],
            "site_nom": last_entry["site_nom"],
            "duree_estimee": last_entry["duree_estimee"],
            "priorite": last_entry["priorite"],
            "statut": last_entry["statut"],
            "cout_estime": last_entry["cout_estime"],
        }

        X = pd.DataFrame([input_data])
        X_encoded = pd.get_dummies(X, columns=["type_maintenance", "equipement", "site_nom", "priorite", "statut"], drop_first=True)

        for col in cols:
            if col not in X_encoded.columns:
                X_encoded[col] = 0
        X_encoded = X_encoded[cols]

        pred_days = int(round(float(model.predict(X_encoded)[0])))
        next_date = date.today() + timedelta(days=pred_days)

        results.append({
            "equipement": equip,
            "site": last_entry["site_nom"],
            "predicted_days": pred_days,
            "recommended_date": next_date.isoformat(),
            "message": f"🧠 {equip} ({last_entry['site_nom']}) : prochaine maintenance dans {pred_days} jours → {next_date.isoformat()}"
        })

    return results
