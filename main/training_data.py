"""
Données d'entraînement pour le classificateur d'alertes
Module: Mayssa Rzigui - Alertes & Sites Clients  
Date: 27 Octobre 2025

Ce fichier contient 120+ exemples d'alertes réelles pour entraîner l'IA
Version enrichie pour meilleure précision
"""

def get_training_data():
    """
    Retourne les données d'entraînement enrichies pour le modèle IA
    Format: {'text': 'message alerte', 'category': 'catégorie'}
    
    Catégories disponibles:
    - intrusion: Accès non autorisé, mouvement suspect
    - incendie: Feu, fumée, température élevée  
    - technique: Panne équipement, problème connexion
    - fausse_alerte: Test, erreur système
    """
    
    return [
        # ========== INTRUSIONS (30 exemples) ==========
        {'text': 'Détection mouvement suspect zone principale', 'category': 'intrusion'},
        {'text': 'Intrusion détectée entrée nord caméra 3', 'category': 'intrusion'},
        {'text': 'Alerte intrusion périmètre extérieur activée', 'category': 'intrusion'},
        {'text': 'Présence non autorisée détectée zone sécurisée', 'category': 'intrusion'},
        {'text': 'Mouvement détecté après heures ouverture', 'category': 'intrusion'},
        {'text': 'Capteur mouvement déclenché parking arrière', 'category': 'intrusion'},
        {'text': 'Alerte accès non autorisé porte principale', 'category': 'intrusion'},
        {'text': 'Intrusion possible zone stockage détectée', 'category': 'intrusion'},
        {'text': 'Mouvement anormal détecté couloir A niveau 2', 'category': 'intrusion'},
        {'text': 'Personne non identifiée détectée caméra bureau', 'category': 'intrusion'},
        {'text': 'Détection présence inhabituelle hall entrée', 'category': 'intrusion'},
        {'text': 'Alarme périmètre déclenchée secteur ouest', 'category': 'intrusion'},
        {'text': 'Mouvement suspect enregistré caméra parking', 'category': 'intrusion'},
        {'text': 'Intrusion zone réservée détectée urgence', 'category': 'intrusion'},
        {'text': 'Alerte sécurité accès forcé porte arrière', 'category': 'intrusion'},
        
        # NOUVEAUX EXEMPLES INTRUSION
        {'text': 'Individu masqué détecté entrée secondaire', 'category': 'intrusion'},
        {'text': 'Tentative effraction fenêtre rez-de-chaussée', 'category': 'intrusion'},
        {'text': 'Alarme anti-intrusion déclenchée bâtiment B', 'category': 'intrusion'},
        {'text': 'Porte de secours ouverte anormalement nuit', 'category': 'intrusion'},
        {'text': 'Détection infrarouge zone haute sécurité', 'category': 'intrusion'},
        {'text': 'Personne rôdant véhicule parking visiteurs', 'category': 'intrusion'},
        {'text': 'Alarme barrière périmètre secteur industriel', 'category': 'intrusion'},
        {'text': 'Accès badge non autorisé salle serveurs 22h', 'category': 'intrusion'},
        {'text': 'Mouvement zone archives hors heures travail', 'category': 'intrusion'},
        {'text': 'Tentative intrusion détectée clôture est', 'category': 'intrusion'},
        {'text': 'Alarme portes déclenchée sans autorisation', 'category': 'intrusion'},
        {'text': 'Visiteur non enregistré zone administrative', 'category': 'intrusion'},
        {'text': 'Détection présence salle coffre weekends', 'category': 'intrusion'},
        {'text': 'Alarme périmètre intérieur niveau 3', 'category': 'intrusion'},
        {'text': 'Comportement suspect salle contrôle accès', 'category': 'intrusion'},
        
        # ========== INCENDIES (30 exemples) ==========
        {'text': 'Fumée détectée étage 2 alarme déclenchée', 'category': 'incendie'},
        {'text': 'Détecteur fumée activé salle serveurs', 'category': 'incendie'},
        {'text': 'Alerte incendie cuisine température élevée', 'category': 'incendie'},
        {'text': 'Capteur chaleur déclenché entrepôt zone B', 'category': 'incendie'},
        {'text': 'Fumée détectée bureau 305 évacuation requise', 'category': 'incendie'},
        {'text': 'Température anormale détectée local technique', 'category': 'incendie'},
        {'text': 'Alerte feu possible détection fumée hall', 'category': 'incendie'},
        {'text': 'Détecteur incendie activé salle archives', 'category': 'incendie'},
        {'text': 'Chaleur excessive capteur garage sous-sol', 'category': 'incendie'},
        {'text': 'Risque incendie détecté salle électrique urgence', 'category': 'incendie'},
        {'text': 'Fumée importante détectée zone stockage produits', 'category': 'incendie'},
        {'text': 'Alerte température critique local chaufferie', 'category': 'incendie'},
        {'text': 'Détection fumée anormale cafétéria niveau 1', 'category': 'incendie'},
        {'text': 'Capteur thermique déclenché atelier production', 'category': 'incendie'},
        {'text': 'Alarme incendie généralisée évacuation immédiate', 'category': 'incendie'},
        
        # NOUVEAUX EXEMPLES INCENDIE
        {'text': 'Début incendie poubelle extérieure bâtiment C', 'category': 'incendie'},
        {'text': 'Flamme visible local transformateur électrique', 'category': 'incendie'},
        {'text': 'Alarme CO2 déclenchée garage véhicules', 'category': 'incendie'},
        {'text': 'Etincelles tableau électrique principal', 'category': 'incendie'},
        {'text': 'Odeur de brûlé système ventilation étage 4', 'category': 'incendie'},
        {'text': 'Capteur flamme positif atelier soudure', 'category': 'incendie'},
        {'text': 'Chaleur anormale armoire électrique couloir B', 'category': 'incendie'},
        {'text': 'Fumée noire sortie bouche aération cuisine', 'category': 'incendie'},
        {'text': 'Alarme incendie déclenchée salle machine toit', 'category': 'incendie'},
        {'text': 'Température critique four industriel ligne 2', 'category': 'incendie'},
        {'text': 'Détecteur monoxyde carbone positif sous-sol', 'category': 'incendie'},
        {'text': 'Fumée détectée gaine technique verticale', 'category': 'incendie'},
        {'text': 'Alarme feu salle informatique niveau urgent', 'category': 'incendie'},
        {'text': 'Incendie confirmé zone stockage matières', 'category': 'incendie'},
        {'text': 'Déclenchement sprinkler local archives niveau 2', 'category': 'incendie'},
        
        # ========== PROBLÈMES TECHNIQUES (30 exemples) ==========
        {'text': 'Caméra 5 hors ligne connexion perdue', 'category': 'technique'},
        {'text': 'Perte signal capteur température salle 12', 'category': 'technique'},
        {'text': 'Dysfonctionnement caméra parking est maintenance requise', 'category': 'technique'},
        {'text': 'Capteur mouvement défaillant zone réception', 'category': 'technique'},
        {'text': 'Connexion réseau caméra interrompue', 'category': 'technique'},
        {'text': 'Erreur système capteur humidité sous-sol', 'category': 'technique'},
        {'text': 'Caméra floue qualité image dégradée caméra 7', 'category': 'technique'},
        {'text': 'Batterie faible capteur sans fil entrée principale', 'category': 'technique'},
        {'text': 'Panne électrique locale caméras secteur nord', 'category': 'technique'},
        {'text': 'Défaillance enregistrement DVR maintenance nécessaire', 'category': 'technique'},
        {'text': 'Capteur inactif depuis 2 heures vérification requise', 'category': 'technique'},
        {'text': 'Erreur communication serveur surveillance central', 'category': 'technique'},
        {'text': 'Caméra orientation incorrecte réglage nécessaire', 'category': 'technique'},
        {'text': 'Dysfonctionnement infrarouge caméra nocturne 4', 'category': 'technique'},
        {'text': 'Problème réseau perte intermittente signal caméras', 'category': 'technique'},
        
        # NOUVEAUX EXEMPLES TECHNIQUE
        {'text': 'Pompe incendie hors service test échoué', 'category': 'technique'},
        {'text': 'Système détection intrusion défaillant secteur A', 'category': 'technique'},
        {'text': 'Panne générateur secours batterie faible', 'category': 'technique'},
        {'text': 'Capteur porte déconnecté entrée service', 'category': 'technique'},
        {'text': 'Batterie secours faible centrale alarme', 'category': 'technique'},
        {'text': 'Communication perdue avec capteur fumée étage 3', 'category': 'technique'},
        {'text': 'Maintenance préventive système caméras en cours', 'category': 'technique'},
        {'text': 'Problème alimentation onduleur salle serveurs', 'category': 'technique'},
        {'text': 'Défaillance système contrôle accès portail principal', 'category': 'technique'},
        {'text': 'Mise à jour firmware capteurs en progression', 'category': 'technique'},
        {'text': 'Panne climatisation local équipements électroniques', 'category': 'technique'},
        {'text': 'Calibration nécessaire capteur température cuisine', 'category': 'technique'},
        {'text': 'Problème synchronisation horloge système central', 'category': 'technique'},
        {'text': 'Défaillance module communication GSM backup', 'category': 'technique'},
        {'text': 'Niveau bas batterie capteur porte garage', 'category': 'technique'},
        
        # ========== FAUSSES ALERTES (30 exemples) ==========
        {'text': 'Fausse alerte test système hebdomadaire', 'category': 'fausse_alerte'},
        {'text': 'Alerte erronée causée entretien programmé', 'category': 'fausse_alerte'},
        {'text': 'Déclenchement accidentel alarme nettoyage', 'category': 'fausse_alerte'},
        {'text': 'Erreur détection mouvement ombre fenêtre', 'category': 'fausse_alerte'},
        {'text': 'Fausse alarme vérification technique effectuée', 'category': 'fausse_alerte'},
        {'text': 'Alerte annulée test maintenance mensuel', 'category': 'fausse_alerte'},
        {'text': 'Déclenchement intempestif vent fort extérieur', 'category': 'fausse_alerte'},
        {'text': 'Erreur capteur réinitialisé problème résolu', 'category': 'fausse_alerte'},
        {'text': 'Fausse détection animal domestique autorisé', 'category': 'fausse_alerte'},
        {'text': 'Alerte erronée changement luminosité naturelle', 'category': 'fausse_alerte'},
        {'text': 'Déclenchement accidentel personnel autorisé', 'category': 'fausse_alerte'},
        {'text': 'Test système fausse alerte contrôle qualité', 'category': 'fausse_alerte'},
        {'text': 'Erreur calibration capteur sensibilité ajustée', 'category': 'fausse_alerte'},
        {'text': 'Fausse alarme formation nouveau personnel sécurité', 'category': 'fausse_alerte'},
        {'text': 'Déclenchement test inspection annuelle système', 'category': 'fausse_alerte'},
        
        # NOUVEAUX EXEMPLES FAUSSES ALERTES
        {'text': 'Exercice simulation intrusion en cours', 'category': 'fausse_alerte'},
        {'text': 'Test système détection mouvement maintenance', 'category': 'fausse_alerte'},
        {'text': 'Fumée cigarette détectée salle pause faux positif', 'category': 'fausse_alerte'},
        {'text': 'Vapeur cuisine déclenchement capteur fumée', 'category': 'fausse_alerte'},
        {'text': 'Mise à jour logiciel déclenchement temporaire', 'category': 'fausse_alerte'},
        {'text': 'Test intégration nouveau capteur zone test', 'category': 'fausse_alerte'},
        {'text': 'Déclenchement poussière travaux rénovation', 'category': 'fausse_alerte'},
        {'text': 'Fausse alarme insecte capteur mouvement', 'category': 'fausse_alerte'},
        {'text': 'Test bouton panique exercice sécurité', 'category': 'fausse_alerte'},
        {'text': 'Déclenchement oiseau fenêtre étage 5', 'category': 'fausse_alerte'},
        {'text': 'Fausse détection reflet vitre couloir principal', 'category': 'fausse_alerte'},
        {'text': 'Test alarme sonore vérification périodique', 'category': 'fausse_alerte'},
        {'text': 'Exercice évacuation simulation incendie', 'category': 'fausse_alerte'},
        {'text': 'Fausse alerte ballon surveillance extérieure', 'category': 'fausse_alerte'},
        {'text': 'Test fonctionnement sirène externe maintenance', 'category': 'fausse_alerte'},
    ]


def get_test_examples():
    """
    Exemples de test pour validation du modèle
    """
    return [
        "Personne suspecte rôde autour du bâtiment caméra 5",
        "Détecteur de fumée déclenché dans la salle de conférence",
        "La caméra du parking ne fonctionne plus depuis ce matin",
        "Test hebdomadaire du système d'alarme effectué",
        "Mouvement détecté zone réservée après fermeture",
        "Température très élevée détectée dans le local électrique",
        "Individu non identifié accès salle serveurs",
        "Fumée importante local technique niveau urgent",
        "Panne généralisée système surveillance",
        "Exercice sécurité simulation intrusion complète",
    ]


def get_ambiguous_examples():
    """
    Exemples ambigus pour tester la précision du modèle
    """
    return [
        "Fumée machine photocopieuse local reprographie",  # Technique vs Fausse alerte
        "Chauffage en surchauffe local archives",  # Technique vs Incendie
        "Porte bloquée signalée entrée principale",  # Technique vs Intrusion
        "Exercice sécurité avec simulation feu réel",  # Fausse alerte vs Incendie
        "Test alarme intrusion programme maintenance",  # Fausse alerte vs Intrusion
        "Vapeur cuisine déclenche détecteur corridor",  # Fausse alerte vs Incendie
        "Mouvement zone publique heures ouverture",  # Fausse alerte vs Intrusion
        "Panne système climatisation salle serveurs",  # Technique vs Incendie
        "Lumière étrange détectée caméra parking nuit",  # Intrusion vs Fausse alerte
        "Odeur anormale local électrique investigation",  # Incendie vs Technique
    ]


def add_custom_training_data(new_data):
    """
    Fonction pour ajouter vos propres exemples d'alertes
    """
    existing_data = get_training_data()
    existing_data.extend(new_data)
    
    print(f"✅ {len(new_data)} nouveaux exemples ajoutés")
    print(f"📊 Total: {len(existing_data)} exemples")
    
    return existing_data


def get_training_statistics():
    """
    Affiche des statistiques détaillées sur les données d'entraînement
    """
    data = get_training_data()
    
    categories = {}
    for item in data:
        cat = item['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print("=" * 60)
    print("📊 STATISTIQUES DÉTAILLÉES DES DONNÉES D'ENTRAÎNEMENT")
    print("=" * 60)
    print(f"\n🎯 Total d'exemples: {len(data)}")
    print("\n📈 Répartition par catégorie:")
    print("-" * 40)
    
    for category, count in sorted(categories.items()):
        percentage = (count / len(data)) * 100
        print(f"  {category:15} : {count:2} exemples ({percentage:.1f}%)")
    
    print(f"\n💡 Exemples de test: {len(get_test_examples())}")
    print(f"🎭 Exemples ambigus: {len(get_ambiguous_examples())}")
    print("=" * 60)


# Si ce fichier est exécuté directement
if __name__ == "__main__":
    get_training_statistics()