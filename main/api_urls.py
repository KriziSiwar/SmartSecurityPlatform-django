from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

# API URLs
router = DefaultRouter()
router.register(r'sites', api_views.SiteClientViewSet)
router.register(r'alertes', api_views.AlerteViewSet)
router.register(r'cameras', api_views.CameraSurveillanceViewSet)
router.register(r'capteurs', api_views.CapteurViewSet)
router.register(r'evenements', api_views.EvenementViewSet)
router.register(r'rapports', api_views.RapportSurveillanceViewSet)
router.register(r'maintenances', api_views.MaintenanceViewSet)

urlpatterns = [
   path('', include(router.urls)),
   path('auth/login/', api_views.login_view, name='api_login'),
   path('auth/register/', api_views.register_view, name='api_register'),
   path('auth/me/', api_views.current_user_view, name='api_current_user'),
   path('auth/users/', api_views.users_list, name='api_users'),
   path('auth/techniciens/', api_views.techniciens_list, name='api_techniciens'),
   path('dashboard/stats/', api_views.dashboard_stats, name='api_dashboard_stats'),
   path('alertes/train-classifier/', api_views.train_classifier, name='train_classifier'),
   path('ai/predict-next-maintenance/', api_views.predict_next_maintenance_view, name='predict_next_maintenance'),
   path('ai/train-model/', api_views.train_model_view, name='train_model'),

]