import cv2
import numpy as np
from ultralytics import YOLO
from sklearn.ensemble import IsolationForest
import os

class AnomalyDetector:
    def __init__(self):
        # Charger le modèle YOLOv8 (modèle léger pour la détection d'objets)
        self.model = YOLO('yolov8n.pt')
        # Modèle de détection d'anomalies
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.is_fitted = False
        self.last_frame = None
        
    def detect_objects(self, frame):
        """Détecte les objets dans l'image avec YOLOv8"""
        try:
            # Convertir l'image en BGR (format attendu par YOLO)
            if len(frame.shape) == 2:  # Si l'image est en niveaux de gris
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
                
            # Redimensionner l'image si elle est trop grande pour accélérer le traitement
            height, width = frame.shape[:2]
            max_dim = 1280
            if max(height, width) > max_dim:
                scale = max_dim / max(height, width)
                frame = cv2.resize(frame, (int(width * scale), int(height * scale)))
            
            # Détection avec YOLOv8
            results = self.model(frame)
            detections = []
            
            # Liste des classes d'intérêt (personne, voiture, sac, etc.)
            classes_of_interest = [0, 2, 3, 5, 7, 26, 28, 39, 56, 67, 73]  # Exemples: personne, voiture, moto, etc.
            
            for result in results:
                boxes = result.boxes.xyxy.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy()
                confidences = result.boxes.conf.cpu().numpy()
                
                for box, cls, conf in zip(boxes, classes, confidences):
                    if conf > 0.5 and int(cls) in classes_of_interest:  # Seuil de confiance et filtrage des classes
                        x1, y1, x2, y2 = map(int, box)
                        detections.append({
                            'class': int(cls),
                            'class_name': self.model.names[int(cls)],  # Nom de la classe
                            'confidence': float(conf),
                            'box': [x1, y1, x2, y2]
                        })
                        
                        # Afficher un message de débogage
                        print(f"Détecté: {self.model.names[int(cls)]} avec confiance {conf:.2f}")
            
            return detections
            
        except Exception as e:
            print(f"Erreur lors de la détection d'objets: {str(e)}")
            return []
    
    def detect_abandoned_objects(self, frame):
        """Détecte les objets abandonnés par soustraction de fond améliorée"""
        try:
            if len(frame.shape) == 3:  # Si l'image est en couleur
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            else:
                gray = frame.copy()
            
            # Flou gaussien pour réduire le bruit
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            if self.last_frame is None:
                self.last_frame = gray
                return []
            
            # Calcul de la différence absolue entre l'image actuelle et la précédente
            frame_delta = cv2.absdiff(self.last_frame, gray)
            
            # Seuillage pour mettre en évidence les changements
            thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
            
            # Dilater l'image pour combler les trous
            thresh = cv2.dilate(thresh, None, iterations=2)
            
            # Trouver les contours
            contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Mise à jour de la dernière image
            self.last_frame = gray
            
            abandoned_objects = []
            min_area = 500  # Aire minimale pour considérer un objet
            
            for contour in contours:
                if cv2.contourArea(contour) > min_area:
                    (x, y, w, h) = cv2.boundingRect(contour)
                    abandoned_objects.append({
                        'type': 'abandoned_object',
                        'box': [x, y, x + w, y + h],
                        'area': cv2.contourArea(contour)
                    })
                    
                    # Afficher un message de débogage
                    print(f"Objet abandonné détecté - Taille: {w}x{h}px, Aire: {cv2.contourArea(contour)}px²")
            
            return abandoned_objects
            
        except Exception as e:
            print(f"Erreur lors de la détection d'objets abandonnés: {str(e)}")
            return []
    
    def detect_suspicious_activity(self, frame):
        """Détecte les activités suspectes dans l'image"""
        try:
            if frame is None or frame.size == 0:
                print("Erreur: Image vide ou invalide")
                return {
                    'objects': [],
                    'abandoned_objects': [],
                    'suspicious_activities': []
                }
                
            print("\n--- Nouvelle analyse d'image ---")
            print(f"Taille de l'image: {frame.shape[1]}x{frame.shape[0]}")
            
            # Détection d'objets
            detections = self.detect_objects(frame)
            print(f"Nombre d'objets détectés: {len(detections)}")
            
            # Détection d'objets abandonnés
            abandoned_objects = self.detect_abandoned_objects(frame)
            print(f"Nombre d'objets abandonnés détectés: {len(abandoned_objects)}")
            
            # Détection d'activités suspectes
            suspicious_activities = self._detect_suspicious_behavior(frame, detections, abandoned_objects)
            
            # Afficher un résumé
            if len(abandoned_objects) > 0 or len(suspicious_activities) > 0:
                print("ALERTE: Activités suspectes détectées!")
            
            return {
                'objects': detections,
                'abandoned_objects': abandoned_objects,
                'suspicious_activities': suspicious_activities
            }
            
        except Exception as e:
            print(f"Erreur lors de la détection d'activités suspectes: {str(e)}")
            return {
                'objects': [],
                'abandoned_objects': [],
                'suspicious_activities': []
            }
    
    def _detect_suspicious_behavior(self, frame, detections, abandoned_objects):
        """Détecte des comportements suspects spécifiques"""
        suspicious_activities = []
        
        # 1. Détection de personnes dans des zones non autorisées
        person_detections = [d for d in detections if d.get('class_name') == 'person']
        
        # 2. Détection d'objets abandonnés
        for obj in abandoned_objects:
            suspicious_activities.append({
                'type': 'abandoned_object',
                'confidence': 0.8,  # Confiance élevée pour les objets abandonnés
                'box': obj['box'],
                'message': f"Objet abandonné détecté (taille: {obj.get('area', 0):.0f}px²)"
            })
        
        # 3. Détection de mouvements rapides (à implémenter avec un suivi temporel)
        
        return suspicious_activities

# Singleton pour le détecteur
anomaly_detector = AnomalyDetector()
