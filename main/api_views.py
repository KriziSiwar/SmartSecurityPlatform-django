from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count
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


# Custom Permissions
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


# Authentication views
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


# Model ViewSets
class SiteClientViewSet(viewsets.ModelViewSet):
    queryset = SiteClient.objects.all()
    serializer_class = SiteClientSerializer
    permission_classes = [IsAuthenticated]

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

        # Filter by user role
        user = self.request.user
        if user.role == 'client':
            # Clients can only see their own site (assuming site_id is stored in user)
            # For now, return all sites but this should be filtered based on user-site relationship
            pass  # TODO: Implement site-user relationship

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

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

        if niveau:
            queryset = queryset.filter(niveau=niveau)
        if statut:
            queryset = queryset.filter(statut=statut)
        if destinataire:
            queryset = queryset.filter(destinataire=destinataire)

        # Filter by user role
        user = self.request.user
        if user.role == 'client':
            # Clients can only see their own alerts
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

        # Filter by user role
        user = self.request.user
        if user.role == 'client':
            # Clients can only see events from their site
            # TODO: Filter by user's site
            pass

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

        # Filter by user role
        user = self.request.user
        if user.role == 'client':
            # Clients can only see their own reports
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

        # Filter by user role
        user = self.request.user
        if user.role == 'technicien':
            # Techniciens can only see maintenances assigned to them
            queryset = queryset.filter(technicien=user)
        elif user.role == 'client':
            # Clients can only see maintenances from their site
            # TODO: Filter by user's site
            pass

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTechnicien()]
        return [IsAuthenticated()]