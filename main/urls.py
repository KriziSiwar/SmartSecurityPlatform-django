from django.urls import path
from . import views
from django.urls import path, include
from .views import (
    register_view, login_view, logout_view, dashboard_view,
    # SiteClient views
    site_list, site_detail, site_create, site_update, site_delete, site_toggle_status,
    # Alerte views
    alerte_list, alerte_detail, alerte_create, alerte_update, alerte_delete,
    alerte_marquer_lue, alerte_archiver, mes_alertes,
    # CameraSurveillance views
    camera_list, camera_detail, camera_create, camera_update, camera_delete,
    # Capteur views
    capteur_list, capteur_detail, capteur_create, capteur_update, capteur_delete,
    # Evenement views
    evenement_list, evenement_detail, evenement_create, evenement_update,
    evenement_delete, evenement_resoudre,
    # RapportSurveillance views
    rapport_list, rapport_detail, rapport_create, rapport_update, rapport_delete,
    # Maintenance views
    maintenance_list, maintenance_detail, maintenance_create, maintenance_update, maintenance_delete,
    # API IA Classification
    train_classifier
)

urlpatterns = [
    # ========== URLs AUTHENTIFICATION ==========
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('', dashboard_view, name='home'),

    # ========== MODULE MAYSSA : URLs SiteClient ==========
    path('sites/', site_list, name='site_list'),
    path('sites/nouveau/', site_create, name='site_create'),
    path('sites/<int:pk>/', site_detail, name='site_detail'),
    path('sites/<int:pk>/modifier/', site_update, name='site_update'),
    path('sites/<int:pk>/supprimer/', site_delete, name='site_delete'),
    path('sites/<int:pk>/toggle-status/', site_toggle_status, name='site_toggle_status'),

    # ========== MODULE MAYSSA : URLs Alerte ==========
    path('alertes/', alerte_list, name='alerte_list'),
    path('alertes/nouvelle/', alerte_create, name='alerte_create'),
    path('alertes/<int:pk>/', alerte_detail, name='alerte_detail'),
    path('alertes/<int:pk>/modifier/', alerte_update, name='alerte_update'),
    path('alertes/<int:pk>/supprimer/', alerte_delete, name='alerte_delete'),
    path('alertes/<int:pk>/marquer-lue/', alerte_marquer_lue, name='alerte_marquer_lue'),
    path('alertes/<int:pk>/archiver/', alerte_archiver, name='alerte_archiver'),
    path('mes-alertes/', mes_alertes, name='mes_alertes'),

    # ========== MODULE KRIZI : URLs CameraSurveillance ==========
    path('cameras/', camera_list, name='camera_list'),
    path('cameras/nouvelle/', camera_create, name='camera_create'),
    path('cameras/<int:pk>/', camera_detail, name='camera_detail'),
    path('cameras/<int:pk>/modifier/', camera_update, name='camera_update'),
    path('cameras/<int:pk>/supprimer/', camera_delete, name='camera_delete'),

    # ========== MODULE KRIZI : URLs Capteur ==========
    path('capteurs/', capteur_list, name='capteur_list'),
    path('capteurs/nouveau/', capteur_create, name='capteur_create'),
    path('capteurs/<int:pk>/', capteur_detail, name='capteur_detail'),
    path('capteurs/<int:pk>/modifier/', capteur_update, name='capteur_update'),
    path('capteurs/<int:pk>/supprimer/', capteur_delete, name='capteur_delete'),

    # ========== MODULE FARES : URLs Evenement ==========
    path('evenements/', evenement_list, name='evenement_list'),
    path('evenements/nouveau/', evenement_create, name='evenement_create'),
    path('evenements/<int:pk>/', evenement_detail, name='evenement_detail'),
    path('evenements/<int:pk>/modifier/', evenement_update, name='evenement_update'),
    path('evenements/<int:pk>/supprimer/', evenement_delete, name='evenement_delete'),
    path('evenements/<int:pk>/resoudre/', evenement_resoudre, name='evenement_resoudre'),

    # ========== MODULE SANA : URLs RapportSurveillance ==========
    path('rapports/', rapport_list, name='rapport_list'),
    path('rapports/nouveau/', rapport_create, name='rapport_create'),
    path('rapports/<int:pk>/', rapport_detail, name='rapport_detail'),
    path('rapports/<int:pk>/modifier/', rapport_update, name='rapport_update'),
    path('rapports/<int:pk>/supprimer/', rapport_delete, name='rapport_delete'),

    # ========== MODULE SANA : URLs Maintenance ==========
    path('maintenances/', maintenance_list, name='maintenance_list'),
    path('maintenances/nouvelle/', maintenance_create, name='maintenance_create'),
    path('maintenances/<int:pk>/', maintenance_detail, name='maintenance_detail'),
    path('maintenances/<int:pk>/modifier/', maintenance_update, name='maintenance_update'),
    path('maintenances/<int:pk>/supprimer/', maintenance_delete, name='maintenance_delete'),

    # ========== API IA Classification ==========
    path('api/alertes/train-classifier/', train_classifier, name='train_classifier'),
    path('api/', include('main.api_urls')),
    path('rapports/nouveau/', views.rapport_create, name='rapport_create'),
]