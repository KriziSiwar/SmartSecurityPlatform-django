from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, SiteClient, Alerte, CameraSurveillance, 
    Capteur, Evenement, RapportSurveillance, Maintenance
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff', 'date_creation')
    list_filter = ('role', 'is_active', 'is_staff', 'date_creation')
    search_fields = ('username', 'email', 'nom')
    fieldsets = UserAdmin.fieldsets + (
        ('Informations supplémentaires', {'fields': ('role', 'nom', 'date_creation', 'actif')}),
    )


# ========== MODULE MAYSSA : ADMIN SITECLIENT ==========
@admin.register(SiteClient)
class SiteClientAdmin(admin.ModelAdmin):
    list_display = ('nom', 'contact_principal', 'telephone', 'email', 'statut', 'date_creation', 'nb_equipements')
    list_filter = ('statut', 'date_creation')
    search_fields = ('nom', 'contact_principal', 'email', 'adresse')
    readonly_fields = ('date_creation',)
    list_per_page = 20
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'adresse', 'statut')
        }),
        ('Contact', {
            'fields': ('contact_principal', 'telephone', 'email')
        }),
        ('Métadonnées', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )
    
    def nb_equipements(self, obj):
        cameras = obj.camerasurveillance_set.count()
        capteurs = obj.capteur_set.count()
        return f"📹 {cameras} | 📡 {capteurs}"
    nb_equipements.short_description = 'Équipements'
    
    actions = ['activer_sites', 'desactiver_sites']
    
    def activer_sites(self, request, queryset):
        updated = queryset.update(statut='actif')
        self.message_user(request, f'{updated} site(s) activé(s).')
    activer_sites.short_description = "Activer les sites sélectionnés"
    
    def desactiver_sites(self, request, queryset):
        updated = queryset.update(statut='inactif')
        self.message_user(request, f'{updated} site(s) désactivé(s).')
    desactiver_sites.short_description = "Désactiver les sites sélectionnés"


# ========== MODULE MAYSSA : ADMIN ALERTE ==========
@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = ('id', 'niveau_badge', 'evenement', 'destinataire', 'statut_badge', 'date_envoi')
    list_filter = ('niveau', 'statut', 'date_envoi', 'destinataire')
    search_fields = ('message', 'evenement__type_evenement', 'destinataire__username')
    readonly_fields = ('date_envoi',)
    list_per_page = 20
    date_hierarchy = 'date_envoi'
    
    fieldsets = (
        ('Événement', {'fields': ('evenement',)}),
        ('Alerte', {'fields': ('message', 'niveau', 'statut')}),
        ('Destinataire', {'fields': ('destinataire',)}),
        ('Métadonnées', {'fields': ('date_envoi',), 'classes': ('collapse',)}),
    )
    
    def niveau_badge(self, obj):
        colors = {'critique': 'red', 'moyen': 'orange', 'info': 'blue'}
        color = colors.get(obj.niveau, 'gray')
        return f'<span style="background-color:{color};color:white;padding:3px 8px;border-radius:3px;">{obj.get_niveau_display()}</span>'
    niveau_badge.short_description = 'Niveau'
    niveau_badge.allow_tags = True
    
    def statut_badge(self, obj):
        colors = {'envoyee': 'orange', 'lue': 'green', 'archivee': 'gray'}
        color = colors.get(obj.statut, 'gray')
        return f'<span style="background-color:{color};color:white;padding:3px 8px;border-radius:3px;">{obj.get_statut_display()}</span>'
    statut_badge.short_description = 'Statut'
    statut_badge.allow_tags = True
    
    actions = ['marquer_comme_lues', 'archiver_alertes']
    
    def marquer_comme_lues(self, request, queryset):
        updated = queryset.update(statut='lue')
        self.message_user(request, f'{updated} alerte(s) marquée(s) comme lue(s).')
    marquer_comme_lues.short_description = "Marquer comme lues"
    
    def archiver_alertes(self, request, queryset):
        updated = queryset.update(statut='archivee')
        self.message_user(request, f'{updated} alerte(s) archivée(s).')
    archiver_alertes.short_description = "Archiver les alertes"


# ========== MODULE KRIZI : ADMIN CAMERASURVEILLANCE ==========
@admin.register(CameraSurveillance)
class CameraSurveillanceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'site', 'ip_address', 'emplacement', 'etat_badge', 'type', 'derniere_connexion')
    list_filter = ('etat', 'type', 'site')
    search_fields = ('nom', 'ip_address', 'emplacement', 'site__nom')
    readonly_fields = ('derniere_connexion',)
    list_per_page = 20
    date_hierarchy = 'derniere_connexion'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('site', 'nom', 'type')
        }),
        ('Configuration réseau', {
            'fields': ('ip_address', 'emplacement')
        }),
        ('Statut', {
            'fields': ('etat', 'derniere_connexion')
        }),
    )
    
    def etat_badge(self, obj):
        colors = {'en_ligne': 'green', 'hors_ligne': 'red', 'maintenance': 'orange'}
        color = colors.get(obj.etat, 'gray')
        return f'<span style="background-color:{color};color:white;padding:3px 8px;border-radius:3px;">{obj.get_etat_display()}</span>'
    etat_badge.short_description = 'État'
    etat_badge.allow_tags = True
    
    actions = ['mettre_en_ligne', 'mettre_hors_ligne', 'mettre_en_maintenance']
    
    def mettre_en_ligne(self, request, queryset):
        updated = queryset.update(etat='en_ligne')
        self.message_user(request, f'{updated} caméra(s) mise(s) en ligne.')
    mettre_en_ligne.short_description = "Mettre en ligne"
    
    def mettre_hors_ligne(self, request, queryset):
        updated = queryset.update(etat='hors_ligne')
        self.message_user(request, f'{updated} caméra(s) mise(s) hors ligne.')
    mettre_hors_ligne.short_description = "Mettre hors ligne"
    
    def mettre_en_maintenance(self, request, queryset):
        updated = queryset.update(etat='maintenance')
        self.message_user(request, f'{updated} caméra(s) en maintenance.')
    mettre_en_maintenance.short_description = "Mettre en maintenance"


# ========== MODULE KRIZI : ADMIN CAPTEUR ==========
@admin.register(Capteur)
class CapteurAdmin(admin.ModelAdmin):
    list_display = ('type', 'site', 'emplacement', 'statut_badge', 'derniere_mesure')
    list_filter = ('type', 'statut', 'site')
    search_fields = ('type', 'emplacement', 'site__nom')
    readonly_fields = ('derniere_mesure',)
    list_per_page = 20
    date_hierarchy = 'derniere_mesure'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('site', 'type', 'emplacement')
        }),
        ('Statut', {
            'fields': ('statut', 'derniere_mesure')
        }),
    )
    
    def statut_badge(self, obj):
        colors = {'actif': 'green', 'inactif': 'gray', 'defectueux': 'red'}
        color = colors.get(obj.statut, 'gray')
        return f'<span style="background-color:{color};color:white;padding:3px 8px;border-radius:3px;">{obj.get_statut_display()}</span>'
    statut_badge.short_description = 'Statut'
    statut_badge.allow_tags = True
    
    actions = ['activer_capteurs', 'desactiver_capteurs']
    
    def activer_capteurs(self, request, queryset):
        updated = queryset.update(statut='actif')
        self.message_user(request, f'{updated} capteur(s) activé(s).')
    activer_capteurs.short_description = "Activer les capteurs"
    
    def desactiver_capteurs(self, request, queryset):
        updated = queryset.update(statut='inactif')
        self.message_user(request, f'{updated} capteur(s) désactivé(s).')
    desactiver_capteurs.short_description = "Désactiver les capteurs"


# ========== MODULE FARES : ADMIN EVENEMENT ==========
@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    list_display = ('type_evenement', 'site', 'niveau_urgence_badge', 'statut_badge', 'date_detection')
    list_filter = ('type_evenement', 'niveau_urgence', 'statut', 'date_detection', 'site')
    search_fields = ('type_evenement', 'description', 'site__nom')
    readonly_fields = ('date_detection',)
    list_per_page = 20
    date_hierarchy = 'date_detection'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('site', 'type_evenement', 'niveau_urgence', 'statut')
        }),
        ('Source', {
            'fields': ('camera', 'capteur')
        }),
        ('Détails', {
            'fields': ('description', 'date_detection')
        }),
    )
    
    def niveau_urgence_badge(self, obj):
        colors = {'critique': 'red', 'eleve': 'orange', 'moyen': 'yellow', 'faible': 'blue'}
        color = colors.get(obj.niveau_urgence, 'gray')
        return f'<span style="background-color:{color};color:white;padding:3px 8px;border-radius:3px;">{obj.get_niveau_urgence_display()}</span>'
    niveau_urgence_badge.short_description = 'Niveau'
    niveau_urgence_badge.allow_tags = True
    
    def statut_badge(self, obj):
        colors = {'en_cours': 'orange', 'resolu': 'green'}
        color = colors.get(obj.statut, 'gray')
        return f'<span style="background-color:{color};color:white;padding:3px 8px;border-radius:3px;">{obj.get_statut_display()}</span>'
    statut_badge.short_description = 'Statut'
    statut_badge.allow_tags = True
    
    actions = ['marquer_resolus']
    
    def marquer_resolus(self, request, queryset):
        updated = queryset.update(statut='resolu')
        self.message_user(request, f'{updated} événement(s) marqué(s) comme résolu(s).')
    marquer_resolus.short_description = "Marquer comme résolus"


# ========== MODULE SANA : ADMIN RAPPORTSURVEILLANCE ==========
@admin.register(RapportSurveillance)
class RapportSurveillanceAdmin(admin.ModelAdmin):
    list_display = ('site', 'periode', 'auteur', 'date_generation')
    list_filter = ('site', 'date_generation', 'auteur')
    search_fields = ('site__nom', 'periode', 'contenu', 'auteur__username')
    readonly_fields = ('date_generation',)
    list_per_page = 20
    date_hierarchy = 'date_generation'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('site', 'periode', 'auteur')
        }),
        ('Contenu', {
            'fields': ('contenu',)
        }),
        ('Métadonnées', {
            'fields': ('date_generation',),
            'classes': ('collapse',)
        }),
    )


# ========== MODULE SANA : ADMIN MAINTENANCE ==========
@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('equipement', 'site', 'date_prevue', 'technicien', 'statut_badge')
    list_filter = ('statut', 'date_prevue', 'site')
    search_fields = ('equipement', 'technicien', 'site__nom', 'commentaire')
    list_per_page = 20
    date_hierarchy = 'date_prevue'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('site', 'equipement', 'technicien')
        }),
        ('Planification', {
            'fields': ('date_prevue', 'statut')
        }),
        ('Notes', {
            'fields': ('commentaire',)
        }),
    )
    
    def statut_badge(self, obj):
        colors = {
            'planifiee': 'blue',
            'en_cours': 'orange',
            'realisee': 'green',
            'annulee': 'gray'
        }
        color = colors.get(obj.statut, 'gray')
        return f'<span style="background-color:{color};color:white;padding:3px 8px;border-radius:3px;">{obj.get_statut_display()}</span>'
    statut_badge.short_description = 'Statut'
    statut_badge.allow_tags = True
    
    actions = ['marquer_realisees', 'marquer_en_cours']
    
    def marquer_realisees(self, request, queryset):
        updated = queryset.update(statut='realisee')
        self.message_user(request, f'{updated} maintenance(s) marquée(s) comme réalisée(s).')
    marquer_realisees.short_description = "Marquer comme réalisées"
    
    def marquer_en_cours(self, request, queryset):
        updated = queryset.update(statut='en_cours')
        self.message_user(request, f'{updated} maintenance(s) en cours.')
    marquer_en_cours.short_description = "Mettre en cours"