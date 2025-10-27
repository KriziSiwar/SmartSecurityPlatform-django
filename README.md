🛡️ Smart Security - Système de Surveillance
Système complet de gestion de surveillance avec caméras, capteurs, alertes et maintenances.

## ✅ MISE À JOUR MAJEURE - Migration vers React Frontend

**Date :** 27 Octobre 2025
**Statut :** ✅ Migration complète terminée

### 🎯 Changements Principaux :
- **Frontend migré** : Passage de Django Templates vers React + Material-UI
- **API REST complète** : Tous les endpoints disponibles avec authentification JWT
- **Interface moderne** : Design responsive avec composants Material-UI
- **Authentification** : Système JWT avec gestion des rôles (Admin/Technicien/Client)
- **CRUD complet** : Tous les modules fonctionnels (Sites, Caméras, Capteurs, Événements, Alertes, Maintenances, Rapports)

📋 Structure du Projet

## Modules développés
| Module                  | Développeur  | Entités                          |
|-------------------------|--------------|----------------------------------|
| Sites & Alertes         | Mayssa Rzigui| SiteClient, Alerte               |
| Équipements             | Krizi        | CameraSurveillance, Capteur      | 
| Événements              | Fares        | Evenement                        | 
| Rapports & Maintenance  | Sana         | RapportSurveillance, Maintenance |

## 🆕 Architecture Technique
- **Backend** : Django 4.2 + Django REST Framework + JWT
- **Frontend** : React 18 + Material-UI + Axios + React Router
- **Base de données** : SQLite (développement) / PostgreSQL (production)
- **Authentification** : JWT avec gestion des rôles
- **API** : RESTful avec pagination et filtres
🚀 Installation et Configuration

## 1. Prérequis
- Python 3.8+
- Django 4.2+
- Node.js 16+
- npm ou yarn

## 2. Backend (Django)
Activer l'environnement virtuel :

```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

Installer les dépendances et lancer le serveur :

```bash
pip install django djangorestframework djangorestframework-simplejwt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## 2.1. Instructions pour quelqu'un qui clone le projet depuis Git
Pour quelqu'un qui clone le projet depuis Git :

- Il devra installer les dépendances : `pip install -r requirements.txt` (si vous avez un fichier requirements.txt).
- Créer un environnement virtuel : `python -m venv .venv` puis `source .venv/bin/activate` (Linux/Mac) ou `.venv\Scripts\activate` (Windows).
- Installer les dépendances dans l'environnement virtuel.
- Appliquer les migrations Django : `python manage.py migrate`.
- Collecter les fichiers statiques : `python manage.py collectstatic`.
- Lancer le serveur : `python manage.py runserver`.

## 3. Frontend (React)
Dans un nouveau terminal :

```bash
cd frontend
npm install
npm run dev
```

## 4. 🆕 Configuration Post-Migration
Après la migration vers React, vérifiez :


```
📊 TABLEAU RÉCAPITULATIF DES ACCÈS
Formulaire	👑 Admin	         🔧 Technicien	       👤 Client
SiteForm	✅ Création/Modif	❌ Lecture seule*	 ❌ Lecture seule*
CameraForm	✅ Complet	        ✅ État/Maintenance	 ❌ Vue seulement
SensorForm	✅ Complet	        ✅ Configuration	     ❌ Vue seulement
AlertForm	✅ Toutes alertes	❌ Lecture seule	     ✅ Ses alertes
EventForm	✅ Tous événements	❌ Lecture seule      ✅ Ses événements
MaintenanceForm	✅ Toutes	    ✅ Ses interventions	 ❌ Lecture seule
ReportForm	✅ Tous rapports	    ❌ Non accessible	 ✅ Ses rapports

*Lecture seule = Peut voir mais pas modifier via le formulaire

🎯 Utilisation du Système

## Accès aux applications :
- **Backend Admin** : http://localhost:8000/admin
- **API REST** : http://localhost:8000/api/
- **Frontend React** : http://localhost:5173 (Vite dev server)

## Comptes de test recommandés :
```bash
# Admin (accès complet)
Email: admin@smartsecurity.fr
Password: 123456789admin

# Technicien (maintenance & équipements)
Email: technicien@smartsecurity.fr
Password: 123456789technicien

# Client (ses sites & alertes uniquement)
Email: client@smartsecurity.fr
Password: 123456789client
```

## 🆕 Fonctionnalités Frontend React :
- ✅ **Dashboard** : Statistiques en temps réel
- ✅ **CRUD complet** : Tous les modules avec filtres
- ✅ **Authentification** : Login/Register avec JWT
- ✅ **Interface responsive** : Material-UI design
- ✅ **Navigation** : React Router avec protection des routes
- ✅ **Actions spéciales** : Marquer lu, archiver, résoudre
📁 Structure des Fichiers

## 🏗️ Architecture Django expliquée

### Pourquoi deux dossiers principaux ?
Django suit une architecture modulaire où la **configuration** et la **logique métier** sont séparées :

- **`SmartSecurityPlatform/`** ⚙️ = **Configuration principale** (settings, URLs globales, serveur)
- **`main/`** 🏢 = **Application métier** (modèles, vues, API, logique)

Cette séparation permet la **réutilisabilité** : l'app `main` peut être utilisée dans d'autres projets Django.

## Backend (Django)
```
SmartSecurityPlatform-django/
├── SmartSecurityPlatform/     # ⚙️ Configuration Django
│   ├── settings.py           # Configuration globale
│   ├── urls.py              # Routes principales
│   ├── wsgi.py/asgi.py      # Serveurs web
│   └── __init__.py          # Package Python
├── main/                     # 🏢 Application principale
│   ├── models.py            # ✅ Tous les modèles (7 entités)
│   ├── views.py             # ✅ Vues CRUD + templates
│   ├── api_views.py         # ✅ API DRF avec JWT
│   ├── serializers.py       # ✅ Sérialiseurs complets
│   ├── forms.py             # ✅ Formulaires (legacy)
│   ├── urls.py              # ✅ Routes de l'app
│   └── admin.py             # ✅ Admin personnalisé
├── manage.py                 # 🎯 Point d'entrée Django
├── db.sqlite3               # 💾 Base de données
└── requirements.txt
```

## Frontend (React) - 🆕 Nouveau
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Login/Register
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── sites/          # SitesList, SiteDetail, SiteForm
│   │   ├── cameras/        # CamerasList, CameraDetail, CameraForm
│   │   ├── sensors/        # SensorsList, SensorDetail, SensorForm
│   │   ├── alerts/         # AlertsList, AlertDetail, AlertForm
│   │   ├── events/         # EventsList, EventDetail, EventForm
│   │   ├── maintenances/   # MaintenancesList, MaintenanceDetail, MaintenanceForm
│   │   ├── reports/        # ReportsList, ReportDetail, ReportForm
│   │   ├── layout/         # Layout, Navigation
│   │   └── contexts/       # AuthContext
│   ├── App.jsx             # Routing React
│   ├── main.jsx            # Entry point
│   └── index.css
├── package.json            # Dépendances React
└── vite.config.js          # Configuration Vite
```
🌐 Routes API Disponibles
Module	Endpoints
Sites	GET/POST /api/sites/, GET/PUT/DELETE /api/sites/{id}/
Caméras	GET/POST /api/cameras/, GET/PUT/DELETE /api/cameras/{id}/
Capteurs	GET/POST /api/capteurs/, GET/PUT/DELETE /api/capteurs/{id}/
Alertes	GET/POST /api/alertes/, GET/PUT/DELETE /api/alertes/{id}/
Événements	GET/POST /api/evenements/, GET/PUT/DELETE /api/evenements/{id}/
Maintenances	GET/POST /api/maintenances/, GET/PUT/DELETE /api/maintenances/{id}/
Rapports	GET/POST /api/rapports/, GET/PUT/DELETE /api/rapports/{id}/

🔧 Fonctionnalités par Rôle
👑 Administrateur
Gestion complète de tous les sites et utilisateurs

Configuration système globale

Génération de rapports détaillés

Supervision de toutes les activités

🔧 Technicien
Gestion des maintenances planifiées

Intervention sur les équipements

Mise à jour des statuts techniques

Rapport d'intervention

👤 Client
Consultation de ses sites uniquement

Réception et gestion de ses alertes

Visualisation de ses rapports

Suivi de ses événements de sécurité

🚀 Déploiement Rapide
Script de démarrage rapide :
bash
# Terminal 1 - Backend
.venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend  
cd frontend
npm run dev
Vérification du bon fonctionnement :
Accéder à http://localhost:3000

Se connecter avec un compte de test

Vérifier que le dashboard s'affiche correctement

Tester la navigation entre les différents modules

🆘 Dépannage

## Problèmes courants :

### Migration errors :
```bash
python manage.py makemigrations
python manage.py migrate
```

### Port déjà utilisé :
```bash
# Changer le port Django
python manage.py runserver 8001

# Ou frontend (Vite)
npm run dev -- --port 3001
```

### Dépendances manquantes :
```bash
pip install -r requirements.txt
cd frontend && npm install
```

### 🆕 Problèmes post-migration React :
```bash
# Si API retourne 400 Bad Request
# Vérifier les champs requis dans les formulaires
# Exemple : Rapport nécessite maintenant un 'titre'

# Si problème d'authentification
# Vérifier que JWT est configuré dans settings.py
# Vérifier les endpoints /api/auth/login/

# Si composants ne se chargent pas
# Vérifier que tous les imports sont corrects
# Vérifier la syntaxe JSX des nouveaux composants
```
📞 Support

## En cas de problème, vérifier :

✅ **Les deux serveurs sont démarrés** (Django + React)
✅ **La base de données est migrée** (toutes les migrations appliquées)
✅ **Les variables d'environnement** sont configurées
✅ **Les ports ne sont pas bloqués** (8000 pour Django, 5173 pour React)

## 🆕 Points de vérification post-migration :

✅ **API endpoints accessibles** : `http://localhost:8000/api/`
✅ **Authentification JWT fonctionnelle** : `/api/auth/login/`
✅ **Composants React se chargent** : Console sans erreurs JSX
✅ **Routes React protégées** : Redirection vers login si non authentifié
✅ **CRUD opérationnel** : Création/Modification/Suppression fonctionnelle
✅ **Filtres et recherche** : Fonctionnent dans toutes les listes

## 📋 Checklist de validation :

- [ ] Connexion avec compte admin réussie
- [ ] Dashboard affiche les statistiques
- [ ] Navigation entre modules fonctionnelle
- [ ] Création d'un site possible
- [ ] Ajout d'une caméra fonctionnel
- [ ] Formulaire d'alerte opérationnel
- [ ] Génération de rapport possible
- [ ] Actions spéciales (résoudre, archiver) fonctionnelles

---

**🎉 Migration vers React terminée avec succès !**
**Date :** 27 Octobre 2025
**Statut :** ✅ Production Ready