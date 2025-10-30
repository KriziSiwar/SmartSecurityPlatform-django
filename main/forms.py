from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import (
    CustomUser, SiteClient, Alerte, Evenement, 
    CameraSurveillance, Capteur, RapportSurveillance, Maintenance
)


# ========== FORMS EXISTANTS ==========
class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser  
        fields = ["username", "email", "password1", "password2"]


class LoginForm(AuthenticationForm):
    username = forms.CharField(label="Nom d'utilisateur")
    password = forms.CharField(widget=forms.PasswordInput, label="Mot de passe")


# ========== MODULE MAYSSA : FORMS POUR SITECLIENT ==========
class SiteClientForm(forms.ModelForm):
    class Meta:
        model = SiteClient
        fields = ['nom', 'adresse', 'contact_principal', 'telephone', 'email', 'statut']
        widgets = {
            'nom': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nom du site'}),
            'adresse': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Adresse complète du site'}),
            'contact_principal': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nom du responsable'}),
            'telephone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+216 XX XXX XXX'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'email@exemple.com'}),
            'statut': forms.Select(attrs={'class': 'form-control'}),
        }
    
    def clean_telephone(self):
        telephone = self.cleaned_data.get('telephone')
        if telephone and len(telephone) < 8:
            raise forms.ValidationError("Le numéro de téléphone doit contenir au moins 8 chiffres.")
        return telephone


class SiteClientSearchForm(forms.Form):
    recherche = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Rechercher un site...'})
    )
    statut = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les statuts')] + list(SiteClient.STATUT_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )


# ========== MODULE MAYSSA : FORMS POUR ALERTE ==========
class AlerteForm(forms.ModelForm):
    class Meta:
        model = Alerte
        fields = ['evenement', 'message', 'niveau', 'destinataire', 'statut']
        widgets = {
            'evenement': forms.Select(attrs={'class': 'form-control'}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Message de l\'alerte'}),
            'niveau': forms.Select(attrs={'class': 'form-control'}),
            'destinataire': forms.Select(attrs={'class': 'form-control'}),
            'statut': forms.Select(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['evenement'].queryset = Evenement.objects.filter(statut='en_cours')
        self.fields['destinataire'].queryset = CustomUser.objects.filter(actif=True)


class AlerteFilterForm(forms.Form):
    niveau = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les niveaux')] + list(Alerte.NIVEAU_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    statut = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les statuts')] + list(Alerte.STATUT_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    destinataire = forms.ModelChoiceField(
        required=False,
        queryset=CustomUser.objects.filter(actif=True),
        empty_label="Tous les destinataires",
        widget=forms.Select(attrs={'class': 'form-control'})
    )


# ========== MODULE KRIZI : FORMS POUR CAMERASURVEILLANCE ==========
class CameraSurveillanceForm(forms.ModelForm):
    class Meta:
        model = CameraSurveillance
        fields = ['site', 'nom', 'ip_address', 'emplacement', 'etat', 'type']
        widgets = {
            'site': forms.Select(attrs={'class': 'form-control'}),
            'nom': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: Caméra Entrée Principale'}),
            'ip_address': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '192.168.1.100'}),
            'emplacement': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: Entrée principale'}),
            'etat': forms.Select(attrs={'class': 'form-control'}),
            'type': forms.Select(attrs={'class': 'form-control'}),
        }
    
    def save(self, commit=True, request=None):
        # Save the camera instance
        camera = super().save(commit=commit)
        
        # If you need to do something with the request, you can do it here
        # For example, you might want to log who created the camera
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            # Example: Log the action or set created_by field if it exists
            if hasattr(camera, 'created_by'):
                camera.created_by = request.user
                if commit:
                    camera.save()
        
        return camera


class CameraFilterForm(forms.Form):
    site = forms.ModelChoiceField(
        required=False,
        queryset=SiteClient.objects.filter(statut='actif'),
        empty_label="Tous les sites",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    etat = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les états')] + list(CameraSurveillance.ETAT_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    type = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les types')] + list(CameraSurveillance.TYPE_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )


# ========== MODULE KRIZI : FORMS POUR CAPTEUR ==========
class CapteurForm(forms.ModelForm):
    class Meta:
        model = Capteur
        fields = ['site', 'type', 'emplacement', 'statut']
        widgets = {
            'site': forms.Select(attrs={'class': 'form-control'}),
            'type': forms.Select(attrs={'class': 'form-control'}),
            'emplacement': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: Bureau RDC'}),
            'statut': forms.Select(attrs={'class': 'form-control'}),
        }


class CapteurFilterForm(forms.Form):
    site = forms.ModelChoiceField(
        required=False,
        queryset=SiteClient.objects.filter(statut='actif'),
        empty_label="Tous les sites",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    type = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les types')] + list(Capteur.TYPE_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    statut = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les statuts')] + list(Capteur.STATUT_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )


# ========== MODULE FARES : FORMS POUR EVENEMENT ==========
class EvenementForm(forms.ModelForm):
    class Meta:
        model = Evenement
        fields = ['site', 'camera', 'capteur', 'type_evenement', 'niveau_urgence', 'statut', 'description']
        widgets = {
            'site': forms.Select(attrs={'class': 'form-control'}),
            'camera': forms.Select(attrs={'class': 'form-control'}),
            'capteur': forms.Select(attrs={'class': 'form-control'}),
            'type_evenement': forms.Select(attrs={'class': 'form-control'}),
            'niveau_urgence': forms.Select(attrs={'class': 'form-control'}),
            'statut': forms.Select(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Description détaillée de l\'événement'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['camera'].required = False
        self.fields['capteur'].required = False


class EvenementFilterForm(forms.Form):
    site = forms.ModelChoiceField(
        required=False,
        queryset=SiteClient.objects.filter(statut='actif'),
        empty_label="Tous les sites",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    type_evenement = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les types')] + list(Evenement.TYPE_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    niveau_urgence = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les niveaux')] + list(Evenement.NIVEAU_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    statut = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les statuts')] + list(Evenement.STATUT_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )


# ========== MODULE SANA : FORMS POUR RAPPORTSURVEILLANCE ==========
class RapportSurveillanceForm(forms.ModelForm):
    class Meta:
        model = RapportSurveillance
        fields = ['site', 'periode', 'contenu']
        widgets = {
            'site': forms.Select(attrs={'class': 'form-control'}),
            'periode': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: Semaine 42/2025'}),
            'contenu': forms.Textarea(attrs={'class': 'form-control', 'rows': 10, 'placeholder': 'Résumé des incidents et actions...'}),
        }


class RapportFilterForm(forms.Form):
    site = forms.ModelChoiceField(
        required=False,
        queryset=SiteClient.objects.filter(statut='actif'),
        empty_label="Tous les sites",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    periode = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Rechercher une période...'})
    )


# ========== MODULE SANA : FORMS POUR MAINTENANCE ==========
class MaintenanceForm(forms.ModelForm):
    class Meta:
        model = Maintenance
        fields = ['site', 'type_maintenance', 'equipement', 'description', 'date_prevue', 'duree_estimee', 'priorite', 'technicien', 'statut', 'cout_estime', 'notes']
        widgets = {
            'site': forms.Select(attrs={'class': 'form-control'}),
            'type_maintenance': forms.Select(attrs={'class': 'form-control'}),
            'equipement': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: Caméra 1, Capteur fumée'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Description de la maintenance'}),
            'date_prevue': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'duree_estimee': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
            'priorite': forms.Select(attrs={'class': 'form-control'}),
            'technicien': forms.Select(attrs={'class': 'form-control'}),
            'statut': forms.Select(attrs={'class': 'form-control'}),
            'cout_estime': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Notes ou observations...'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['technicien'].queryset = CustomUser.objects.filter(role='technicien', actif=True)
        self.fields['technicien'].required = False


class MaintenanceFilterForm(forms.Form):
    site = forms.ModelChoiceField(
        required=False,
        queryset=SiteClient.objects.filter(statut='actif'),
        empty_label="Tous les sites",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    statut = forms.ChoiceField(
        required=False,
        choices=[('', 'Tous les statuts')] + list(Maintenance.STATUT_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    date_debut = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    date_fin = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )