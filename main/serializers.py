from rest_framework import serializers
from .models import (
    SiteClient, Alerte, Evenement, CustomUser, CameraSurveillance,
    Capteur, RapportSurveillance, Maintenance
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')


class SiteClientSerializer(serializers.ModelSerializer):
    nb_cameras = serializers.SerializerMethodField()
    nb_capteurs = serializers.SerializerMethodField()
    nb_evenements = serializers.SerializerMethodField()

    class Meta:
        model = SiteClient
        fields = '__all__'

    def get_nb_cameras(self, obj):
        return obj.camerasurveillance_set.count()

    def get_nb_capteurs(self, obj):
        return obj.capteur_set.count()

    def get_nb_evenements(self, obj):
        return obj.evenement_set.count()


class CameraSurveillanceSerializer(serializers.ModelSerializer):
    site_nom = serializers.CharField(source='site.nom', read_only=True)

    class Meta:
        model = CameraSurveillance
        fields = '__all__'


class CapteurSerializer(serializers.ModelSerializer):
    site_nom = serializers.CharField(source='site.nom', read_only=True)

    class Meta:
        model = Capteur
        fields = '__all__'


class EvenementSerializer(serializers.ModelSerializer):
    site_nom = serializers.CharField(source='site.nom', read_only=True)
    camera_nom = serializers.CharField(source='camera.nom', read_only=True, allow_null=True)
    capteur_nom = serializers.CharField(source='capteur.nom', read_only=True, allow_null=True)
    nb_alertes = serializers.SerializerMethodField()

    class Meta:
        model = Evenement
        fields = '__all__'

    def get_nb_alertes(self, obj):
        return obj.alerte_set.count()


class AlerteSerializer(serializers.ModelSerializer):
    evenement_description = serializers.CharField(source='evenement.description', read_only=True)
    destinataire_nom = serializers.CharField(source='destinataire.username', read_only=True)
    site_nom = serializers.CharField(source='evenement.site.nom', read_only=True)

    # Champs IA en lecture seule
    categorie_ia_display = serializers.CharField(source='get_categorie_ia_display', read_only=True)
    confiance_ia_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Alerte
        fields = '__all__'

    def get_confiance_ia_percentage(self, obj):
        if obj.confiance_ia:
            return round(obj.confiance_ia * 100, 2)
        return None

    def create(self, validated_data):
        alerte = super().create(validated_data)
        # Classifier automatiquement avec l'IA après création
        alerte.classifier_avec_ia()
        return alerte


class RapportSurveillanceSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source='auteur.username', read_only=True)
    site_nom = serializers.CharField(source='site.nom', read_only=True)

    class Meta:
        model = RapportSurveillance
        fields = ('id', 'titre', 'site', 'site_nom', 'periode', 'contenu', 'auteur', 'auteur_nom', 'date_generation')
        read_only_fields = ('auteur', 'date_generation')


class MaintenanceSerializer(serializers.ModelSerializer):
    site_nom = serializers.CharField(source='site.nom', read_only=True)

    class Meta:
        model = Maintenance
        fields = '__all__'


# Authentication serializers
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


# Dashboard statistics serializer
class DashboardStatsSerializer(serializers.Serializer):
    total_sites = serializers.IntegerField()
    active_sites = serializers.IntegerField()
    active_cameras = serializers.IntegerField()
    pending_alerts = serializers.IntegerField()
    active_events = serializers.IntegerField()
    total_cameras = serializers.IntegerField()
    total_capteurs = serializers.IntegerField()
    total_evenements = serializers.IntegerField()
    total_alertes = serializers.IntegerField()
    alertes_critiques = serializers.IntegerField()
    maintenances_planifiees = serializers.IntegerField()
    unread_alerts_count = serializers.IntegerField()
    user_alerts_count = serializers.IntegerField() 