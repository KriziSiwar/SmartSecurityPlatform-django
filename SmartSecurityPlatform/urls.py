from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from main import api_views

# Configuration du router DRF
router = DefaultRouter()
router.register(r'sites', api_views.SiteClientViewSet, basename='site')
router.register(r'alertes', api_views.AlerteViewSet, basename='alerte')
router.register(r'cameras', api_views.CameraSurveillanceViewSet, basename='camera')
router.register(r'capteurs', api_views.CapteurViewSet, basename='capteur')
router.register(r'evenements', api_views.EvenementViewSet, basename='evenement')
router.register(r'rapports', api_views.RapportSurveillanceViewSet, basename='rapport')
router.register(r'maintenances', api_views.MaintenanceViewSet, basename='maintenance')

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),

    # ========== ENDPOINTS IA (AJOUTEZ CETTE LIGNE) ==========
    path('api/classify-alert/', api_views.classify_message_view, name='api_classify_alert_new'),

    # ========== AUTHENTICATION ENDPOINTS ==========
    path('api/auth/login/', api_views.login_view, name='api_login'),
    path('api/auth/register/', api_views.register_view, name='api_register'),
    path('api/auth/me/', api_views.current_user_view, name='api_current_user'),
    path('api/auth/users/', api_views.users_list, name='api_users_list'),
    path('api/auth/techniciens/', api_views.techniciens_list, name='api_techniciens_list'),

    # ========== DASHBOARD STATS ==========
    path('api/dashboard/stats/', api_views.dashboard_stats, name='api_dashboard_stats'),

    # ========== API REST (ROUTER EN DERNIER) ==========
    path('api/', include(router.urls)),

    # ========== URLS DES VUES TEMPLATES ==========
    path('', include('main.urls')),
]