from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .forms import (
    RegisterForm, LoginForm, SiteClientForm, SiteClientSearchForm,
    AlerteForm, AlerteFilterForm, CameraSurveillanceForm, CameraFilterForm,
    CapteurForm, CapteurFilterForm, EvenementForm, EvenementFilterForm,
    RapportSurveillanceForm, RapportFilterForm, MaintenanceForm, MaintenanceFilterForm
)
from .models import (
    SiteClient, Alerte, Evenement, CustomUser, CameraSurveillance,
    Capteur, RapportSurveillance, Maintenance
)

# ========== VIEWS AUTHENTIFICATION CORRIGÉES ==========
def logout_view(request):
    logout(request)
    return redirect('login')

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Compte créé avec succès ! Bienvenue {user.username}.')
            return redirect('dashboard')
    else:
        form = RegisterForm()
    
    # CORRECTION : Chemin du template changé de 'frontend/register.html' à 'user/register.html'
    return render(request, 'user/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Connexion réussie ! Bienvenue {user.username}.')
            return redirect('dashboard')
    else:
        form = LoginForm()
    
    # CORRECTION : Chemin du template changé de 'frontend/login.html' à 'user/login.html'
    return render(request, 'user/login.html', {'form': form})

@login_required
def dashboard_view(request):
    # Calcul des statistiques pour le dashboard
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
    }
    
    # Alertes non lues pour l'utilisateur connecté
    unread_alerts_count = Alerte.objects.filter(destinataire=request.user, statut='envoyee').count()
    user_alerts_count = Alerte.objects.filter(destinataire=request.user).count()
    
    # Activité récente (exemple basique)
    recent_activities = [
        {
            'type': 'info',
            'title': 'Nouveau site créé',
            'description': 'Le site "Siège Central" a été ajouté',
            'timestamp': 'Il y a 2 heures'
        },
        {
            'type': 'warning',
            'title': 'Alerte de sécurité',
            'description': 'Mouvement détecté à l\'entrée principale',
            'timestamp': 'Il y a 5 heures'
        },
        {
            'type': 'success',
            'title': 'Maintenance terminée',
            'description': 'Caméra 1 remise en service',
            'timestamp': 'Il y a 1 jour'
        }
    ]
    
    context = {
        'stats': stats,
        'unread_alerts_count': unread_alerts_count,
        'user_alerts_count': user_alerts_count,
        'recent_activities': recent_activities,
    }
    
    # CORRECTION : Chemin du template changé de 'frontend/dashboard.html' à 'user/dashboard.html'
    return render(request, 'user/dashboard.html', context)

# ========== MODULE MAYSSA : VIEWS CRUD SITECLIENT ==========
@login_required
def site_list(request):
    sites = SiteClient.objects.all()
    form = SiteClientSearchForm(request.GET)
    
    if form.is_valid():
        recherche = form.cleaned_data.get('recherche')
        statut = form.cleaned_data.get('statut')
        
        if recherche:
            sites = sites.filter(
                Q(nom__icontains=recherche) |
                Q(contact_principal__icontains=recherche) |
                Q(email__icontains=recherche)
            )
        if statut:
            sites = sites.filter(statut=statut)
    
    sites = sites.annotate(
        nb_cameras=Count('camerasurveillance'),
        nb_capteurs=Count('capteur'),
        nb_evenements=Count('evenement')
    )
    
    context = {'sites': sites, 'form': form, 'total_sites': sites.count()}
    return render(request, 'siteclient/site_list.html', context)

@login_required
def site_detail(request, pk):
    site = get_object_or_404(SiteClient, pk=pk)
    cameras = site.camerasurveillance_set.all()
    capteurs = site.capteur_set.all()
    evenements = site.evenement_set.all()[:10]
    alertes = Alerte.objects.filter(evenement__site=site)[:10]
    
    context = {
        'site': site, 'cameras': cameras, 'capteurs': capteurs,
        'evenements': evenements, 'alertes': alertes,
        'nb_cameras': cameras.count(), 'nb_capteurs': capteurs.count(),
        'nb_evenements': evenements.count(),
    }
    return render(request, 'siteclient/site_detail.html', context)

@login_required
def site_create(request):
    if request.method == 'POST':
        form = SiteClientForm(request.POST)
        if form.is_valid():
            site = form.save()
            messages.success(request, f'Le site "{site.nom}" a été créé avec succès !')
            return redirect('site_detail', pk=site.pk)
    else:
        form = SiteClientForm()
    
    context = {'form': form, 'action': 'Créer', 'title': 'Nouveau Site Client'}
    return render(request, 'siteclient/site_form.html', context)

@login_required
def site_update(request, pk):
    site = get_object_or_404(SiteClient, pk=pk)
    
    if request.method == 'POST':
        form = SiteClientForm(request.POST, instance=site)
        if form.is_valid():
            site = form.save()
            messages.success(request, f'Le site "{site.nom}" a été mis à jour !')
            return redirect('site_detail', pk=site.pk)
    else:
        form = SiteClientForm(instance=site)
    
    context = {'form': form, 'site': site, 'action': 'Modifier', 'title': f'Modifier {site.nom}'}
    return render(request, 'siteclient/site_form.html', context)

@login_required
def site_delete(request, pk):
    site = get_object_or_404(SiteClient, pk=pk)
    
    if request.method == 'POST':
        nom_site = site.nom
        site.delete()
        messages.success(request, f'Le site "{nom_site}" a été supprimé !')
        return redirect('site_list')
    
    context = {
        'site': site,
        'nb_cameras': site.camerasurveillance_set.count(),
        'nb_capteurs': site.capteur_set.count(),
        'nb_evenements': site.evenement_set.count(),
    }
    return render(request, 'siteclient/site_confirm_delete.html', context)

@login_required
def site_toggle_status(request, pk):
    site = get_object_or_404(SiteClient, pk=pk)
    
    if request.method == 'POST':
        site.statut = 'inactif' if site.statut == 'actif' else 'actif'
        site.save()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'statut': site.statut,
                'message': f'Statut changé en {site.get_statut_display()}'
            })
        
        messages.success(request, f'Le statut du site a été changé en {site.get_statut_display()}')
        return redirect('site_detail', pk=pk)
    
    return redirect('site_list')

# ========== MODULE MAYSSA : VIEWS CRUD ALERTE ==========
@login_required
def alerte_list(request):
    alertes = Alerte.objects.select_related('evenement', 'destinataire', 'evenement__site').all()
    form = AlerteFilterForm(request.GET)
    
    if form.is_valid():
        niveau = form.cleaned_data.get('niveau')
        statut = form.cleaned_data.get('statut')
        destinataire = form.cleaned_data.get('destinataire')
        
        if niveau:
            alertes = alertes.filter(niveau=niveau)
        if statut:
            alertes = alertes.filter(statut=statut)
        if destinataire:
            alertes = alertes.filter(destinataire=destinataire)
    
    stats = {
        'total': alertes.count(),
        'critiques': alertes.filter(niveau='critique').count(),
        'non_lues': alertes.filter(statut='envoyee').count(),
        'archivees': alertes.filter(statut='archivee').count(),
    }
    
    context = {'alertes': alertes, 'form': form, 'stats': stats}
    return render(request, 'alerte/alerte_list.html', context)

@login_required
def alerte_detail(request, pk):
    alerte = get_object_or_404(Alerte.objects.select_related('evenement', 'destinataire', 'evenement__site'), pk=pk)
    
    if request.user == alerte.destinataire and alerte.statut == 'envoyee':
        alerte.marquer_comme_lue()
    
    context = {'alerte': alerte}
    return render(request, 'alerte/alerte_detail.html', context)

@login_required
def alerte_create(request):
    if request.method == 'POST':
        form = AlerteForm(request.POST)
        if form.is_valid():
            alerte = form.save()
            messages.success(request, f'Alerte créée pour {alerte.destinataire.username} !')
            return redirect('alerte_detail', pk=alerte.pk)
    else:
        form = AlerteForm()
    
    context = {'form': form, 'action': 'Créer', 'title': 'Nouvelle Alerte'}
    return render(request, 'alerte/alerte_form.html', context)

@login_required
def alerte_update(request, pk):
    alerte = get_object_or_404(Alerte, pk=pk)
    
    if request.method == 'POST':
        form = AlerteForm(request.POST, instance=alerte)
        if form.is_valid():
            alerte = form.save()
            messages.success(request, 'Alerte mise à jour !')
            return redirect('alerte_detail', pk=alerte.pk)
    else:
        form = AlerteForm(instance=alerte)
    
    context = {'form': form, 'alerte': alerte, 'action': 'Modifier', 'title': 'Modifier l\'alerte'}
    return render(request, 'alerte/alerte_form.html', context)

@login_required
def alerte_delete(request, pk):
    alerte = get_object_or_404(Alerte, pk=pk)
    
    if request.method == 'POST':
        alerte.delete()
        messages.success(request, 'Alerte supprimée !')
        return redirect('alerte_list')
    
    context = {'alerte': alerte}
    return render(request, 'alerte/alerte_confirm_delete.html', context)

@login_required
def alerte_marquer_lue(request, pk):
    alerte = get_object_or_404(Alerte, pk=pk)
    
    if request.method == 'POST':
        alerte.marquer_comme_lue()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True, 'statut': alerte.statut, 'message': 'Alerte marquée comme lue'})
        
        messages.success(request, 'Alerte marquée comme lue !')
        return redirect('alerte_detail', pk=pk)
    
    return redirect('alerte_list')

@login_required
def alerte_archiver(request, pk):
    alerte = get_object_or_404(Alerte, pk=pk)
    
    if request.method == 'POST':
        alerte.archiver()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True, 'statut': alerte.statut, 'message': 'Alerte archivée'})
        
        messages.success(request, 'Alerte archivée !')
        return redirect('alerte_list')
    
    return redirect('alerte_list')

@login_required
def mes_alertes(request):
    alertes = Alerte.objects.filter(destinataire=request.user).select_related('evenement', 'evenement__site')
    
    stats = {
        'total': alertes.count(),
        'non_lues': alertes.filter(statut='envoyee').count(),
        'critiques': alertes.filter(niveau='critique', statut__in=['envoyee', 'lue']).count(),
    }
    
    context = {'alertes': alertes, 'stats': stats}
    return render(request, 'alerte/mes_alertes.html', context)

# ========== MODULE KRIZI : VIEWS CRUD CAMERASURVEILLANCE ==========
@login_required
def camera_list(request):
    cameras = CameraSurveillance.objects.select_related('site').all()
    form = CameraFilterForm(request.GET)
    
    if form.is_valid():
        site = form.cleaned_data.get('site')
        etat = form.cleaned_data.get('etat')
        type_camera = form.cleaned_data.get('type')
        
        if site:
            cameras = cameras.filter(site=site)
        if etat:
            cameras = cameras.filter(etat=etat)
        if type_camera:
            cameras = cameras.filter(type=type_camera)
    
    stats = {
        'total': cameras.count(),
        'en_ligne': cameras.filter(etat='en_ligne').count(),
        'hors_ligne': cameras.filter(etat='hors_ligne').count(),
        'maintenance': cameras.filter(etat='maintenance').count(),
    }
    
    context = {'cameras': cameras, 'form': form, 'stats': stats}
    return render(request, 'camera/camera_list.html', context)

@login_required
def camera_detail(request, pk):
    camera = get_object_or_404(CameraSurveillance.objects.select_related('site'), pk=pk)
    evenements = camera.evenement_set.all()[:10]
    
    context = {
        'camera': camera,
        'evenements': evenements,
        'nb_evenements': camera.evenement_set.count(),
    }
    return render(request, 'camera/camera_detail.html', context)

@login_required
def camera_create(request):
    if request.method == 'POST':
        form = CameraSurveillanceForm(request.POST)
        if form.is_valid():
            camera = form.save()
            messages.success(request, f'La caméra "{camera.nom}" a été créée !')
            return redirect('camera_detail', pk=camera.pk)
    else:
        form = CameraSurveillanceForm()
    
    context = {'form': form, 'action': 'Créer', 'title': 'Nouvelle Caméra'}
    return render(request, 'camera/camera_form.html', context)

@login_required
def camera_update(request, pk):
    camera = get_object_or_404(CameraSurveillance, pk=pk)
    
    if request.method == 'POST':
        form = CameraSurveillanceForm(request.POST, instance=camera)
        if form.is_valid():
            camera = form.save()
            messages.success(request, f'La caméra "{camera.nom}" a été mise à jour !')
            return redirect('camera_detail', pk=camera.pk)
    else:
        form = CameraSurveillanceForm(instance=camera)
    
    context = {'form': form, 'camera': camera, 'action': 'Modifier', 'title': f'Modifier {camera.nom}'}
    return render(request, 'camera/camera_form.html', context)

@login_required
def camera_delete(request, pk):
    camera = get_object_or_404(CameraSurveillance, pk=pk)
    
    if request.method == 'POST':
        nom_camera = camera.nom
        camera.delete()
        messages.success(request, f'La caméra "{nom_camera}" a été supprimée !')
        return redirect('camera_list')
    
    context = {'camera': camera, 'nb_evenements': camera.evenement_set.count()}
    return render(request, 'camera/camera_confirm_delete.html', context)

# ========== MODULE KRIZI : VIEWS CRUD CAPTEUR ==========
@login_required
def capteur_list(request):
    capteurs = Capteur.objects.select_related('site').all()
    form = CapteurFilterForm(request.GET)
    
    if form.is_valid():
        site = form.cleaned_data.get('site')
        type_capteur = form.cleaned_data.get('type')
        statut = form.cleaned_data.get('statut')
        
        if site:
            capteurs = capteurs.filter(site=site)
        if type_capteur:
            capteurs = capteurs.filter(type=type_capteur)
        if statut:
            capteurs = capteurs.filter(statut=statut)
    
    stats = {
        'total': capteurs.count(),
        'actifs': capteurs.filter(statut='actif').count(),
        'inactifs': capteurs.filter(statut='inactif').count(),
        'defectueux': capteurs.filter(statut='defectueux').count(),
    }
    
    context = {'capteurs': capteurs, 'form': form, 'stats': stats}
    return render(request, 'capteur/capteur_list.html', context)

@login_required
def capteur_detail(request, pk):
    capteur = get_object_or_404(Capteur.objects.select_related('site'), pk=pk)
    evenements = capteur.evenement_set.all()[:10]
    
    context = {
        'capteur': capteur,
        'evenements': evenements,
        'nb_evenements': capteur.evenement_set.count(),
    }
    return render(request, 'capteur/capteur_detail.html', context)

@login_required
def capteur_create(request):
    if request.method == 'POST':
        form = CapteurForm(request.POST)
        if form.is_valid():
            capteur = form.save()
            messages.success(request, f'Le capteur "{capteur.get_type_display()}" a été créé !')
            return redirect('capteur_detail', pk=capteur.pk)
    else:
        form = CapteurForm()
    
    context = {'form': form, 'action': 'Créer', 'title': 'Nouveau Capteur'}
    return render(request, 'capteur/capteur_form.html', context)

@login_required
def capteur_update(request, pk):
    capteur = get_object_or_404(Capteur, pk=pk)
    
    if request.method == 'POST':
        form = CapteurForm(request.POST, instance=capteur)
        if form.is_valid():
            capteur = form.save()
            messages.success(request, 'Le capteur a été mis à jour !')
            return redirect('capteur_detail', pk=capteur.pk)
    else:
        form = CapteurForm(instance=capteur)
    
    context = {'form': form, 'capteur': capteur, 'action': 'Modifier', 'title': 'Modifier le capteur'}
    return render(request, 'capteur/capteur_form.html', context)

@login_required
def capteur_delete(request, pk):
    capteur = get_object_or_404(Capteur, pk=pk)
    
    if request.method == 'POST':
        capteur.delete()
        messages.success(request, 'Le capteur a été supprimé !')
        return redirect('capteur_list')
    
    context = {'capteur': capteur, 'nb_evenements': capteur.evenement_set.count()}
    return render(request, 'capteur/capteur_confirm_delete.html', context)

# ========== MODULE FARES : VIEWS CRUD EVENEMENT ==========
@login_required
def evenement_list(request):
    evenements = Evenement.objects.select_related('site', 'camera', 'capteur').all()
    form = EvenementFilterForm(request.GET)
    
    if form.is_valid():
        site = form.cleaned_data.get('site')
        type_evenement = form.cleaned_data.get('type_evenement')
        niveau_urgence = form.cleaned_data.get('niveau_urgence')
        statut = form.cleaned_data.get('statut')
        
        if site:
            evenements = evenements.filter(site=site)
        if type_evenement:
            evenements = evenements.filter(type_evenement=type_evenement)
        if niveau_urgence:
            evenements = evenements.filter(niveau_urgence=niveau_urgence)
        if statut:
            evenements = evenements.filter(statut=statut)
    
    stats = {
        'total': evenements.count(),
        'en_cours': evenements.filter(statut='en_cours').count(),
        'resolus': evenements.filter(statut='resolu').count(),
        'critiques': evenements.filter(niveau_urgence='critique').count(),
    }
    
    context = {'evenements': evenements, 'form': form, 'stats': stats}
    return render(request, 'evenement/evenement_list.html', context)

@login_required
def evenement_detail(request, pk):
    evenement = get_object_or_404(Evenement.objects.select_related('site', 'camera', 'capteur'), pk=pk)
    alertes = evenement.alerte_set.all()
    
    context = {
        'evenement': evenement,
        'alertes': alertes,
        'nb_alertes': alertes.count(),
    }
    return render(request, 'evenement/evenement_detail.html', context)

@login_required
def evenement_create(request):
    if request.method == 'POST':
        form = EvenementForm(request.POST)
        if form.is_valid():
            evenement = form.save()
            messages.success(request, f'L\'événement "{evenement.get_type_evenement_display()}" a été créé !')
            return redirect('evenement_detail', pk=evenement.pk)
    else:
        form = EvenementForm()
    
    context = {'form': form, 'action': 'Créer', 'title': 'Nouvel Événement'}
    return render(request, 'evenement/evenement_form.html', context)

@login_required
def evenement_update(request, pk):
    evenement = get_object_or_404(Evenement, pk=pk)
    
    if request.method == 'POST':
        form = EvenementForm(request.POST, instance=evenement)
        if form.is_valid():
            evenement = form.save()
            messages.success(request, 'L\'événement a été mis à jour !')
            return redirect('evenement_detail', pk=evenement.pk)
    else:
        form = EvenementForm(instance=evenement)
    
    context = {'form': form, 'evenement': evenement, 'action': 'Modifier', 'title': 'Modifier l\'événement'}
    return render(request, 'evenement/evenement_form.html', context)

@login_required
def evenement_delete(request, pk):
    evenement = get_object_or_404(Evenement, pk=pk)
    
    if request.method == 'POST':
        evenement.delete()
        messages.success(request, 'L\'événement a été supprimé !')
        return redirect('evenement_list')
    
    context = {'evenement': evenement, 'nb_alertes': evenement.alerte_set.count()}
    return render(request, 'evenement/evenement_confirm_delete.html', context)

@login_required
def evenement_resoudre(request, pk):
    evenement = get_object_or_404(Evenement, pk=pk)
    
    if request.method == 'POST':
        evenement.statut = 'resolu'
        evenement.save()
        messages.success(request, 'L\'événement a été marqué comme résolu !')
        return redirect('evenement_detail', pk=pk)
    
    return redirect('evenement_list')

# ========== MODULE SANA : VIEWS CRUD RAPPORTSURVEILLANCE ==========
@login_required
def rapport_list(request):
    rapports = RapportSurveillance.objects.select_related('site', 'auteur').all()
    form = RapportFilterForm(request.GET)
    
    if form.is_valid():
        site = form.cleaned_data.get('site')
        periode = form.cleaned_data.get('periode')
        
        if site:
            rapports = rapports.filter(site=site)
        if periode:
            rapports = rapports.filter(periode__icontains=periode)
    
    context = {'rapports': rapports, 'form': form, 'total': rapports.count()}
    return render(request, 'rapport/rapport_list.html', context)

@login_required
def rapport_detail(request, pk):
    rapport = get_object_or_404(RapportSurveillance.objects.select_related('site', 'auteur'), pk=pk)
    context = {'rapport': rapport}
    return render(request, 'rapport/rapport_detail.html', context)

@login_required
def rapport_create(request):
    if request.method == 'POST':
        form = RapportSurveillanceForm(request.POST)
        if form.is_valid():
            rapport = form.save(commit=False)
            rapport.auteur = request.user
            rapport.save()
            messages.success(request, 'Le rapport a été créé !')
            return redirect('rapport_detail', pk=rapport.pk)
    else:
        form = RapportSurveillanceForm()
    
    context = {'form': form, 'action': 'Créer', 'title': 'Nouveau Rapport'}
    return render(request, 'rapport/rapport_form.html', context)

@login_required
def rapport_update(request, pk):
    rapport = get_object_or_404(RapportSurveillance, pk=pk)
    
    if request.method == 'POST':
        form = RapportSurveillanceForm(request.POST, instance=rapport)
        if form.is_valid():
            rapport = form.save()
            messages.success(request, 'Le rapport a été mis à jour !')
            return redirect('rapport_detail', pk=rapport.pk)
    else:
        form = RapportSurveillanceForm(instance=rapport)
    
    context = {'form': form, 'rapport': rapport, 'action': 'Modifier', 'title': 'Modifier le rapport'}
    return render(request, 'rapport/rapport_form.html', context)

@login_required
def rapport_delete(request, pk):
    rapport = get_object_or_404(RapportSurveillance, pk=pk)
    
    if request.method == 'POST':
        rapport.delete()
        messages.success(request, 'Le rapport a été supprimé !')
        return redirect('rapport_list')
    
    context = {'rapport': rapport}
    return render(request, 'rapport/rapport_confirm_delete.html', context)

# ========== MODULE SANA : VIEWS CRUD MAINTENANCE ==========
@login_required
def maintenance_list(request):
    maintenances = Maintenance.objects.select_related('site').all()
    form = MaintenanceFilterForm(request.GET)
    
    if form.is_valid():
        site = form.cleaned_data.get('site')
        statut = form.cleaned_data.get('statut')
        date_debut = form.cleaned_data.get('date_debut')
        date_fin = form.cleaned_data.get('date_fin')
        
        if site:
            maintenances = maintenances.filter(site=site)
        if statut:
            maintenances = maintenances.filter(statut=statut)
        if date_debut:
            maintenances = maintenances.filter(date_prevue__gte=date_debut)
        if date_fin:
            maintenances = maintenances.filter(date_prevue__lte=date_fin)
    
    stats = {
        'total': maintenances.count(),
        'planifiees': maintenances.filter(statut='planifiee').count(),
        'en_cours': maintenances.filter(statut='en_cours').count(),
        'realisees': maintenances.filter(statut='realisee').count(),
    }
    
    context = {'maintenances': maintenances, 'form': form, 'stats': stats}
    return render(request, 'maintenance/maintenance_list.html', context)

@login_required
def maintenance_detail(request, pk):
    maintenance = get_object_or_404(Maintenance.objects.select_related('site'), pk=pk)
    context = {'maintenance': maintenance}
    return render(request, 'maintenance/maintenance_detail.html', context)

# ========== API IA CLASSIFICATION ==========
@csrf_exempt
@require_POST
def train_classifier(request):
    """Endpoint pour réentraîner le classifieur - SANS AUTH"""
    try:
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

        return JsonResponse({
            'status': 'success',
            'message': 'Modèle IA réentraîné avec succès!',
            'training_samples': len(data),
            'categories_distribution': categories,
            'model_type': 'Naive Bayes Multinomial',
            'features': 'TF-IDF Vectorizer'
        })

    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Erreur: {str(e)}'
        }, status=500)

@login_required
def maintenance_create(request):
    if request.method == 'POST':
        form = MaintenanceForm(request.POST)
        if form.is_valid():
            maintenance = form.save()
            messages.success(request, 'La maintenance a été planifiée !')
            return redirect('maintenance_detail', pk=maintenance.pk)
    else:
        form = MaintenanceForm()
    
    context = {'form': form, 'action': 'Créer', 'title': 'Nouvelle Maintenance'}
    return render(request, 'maintenance/maintenance_form.html', context)

@login_required
def maintenance_update(request, pk):
    maintenance = get_object_or_404(Maintenance, pk=pk)
    
    if request.method == 'POST':
        form = MaintenanceForm(request.POST, instance=maintenance)
        if form.is_valid():
            maintenance = form.save()
            messages.success(request, 'La maintenance a été mise à jour !')
            return redirect('maintenance_detail', pk=maintenance.pk)
    else:
        form = MaintenanceForm(instance=maintenance)
    
    context = {'form': form, 'maintenance': maintenance, 'action': 'Modifier', 'title': 'Modifier la maintenance'}
    return render(request, 'maintenance/maintenance_form.html', context)

@login_required
def maintenance_delete(request, pk):
    maintenance = get_object_or_404(Maintenance, pk=pk)
    
    if request.method == 'POST':
        maintenance.delete()
        messages.success(request, 'La maintenance a été supprimée !')
        return redirect('maintenance_list')
    
    context = {'maintenance': maintenance}
    return render(request, 'maintenance/maintenance_confirm_delete.html', context)



# --- Vue création rapport ---
from .forms import RapportSurveillanceForm
from .models import RapportSurveillance

def rapport_create(request):
    if request.method == 'POST':
        form = RapportSurveillanceForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('rapport_list')
    else:
        form = RapportSurveillanceForm()
    return render(request, 'rapport_form.html', {'form': form})
# ========== MODULE IA : PREDICTION MULTIPLE DES MAINTENANCES ==========
from django.http import JsonResponse
from .ml_predictor import predict_next_maintenance
from .models import Maintenance, SiteClient

@login_required
@api_view(['GET'])
def predict_all_maintenance(request):
    from .models import Maintenance
    from .ml_predictor import predict_next_maintenance
    import datetime

    maintenances = Maintenance.objects.all()
    predictions = []

    for maintenance in maintenances:
        try:
            result = predict_next_maintenance({
                "type_maintenance": maintenance.type_maintenance,
                "equipement": str(maintenance.equipement),
                "site_nom": maintenance.site_nom,
                "duree_estimee": maintenance.duree_estimee or 1,
                "priorite": maintenance.priorite or "moyenne",
                "statut": maintenance.statut or "planifiee",
                "cout_estime": maintenance.cout_estime or 0,
            })

            if result:
                predictions.append({
                    "equipement": str(maintenance.equipement),
                    "site": maintenance.site_nom,
                    "predicted_days": result.get("predicted_days"),
                    "recommended_date": result.get("recommended_date"),
                })
        except Exception as e:
            print(f"Erreur pour {maintenance.equipement} : {e}")

    # ✅ on renvoie toute la liste des prédictions
    return Response(predictions)









