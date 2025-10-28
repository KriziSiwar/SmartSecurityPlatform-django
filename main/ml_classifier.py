import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from .training_data import get_training_data

class AlertClassifier:
    """
    Classificateur IA pour les alertes de sécurité
    Utilise Naive Bayes Multinomial avec TF-IDF
    """
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = LabelEncoder()
        self.training_data = get_training_data()
        self.model_path = os.path.join(os.path.dirname(__file__), 'alert_classifier.joblib')
    
    def initialize_classifier(self):
        """
        Initialise et entraîne le classifieur
        """
        try:
            print("Initialisation du classifieur IA...")

            # Préparer les données
            texts = [item['text'] for item in self.training_data]
            categories = [item['category'] for item in self.training_data]

            # Encoder les labels
            y_encoded = self.label_encoder.fit_transform(categories)

            # Créer le pipeline ML
            self.model = make_pipeline(
                TfidfVectorizer(
                    max_features=1000,
                    stop_words=['détectée', 'détecté', 'alerte', 'système'],
                    ngram_range=(1, 2)
                ),
                MultinomialNB(alpha=0.1)
            )

            # Entraînement
            self.model.fit(texts, y_encoded)

            # Sauvegarder le modèle
            joblib.dump({
                'model': self.model,
                'label_encoder': self.label_encoder
            }, self.model_path)

            print(f"Classifieur entraine avec {len(texts)} exemples")
            print(f"Categories: {list(self.label_encoder.classes_)}")

            return True

        except Exception as e:
            print(f"Erreur lors de l'entrainement: {e}")
            return False
    
    def predict(self, message):
        """
        Prédit la catégorie d'une alerte
        """
        try:
            if self.model is None:
                # Charger le modèle sauvegardé ou en entraîner un nouveau
                if os.path.exists(self.model_path):
                    loaded = joblib.load(self.model_path)
                    self.model = loaded['model']
                    self.label_encoder = loaded['label_encoder']
                else:
                    self.initialize_classifier()
            
            # Prédiction
            probabilities = self.model.predict_proba([message])[0]
            predicted_index = probabilities.argmax()
            confidence = probabilities[predicted_index]
            category = self.label_encoder.inverse_transform([predicted_index])[0]
            
            # Déterminer la priorité basée sur la catégorie
            priority_map = {
                'intrusion': 'critique',
                'incendie': 'critique', 
                'technique': 'normal',
                'fausse_alerte': 'faible'
            }
            
            return {
                'categorie': category,
                'confiance': round(confidence * 100, 2),
                'priorite': priority_map.get(category, 'normal'),
                'explication': f"Détection basée sur les mots-clés liés à: {category}"
            }
            
        except Exception as e:
            print(f"❌ Erreur de prédiction: {e}")
            return {
                'categorie': 'inconnue',
                'confiance': 0,
                'priorite': 'normal',
                'explication': f'Erreur: {str(e)}'
            }
    
    def get_model_info(self):
        """
        Retourne des informations sur le modèle
        """
        if self.model is None:
            return {"status": "Modèle non entraîné"}
        
        return {
            "status": "Entraîné",
            "algorithm": "Naive Bayes Multinomial",
            "features": "TF-IDF Vectorizer",
            "training_samples": len(self.training_data),
            "categories": list(self.label_encoder.classes_)
        }


# Instance globale pour une utilisation facile
classifier_instance = AlertClassifier()

def initialize_ai_classifier():
    """
    Fonction utilitaire pour initialiser le classifieur
    """
    return classifier_instance.initialize_classifier()

def predict_alert_category(message):
    """
    Fonction utilitaire pour prédire une catégorie
    """
    return classifier_instance.predict(message)