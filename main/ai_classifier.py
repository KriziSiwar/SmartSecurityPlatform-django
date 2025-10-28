"""
Système de Classification Automatique des Alertes avec IA
Module: Mayssa Rzigui - Alertes & Sites Clients
"""

import re
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np

class AlertClassifier:
    """Classificateur IA pour les alertes de sécurité"""
    
    def __init__(self):
        self.model = None
        self.categories = {
            'intrusion': 'Intrusion détectée',
            'incendie': 'Risque d\'incendie',
            'technique': 'Problème technique',
            'fausse_alerte': 'Fausse alerte'
        }
        
        self.priority_levels = {
            'critique': 'Intervention immédiate requise',
            'urgent': 'Action rapide nécessaire',
            'normal': 'Traitement standard',
            'faible': 'Information seulement'
        }
        
        self.actions = {
            'intrusion': [
                'Vérifier les caméras de surveillance',
                'Contacter les forces de l\'ordre',
                'Déclencher l\'alarme sonore',
                'Verrouiller les accès'
            ],
            'incendie': [
                'Appeler les pompiers immédiatement',
                'Évacuer le bâtiment',
                'Activer le système d\'extinction',
                'Couper l\'électricité'
            ],
            'technique': [
                'Notifier un technicien',
                'Vérifier la connectivité réseau',
                'Redémarrer l\'équipement si nécessaire',
                'Prévoir une maintenance'
            ],
            'fausse_alerte': [
                'Vérifier la sensibilité des capteurs',
                'Confirmer visuellement via caméra',
                'Ajuster les paramètres de détection',
                'Documenter pour analyse'
            ]
        }
    
    def preprocess_text(self, text):
        """Prétraitement du texte"""
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r'[^a-zàâäéèêëïîôöùûüç\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def train(self, training_data):
        """Entraînement du modèle"""
        texts = [self.preprocess_text(item['text']) for item in training_data]
        labels = [item['category'] for item in training_data]
        
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=100, ngram_range=(1, 2))),
            ('classifier', MultinomialNB(alpha=0.1))
        ])
        
        self.model.fit(texts, labels)
        print(f"✅ Modèle entraîné avec {len(training_data)} exemples")
    
    def predict(self, message):
        """Prédiction complète avec catégorie, priorité et actions"""
        if not self.model:
            raise ValueError("Le modèle n'est pas entraîné")
        
        processed_text = self.preprocess_text(message)
        
        # Prédiction de la catégorie
        category = self.model.predict([processed_text])[0]
        confidence = max(self.model.predict_proba([processed_text])[0])
        
        # Détermination de la priorité basée sur les mots-clés
        priority = self._determine_priority(message, category)
        
        # Actions recommandées
        recommended_actions = self.actions.get(category, [])
        
        # Explication de la décision
        explanation = self._generate_explanation(message, category, confidence)
        
        return {
            'category': category,
            'category_label': self.categories[category],
            'priority': priority,
            'priority_label': self.priority_levels[priority],
            'confidence': float(confidence),
            'recommended_actions': recommended_actions,
            'explanation': explanation
        }
    
    def _determine_priority(self, message, category):
        """Détermine le niveau de priorité"""
        message_lower = message.lower()
        
        # Mots-clés critiques
        critical_keywords = ['urgent', 'immédiat', 'critique', 'danger', 'feu', 'incendie', 
                             'intrusion', 'armé', 'alerte', 'rouge', 'panique']
        
        # Mots-clés urgents
        urgent_keywords = ['suspect', 'mouvement', 'anomalie', 'détecté', 'inhabituel',
                          'fumée', 'température', 'alarme']
        
        # Mots-clés faibles
        low_keywords = ['test', 'fausse', 'erreur', 'maintenance', 'vérification']
        
        if any(keyword in message_lower for keyword in critical_keywords):
            return 'critique'
        elif any(keyword in message_lower for keyword in low_keywords):
            return 'faible'
        elif any(keyword in message_lower for keyword in urgent_keywords):
            return 'urgent'
        else:
            return 'normal'
    
    def _generate_explanation(self, message, category, confidence):
        """Génère une explication de la classification"""
        message_lower = message.lower()
        
        explanations = {
            'intrusion': 'Détection de termes liés à une intrusion ou accès non autorisé',
            'incendie': 'Détection de termes liés au feu, fumée ou risque d\'incendie',
            'technique': 'Détection de problèmes techniques ou défaillances d\'équipement',
            'fausse_alerte': 'Caractéristiques d\'une fausse alerte ou erreur de détection'
        }
        
        base_explanation = explanations.get(category, 'Classification basée sur l\'analyse du message')
        confidence_level = 'élevée' if confidence > 0.8 else 'moyenne' if confidence > 0.5 else 'faible'
        
        return f"{base_explanation}. Confiance {confidence_level} ({confidence:.1%})."
    
    def save_model(self, filepath):
        """Sauvegarde du modèle"""
        with open(filepath, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"✅ Modèle sauvegardé: {filepath}")
    
    def load_model(self, filepath):
        """Chargement du modèle"""
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                self.model = pickle.load(f)
            print(f"✅ Modèle chargé: {filepath}")
            return True
        return False


# Instance globale du classificateur
classifier = AlertClassifier()


def get_classifier():
    """Retourne l'instance du classificateur"""
    return classifier


def initialize_classifier():
    """Initialise et entraîne le classificateur"""
    from .training_data import get_training_data
    
    training_data = get_training_data()
    classifier.train(training_data)
    
    # Sauvegarde du modèle
    model_path = os.path.join(os.path.dirname(__file__), 'alert_classifier_model.pkl')
    classifier.save_model(model_path)
    
    return classifier