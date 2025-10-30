import datetime

def predict_next_maintenance(data):
    """
    🔮 Fonction de prédiction des prochaines maintenances
    - Peut traiter un seul équipement ou une liste complète d'équipements
    - Retourne une liste de prédictions avec les jours restants et la date recommandée
    """

    results = []

    # Si on reçoit une liste de maintenances (cas normal depuis views.py)
    if isinstance(data, list):
        for item in data:
            equipement = item.get("equipement", "Inconnu")
            site_nom = item.get("site_nom", "Inconnu")

            # 👉 Exemple simple : prédiction de 1 jour restant
            predicted_days = 1
            recommended_date = (datetime.date.today() + datetime.timedelta(days=predicted_days)).isoformat()

            results.append({
                "equipement": equipement,
                "site": site_nom,
                "predicted_days": predicted_days,
                "recommended_date": recommended_date,
            })

        return results

    # Sinon, si on reçoit un seul dictionnaire (un seul équipement)
    else:
        equipement = data.get("equipement", "Inconnu")
        site_nom = data.get("site_nom", "Inconnu")

        predicted_days = 1
        recommended_date = (datetime.date.today() + datetime.timedelta(days=predicted_days)).isoformat()

        return [{
            "equipement": equipement,
            "site": site_nom,
            "predicted_days": predicted_days,
            "recommended_date": recommended_date,
        }]


def train_model():
    """
    ⚙️ Fonction d'entraînement du modèle de maintenance.
    Ici, elle simule l'entraînement (placeholder à remplacer plus tard).
    """

    print("🔁 Entraînement du modèle IA en cours...")

    # Exemple : ici, on pourrait charger les données, entraîner un modèle ML, etc.
    # Pour l'instant, on simule un entraînement rapide
    import time
    time.sleep(1)

    print("✅ Modèle entraîné avec succès.")
    return "Modèle IA de maintenance réentraîné avec succès."
