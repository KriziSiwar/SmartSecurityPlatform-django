from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrateur'),
        ('technicien', 'Technicien'),
        ('client', 'Client'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    nom = models.CharField(max_length=100, blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ========== MODULE MAYSSA : SiteClient ==========
class SiteClient(models.Model):
    STATUT_CHOICES = (
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
    )
    
    nom = models.CharField(max_length=200, verbose_name="Nom du site")
    adresse = models.TextField(verbose_name="Adresse complète")
    contact_principal = models.CharField(max_length=100, verbose_name="Contact principal")
    telephone = models.CharField(max_length=20, verbose_name="Téléphone")
    email = models.EmailField(verbose_name="Email")
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='actif', verbose_name="Statut")
    
    class Meta:
        verbose_name = "Site Client"
        verbose_name_plural = "Sites Clients"
        ordering = ['-date_creation']
    
    def __str__(self):
        return self.nom


# ========== MODULE KRIZI : CameraSurveillance ==========
class CameraSurveillance(models.Model):
    ETAT_CHOICES = (
        ('en_ligne', 'En ligne'),
        ('hors_ligne', 'Hors ligne'),
        ('maintenance', 'En maintenance'),
    )
    
    TYPE_CHOICES = (
        ('fixe', 'Fixe'),
        ('ptz', 'PTZ (Pan-Tilt-Zoom)'),
        ('thermique', 'Thermique'),
        ('dome', 'Dôme'),
    )
    
    site = models.ForeignKey(SiteClient, on_delete=models.CASCADE, verbose_name="Site")
    nom = models.CharField(max_length=100, verbose_name="Nom de la caméra")
    ip_address = models.GenericIPAddressField(verbose_name="Adresse IP")
    emplacement = models.CharField(max_length=150, verbose_name="Emplacement")
    etat = models.CharField(max_length=50, choices=ETAT_CHOICES, default='hors_ligne', verbose_name="État")
    derniere_connexion = models.DateTimeField(auto_now=True, verbose_name="Dernière connexion")
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='fixe', verbose_name="Type")
    
    class Meta:
        verbose_name = "Caméra de Surveillance"
        verbose_name_plural = "Caméras de Surveillance"
        ordering = ['-derniere_connexion']
    
    def __str__(self):
        return f"{self.nom} - {self.site.nom}"


# ========== MODULE KRIZI : Capteur ==========
class Capteur(models.Model):
    TYPE_CHOICES = (
        ('mouvement', 'Détecteur de Mouvement'),
        ('fumee', 'Détecteur de Fumée'),
        ('temperature', 'Capteur de Température'),
        ('humidite', 'Capteur d\'Humidité'),
        ('intrusion', 'Détecteur d\'Intrusion'),
        ('gaz', 'Détecteur de Gaz'),
    )
    
    STATUT_CHOICES = (
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('defectueux', 'Défectueux'),
    )
    
    site = models.ForeignKey(SiteClient, on_delete=models.CASCADE, verbose_name="Site")
    type = models.CharField(max_length=100, choices=TYPE_CHOICES, verbose_name="Type de capteur")
    emplacement = models.CharField(max_length=150, verbose_name="Emplacement")
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='actif', verbose_name="Statut")
    derniere_mesure = models.DateTimeField(auto_now=True, verbose_name="Dernière mesure")
    
    class Meta:
        verbose_name = "Capteur"
        verbose_name_plural = "Capteurs"
        ordering = ['-derniere_mesure']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.site.nom}"


# ========== MODULE FARES : Evenement ==========
class Evenement(models.Model):
    TYPE_CHOICES = (
        ('intrusion', 'Intrusion'),
        ('incendie', 'Incendie'),
        ('mouvement', 'Mouvement Suspect'),
        ('alarme', 'Déclenchement d\'Alarme'),
        ('panne', 'Panne Technique'),
    )
    
    NIVEAU_CHOICES = (
        ('critique', 'Critique'),
        ('eleve', 'Élevé'),
        ('moyen', 'Moyen'),
        ('faible', 'Faible'),
    )
    
    STATUT_CHOICES = (
        ('en_cours', 'En cours'),
        ('resolu', 'Résolu'),
    )
    
    site = models.ForeignKey(SiteClient, on_delete=models.CASCADE, verbose_name="Site")
    camera = models.ForeignKey(CameraSurveillance, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Caméra")
    capteur = models.ForeignKey(Capteur, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Capteur")
    type_evenement = models.CharField(max_length=100, choices=TYPE_CHOICES, verbose_name="Type d'événement")
    niveau_urgence = models.CharField(max_length=50, choices=NIVEAU_CHOICES, default='moyen', verbose_name="Niveau d'urgence")
    date_detection = models.DateTimeField(auto_now_add=True, verbose_name="Date de détection")
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='en_cours', verbose_name="Statut")
    description = models.TextField(verbose_name="Description", default="", blank=True, null=True)
    
    class Meta:
        verbose_name = "Événement"
        verbose_name_plural = "Événements"
        ordering = ['-date_detection']
    
    def __str__(self):
        return f"{self.get_type_evenement_display()} - {self.site.nom}"


# ========== MODULE MAYSSA : Alerte ==========
class Alerte(models.Model):
    NIVEAU_CHOICES = (
        ('critique', 'Critique'),
        ('moyen', 'Moyen'),
        ('info', 'Info'),
    )

    STATUT_CHOICES = (
        ('envoyee', 'Envoyée'),
        ('lue', 'Lue'),
        ('archivee', 'Archivée'),
    )

    CATEGORIE_CHOICES = (
        ('intrusion', 'Intrusion'),
        ('incendie', 'Incendie'),
        ('technique', 'Problème Technique'),
        ('fausse_alerte', 'Fausse Alerte'),
        ('autre', 'Autre'),
    )

    evenement = models.ForeignKey(Evenement, on_delete=models.CASCADE, verbose_name="Événement")
    message = models.TextField(verbose_name="Message de l'alerte")
    niveau = models.CharField(max_length=50, choices=NIVEAU_CHOICES, default='info', verbose_name="Niveau")
    date_envoi = models.DateTimeField(auto_now_add=True, verbose_name="Date d'envoi")
    destinataire = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Destinataire")
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='envoyee', verbose_name="Statut")

    # Champs IA
    categorie_ia = models.CharField(max_length=50, choices=CATEGORIE_CHOICES, blank=True, null=True, verbose_name="Catégorie IA")
    actions_recommandees = models.JSONField(blank=True, null=True, verbose_name="Actions recommandées")
    confiance_ia = models.DecimalField(max_digits=5, decimal_places=4, blank=True, null=True, verbose_name="Confiance IA")
    explication_ia = models.TextField(blank=True, null=True, verbose_name="Explication IA")

    class Meta:
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"
        ordering = ['-date_envoi']

    def __str__(self):
        return f"Alerte {self.niveau} - {self.destinataire.username}"

    def marquer_comme_lue(self):
        self.statut = 'lue'
        self.save()

    def archiver(self):
        self.statut = 'archivee'
        self.save()

    def classifier_avec_ia(self):
        """
        Méthode pour classifier l'alerte avec l'IA
        """
        from .ml_classifier import predict_alert_category

        if not self.message:
            return

        try:
            prediction = predict_alert_category(self.message)

            # Mapper les catégories IA aux choix du modèle
            categorie_mapping = {
                'intrusion': 'intrusion',
                'incendie': 'incendie',
                'technique': 'technique',
                'fausse_alerte': 'fausse_alerte',
                'autre': 'autre'
            }

            self.categorie_ia = categorie_mapping.get(prediction.get('categorie', 'autre'), 'autre')
            self.confiance_ia = prediction.get('confiance', 0) / 100.0  # Convertir en décimal
            self.explication_ia = prediction.get('explication', '')

            # Définir les actions recommandées selon la catégorie
            actions_par_categorie = {
                'intrusion': [
                    'Vérifier les caméras de surveillance',
                    'Contacter les forces de l\'ordre',
                    'Déclencher l\'alarme sonore',
                    'Verrouiller les accès'
                ],
                'incendie': [
                    'Activer l\'alarme incendie immédiatement',
                    'Contacter les pompiers (198)',
                    'Évacuer le site',
                    'Vérifier les détecteurs de fumée'
                ],
                'technique': [
                    'Vérifier les connexions réseau',
                    'Redémarrer l\'équipement',
                    'Contacter le support technique',
                    'Planifier une maintenance'
                ],
                'fausse_alerte': [
                    'Vérifier manuellement la situation',
                    'Recalibrer les capteurs si nécessaire',
                    'Analyser les logs système'
                ],
                'autre': [
                    'Analyser la situation',
                    'Contacter le responsable de site'
                ]
            }

            self.actions_recommandees = actions_par_categorie.get(self.categorie_ia, [])
            self.save()

        except Exception as e:
            print(f"Erreur lors de la classification IA: {e}")
            # En cas d'erreur, définir des valeurs par défaut
            self.categorie_ia = 'autre'
            self.actions_recommandees = ['Analyser la situation']
            self.confiance_ia = 0.0
            self.explication_ia = 'Erreur de classification IA'
            self.save()


# ========== MODULE SANA : RapportSurveillance ==========
class RapportSurveillance(models.Model):
    titre = models.CharField(max_length=200, verbose_name="Titre du rapport")
    site = models.ForeignKey(SiteClient, on_delete=models.CASCADE, verbose_name="Site")
    periode = models.CharField(max_length=100, verbose_name="Période couverte")
    contenu = models.TextField(verbose_name="Contenu du rapport")
    auteur = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Auteur")
    date_generation = models.DateTimeField(auto_now_add=True, verbose_name="Date de génération")
    
    class Meta:
        verbose_name = "Rapport de Surveillance"
        verbose_name_plural = "Rapports de Surveillance"
        ordering = ['-date_generation']
    
    def __str__(self):
        return f"Rapport {self.site.nom} - {self.periode}"


# ========== MODULE SANA : Maintenance ==========
class Maintenance(models.Model):
    TYPE_CHOICES = (
        ('preventive', 'Préventive'),
        ('curative', 'Curative'),
        ('predictive', 'Prédictive'),
    )

    STATUT_CHOICES = (
        ('planifiee', 'Planifiée'),
        ('en_cours', 'En cours'),
        ('realisee', 'Réalisée'),
        ('annulee', 'Annulée'),
    )

    PRIORITE_CHOICES = (
        ('faible', 'Faible'),
        ('moyenne', 'Moyenne'),
        ('elevee', 'Élevée'),
        ('critique', 'Critique'),
    )

    site = models.ForeignKey(SiteClient, on_delete=models.CASCADE, verbose_name="Site")
    type_maintenance = models.CharField(max_length=50, choices=TYPE_CHOICES, default='preventive', verbose_name="Type de maintenance")
    equipement = models.CharField(max_length=100, verbose_name="Équipement")
    description = models.TextField(verbose_name="Description")
    date_prevue = models.DateField(verbose_name="Date prévue")
    duree_estimee = models.PositiveIntegerField(default=1, verbose_name="Durée estimée (heures)")
    priorite = models.CharField(max_length=50, choices=PRIORITE_CHOICES, default='moyenne', verbose_name="Priorité")
    technicien = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Technicien")
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='planifiee', verbose_name="Statut")
    cout_estime = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Coût estimé")
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    class Meta:
        verbose_name = "Maintenance"
        verbose_name_plural = "Maintenances"
        ordering = ['-date_prevue']
    
    def __str__(self):
        return f"Maintenance {self.equipement} - {self.site.nom}"