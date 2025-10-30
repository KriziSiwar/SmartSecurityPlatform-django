from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import base64
import numpy as np
import cv2
from django.core.files.base import ContentFile
from .anomaly_detection import anomaly_detector

from .models import (
    SiteClient, Alerte, Evenement, CustomUser, CameraSurveillance,
    Capteur, RapportSurveillance, Maintenance
)
from .serializers import (
    SiteClientSerializer, AlerteSerializer, EvenementSerializer,
    CameraSurveillanceSerializer, CapteurSerializer, RapportSurveillanceSerializer,
    MaintenanceSerializer, UserSerializer, LoginSerializer, RegisterSerializer,
    DashboardStatsSerializer
)


# ========== CUSTOM PERMISSIONS ==========
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsTechnicien(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'technicien'

class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'

class IsAdminOrTechnicien(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'technicien']

class IsAdminOrClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'client']


# ========== AUTHENTICATION VIEWS ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    users = CustomUser.objects.filter(actif=True)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def techniciens_list(request):
    techniciens = CustomUser.objects.filter(role='technicien', actif=True)
    serializer = UserSerializer(techniciens, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    stats = {
        'total_sites': SiteClient.objects.count(),
        'active_sites': SiteClient.objects.filter(statut='actif').count(),
        'active_cameras': CameraSurveillance.objects.filter(etat='en_ligne').count(),
        'pending_alerts': Alerte.objects.filter(statut='envoyee').count(),
        'active_events': Evenement.objects.filter(statut='en_cours').count(),
        'total_cameras': CameraSurveillance.objects.count(),
        'total_capteurs': Capteur.objects.count(),
        'total_evenements': Evenement.objects.count(),
        'total_alertes': Alerte.objects.count(),
        'alertes_critiques': Alerte.objects.filter(niveau='critique', statut='envoyee').count(),
        'maintenances_planifiees': Maintenance.objects.filter(statut='planifiee').count(),
        'unread_alerts_count': Alerte.objects.filter(destinataire=request.user, statut='envoyee').count(),
        'user_alerts_count': Alerte.objects.filter(destinataire=request.user).count(),
    }
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


# ========== MODEL VIEWSETS ==========
class SiteClientViewSet(viewsets.ModelViewSet):
    queryset = SiteClient.objects.all()
    serializer_class = SiteClientSerializer

    def get_queryset(self):
        queryset = SiteClient.objects.annotate(
            nb_cameras=Count('camerasurveillance'),
            nb_capteurs=Count('capteur'),
            nb_evenements=Count('evenement')
        )
        search = self.request.query_params.get('search', None)
        statut = self.request.query_params.get('statut', None)

        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(contact_principal__icontains=search) |
                Q(email__icontains=search)
            )
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        # Only admin can create sites
        if not self.request.user.role == 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seul un administrateur peut créer un site.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        site = self.get_object()
        site.statut = 'inactif' if site.statut == 'actif' else 'actif'
        site.save()
        return Response({
            'statut': site.statut,
            'message': f'Statut changé en {site.get_statut_display()}'
        })


class AlerteViewSet(viewsets.ModelViewSet):
    queryset = Alerte.objects.all()
    serializer_class = AlerteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Alerte.objects.select_related('evenement', 'destinataire', 'evenement__site')
        niveau = self.request.query_params.get('niveau', None)
        statut = self.request.query_params.get('statut', None)
        destinataire = self.request.query_params.get('destinataire', None)
        categorie_ia = self.request.query_params.get('categorie_ia', None)

        if niveau:
            queryset = queryset.filter(niveau=niveau)
        if statut:
            queryset = queryset.filter(statut=statut)
        if destinataire:
            queryset = queryset.filter(destinataire=destinataire)
        if categorie_ia:
            queryset = queryset.filter(categorie_ia=categorie_ia)

        user = self.request.user
        if user.role == 'client':
            queryset = queryset.filter(destinataire=user)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrClient()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def marquer_lue(self, request, pk=None):
        alerte = self.get_object()
        if request.user == alerte.destinataire and alerte.statut == 'envoyee':
            alerte.marquer_comme_lue()
        return Response({'statut': alerte.statut, 'message': 'Alerte marquée comme lue'})

    @action(detail=True, methods=['post'])
    def archiver(self, request, pk=None):
        alerte = self.get_object()
        alerte.archiver()
        return Response({'statut': alerte.statut, 'message': 'Alerte archivée'})

    @action(detail=False, methods=['get'])
    def mes_alertes(self, request):
        alertes = Alerte.objects.filter(destinataire=request.user).select_related('evenement', 'evenement__site')
        serializer = self.get_serializer(alertes, many=True)
        return Response(serializer.data)


class CameraSurveillanceViewSet(viewsets.ModelViewSet):
    queryset = CameraSurveillance.objects.select_related('site')
    serializer_class = CameraSurveillanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CameraSurveillance.objects.select_related('site')
        site = self.request.query_params.get('site', None)
        etat = self.request.query_params.get('etat', None)
        type_camera = self.request.query_params.get('type', None)

        if site:
            queryset = queryset.filter(site=site)
        if etat:
            queryset = queryset.filter(etat=etat)
        if type_camera:
            queryset = queryset.filter(type=type_camera)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsAdminOrTechnicien()]
        return [IsAuthenticated()]


class CapteurViewSet(viewsets.ModelViewSet):
    queryset = Capteur.objects.select_related('site')
    serializer_class = CapteurSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Capteur.objects.select_related('site')
        site = self.request.query_params.get('site', None)
        type_capteur = self.request.query_params.get('type', None)
        statut = self.request.query_params.get('statut', None)

        if site:
            queryset = queryset.filter(site=site)
        if type_capteur:
            queryset = queryset.filter(type=type_capteur)
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsAdminOrTechnicien()]
        return [IsAuthenticated()]


class EvenementViewSet(viewsets.ModelViewSet):
    queryset = Evenement.objects.select_related('site', 'camera', 'capteur')
    serializer_class = EvenementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Evenement.objects.select_related('site', 'camera', 'capteur')
        site = self.request.query_params.get('site', None)
        type_evenement = self.request.query_params.get('type_evenement', None)
        niveau_urgence = self.request.query_params.get('niveau_urgence', None)
        statut = self.request.query_params.get('statut', None)

        if site:
            queryset = queryset.filter(site=site)
        if type_evenement:
            queryset = queryset.filter(type_evenement=type_evenement)
        if niveau_urgence:
            queryset = queryset.filter(niveau_urgence=niveau_urgence)
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrClient()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def resoudre(self, request, pk=None):
        evenement = self.get_object()
        evenement.statut = 'resolu'
        evenement.save()
        return Response({'statut': evenement.statut, 'message': 'Événement marqué comme résolu'})


class RapportSurveillanceViewSet(viewsets.ModelViewSet):
    queryset = RapportSurveillance.objects.select_related('site', 'auteur')
    serializer_class = RapportSurveillanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = RapportSurveillance.objects.select_related('site', 'auteur')
        site = self.request.query_params.get('site', None)
        periode = self.request.query_params.get('periode', None)

        if site:
            queryset = queryset.filter(site=site)
        if periode:
            queryset = queryset.filter(periode__icontains=periode)

        user = self.request.user
        if user.role == 'client':
            queryset = queryset.filter(auteur=user)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.select_related('site')
    serializer_class = MaintenanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Maintenance.objects.select_related('site')
        site = self.request.query_params.get('site', None)
        statut = self.request.query_params.get('statut', None)
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)

        if site:
            queryset = queryset.filter(site=site)
        if statut:
            queryset = queryset.filter(statut=statut)
        if date_debut:
            queryset = queryset.filter(date_prevue__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date_prevue__lte=date_fin)

        user = self.request.user
        if user.role == 'technicien':
            queryset = queryset.filter(technicien=user)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTechnicien()]
        return [IsAuthenticated()]


# ========== VUES IA (MAYSSA - MODULE ALERTES) - VERSION DJANGO PUR ==========

@csrf_exempt
def classify_message_view(request):
    """Classification IA en Django pur (sans DRF)"""
    print(f"🔍 classify_message_view - Method: {request.method}")
    
    if request.method == 'GET':
        return JsonResponse({
            'status': 'active',
            'message': 'Endpoint IA actif. Utilisez POST avec {"message": "votre texte"}'
        })
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
        message = data.get('message', '')
        
        print(f"📝 Message reçu: '{message}'")
        
        if not message:
            return JsonResponse({'error': 'Le message est requis'}, status=400)
        
        message_lower = message.lower()
        
        # Classification par mots-clés
        if any(w in message_lower for w in ['fumée', 'feu', 'incendie', 'flamme', 'brûle', 'température']):
            category = 'incendie'
            category_label = 'Incendie / Fumée'
            priority = 'critique'
            actions = [
                'Activer l\'alarme incendie immédiatement',
                'Contacter les pompiers (198)',
                'Évacuer le site',
                'Vérifier les détecteurs de fumée'
            ]
        elif any(w in message_lower for w in ['intrusion', 'accès', 'non autorisé', 'mouvement', 'suspect', 'effraction']):
            category = 'intrusion'
            category_label = 'Intrusion détectée'
            priority = 'critique'
            actions = [
                'Vérifier les caméras de surveillance',
                'Contacter les forces de l\'ordre',
                'Déclencher l\'alarme sonore',
                'Verrouiller les accès'
            ]
        elif any(w in message_lower for w in ['panne', 'hors ligne', 'défaillance', 'erreur', 'maintenance', 'dysfonctionnement']):
            category = 'technique'
            category_label = 'Problème technique'
            priority = 'moyen'
            actions = [
                'Vérifier les connexions réseau',
                'Redémarrer l\'équipement',
                'Contacter le support technique',
                'Planifier une maintenance'
            ]
        else:
            category = 'fausse_alerte'
            category_label = 'Fausse alerte probable'
            priority = 'faible'
            actions = [
                'Vérifier manuellement la situation',
                'Recalibrer les capteurs si nécessaire',
                'Analyser les logs système'
            ]
        
        priority_labels = {
            'critique': 'Intervention immédiate requise',
            'eleve': 'Intervention rapide nécessaire',
            'moyen': 'Surveillance renforcée',
            'faible': 'Information simple'
        }
        
        prediction = {
            'category': category,
            'category_label': category_label,
            'priority': priority,
            'priority_label': priority_labels.get(priority, 'Non défini'),
            'confidence': 0.85,
            'recommended_actions': actions,
            'explanation': f'Détection basée sur les mots-clés liés à : {category_label}. Classification automatique avec confiance moyenne.'
        }
        
        print(f"✅ Classification réussie: {category_label} (priorité: {priority})")
        
        response = JsonResponse({
            'success': True,
            'prediction': prediction,
            'message': 'Classification IA effectuée avec succès'
        })
        
        # CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON invalide'}, status=400)
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Erreur serveur: {str(e)}'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_classifier(request):
    """
    Endpoint pour réentraîner le classifieur d'alertes
    """
    try:
        # Importer le classifieur
        from .ai_classifier import AlertClassifier
        from .training_data import get_training_data

        print("🔄 Réentraînement du modèle IA...")

        # Réinitialiser et réentraîner le classifieur
        classifier = AlertClassifier()
        classifier.initialize_classifier()

        # Récupérer les statistiques
        data = get_training_data()
        categories = {}
        for item in data:
            cat = item['category']
            categories[cat] = categories.get(cat, 0) + 1

        print(f"✅ Modèle réentraîné avec {len(data)} exemples")

        return Response({
            'status': 'success',
            'message': 'Modèle IA réentraîné avec succès',
            'training_samples': len(data),
            'categories_distribution': categories,
            'model_type': 'Naive Bayes Multinomial',
            'features': 'TF-IDF Vectorizer'
        })

    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Erreur lors de l\'entraînement: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
def classify_and_create_alert(request):
    """Classifier et créer une alerte"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
        message = data.get('message', '')
        evenement_id = data.get('evenement')
        destinataire_id = data.get('destinataire')
        
        if not all([message, evenement_id, destinataire_id]):
            return JsonResponse({
                'error': 'message, evenement et destinataire sont requis'
            }, status=400)
        
        # Classification
        message_lower = message.lower()
        if any(w in message_lower for w in ['fumée', 'feu', 'incendie']):
            niveau = 'critique'
        elif any(w in message_lower for w in ['intrusion', 'suspect']):
            niveau = 'critique'
        elif any(w in message_lower for w in ['panne', 'erreur']):
            niveau = 'moyen'
        else:
            niveau = 'faible'
        
        # Création de l'alerte
        alerte = Alerte.objects.create(
            message=message,
            evenement_id=evenement_id,
            destinataire_id=destinataire_id,
            niveau=niveau,
            statut='envoyee'
        )
        
        return JsonResponse({
            'success': True,
            'alerte': {
                'id': alerte.id,
                'message': alerte.message,
                'niveau': alerte.niveau,
                'statut': alerte.statut
            },
            'ai_classification': {
                'category': 'auto-detected',
                'priority': niveau
            },
            'message': 'Alerte créée avec classification IA'
        }, status=201)
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return JsonResponse({'error': f'Erreur: {str(e)}'}, status=500)


# Alias pour la compatibilité
classify_alert_pure = classify_message_view

# ========== DÉTECTION D'ANOMALIES ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_anomalies(request):
    """
    Endpoint pour détecter des anomalies dans une image de caméra
    Accepte une image en base64 ou un fichier image
    """
    try:
        # Vérifier si l'image est envoyée en base64
        if 'image' in request.data:
            # Décoder l'image base64
            image_data = request.data['image']
            if 'base64,' in image_data:
                format, imgstr = image_data.split(';base64,') 
                ext = format.split('/')[-1]
                image_data = base64.b64decode(imgstr)
            else:
                image_data = base64.b64decode(image_data)
                
            # Convertir en numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Vérifier si un fichier image est envoyé
        elif 'file' in request.FILES:
            file = request.FILES['file']
            file_data = file.read()
            nparr = np.frombuffer(file_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        else:
            return Response(
                {'error': 'Aucune image fournie. Envoyez une image en base64 ou un fichier image.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Détecter les anomalies
        results = anomaly_detector.detect_suspicious_activity(frame)
        
        return Response({
            'status': 'success',
            'detections': results['objects'],
            'abandoned_objects': results['abandoned_objects'],
            'suspicious_activities': results['suspicious_activities']
        })
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du traitement de l\'image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )