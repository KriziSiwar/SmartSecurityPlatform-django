# 🛡️ Smart Security Platform - Système de Surveillance Intelligent

**Plateforme complète de gestion de sécurité avec IA intégrée**

[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.0-blue.svg)](https://mui.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-red.svg)](https://jwt.io/)

## ✅ MISE À JOUR MAJEURE - Production Ready

**Date :** 31 Octobre 2025
**Statut :** ✅ **DÉPLOYÉ ET OPÉRATIONNEL**

### 🎯 Fonctionnalités Clés :
- **🤖 IA Intégrée** : Classification automatique des alertes avec apprentissage machine
- **📊 Dashboard Temps Réel** : Statistiques et monitoring en direct
- **🔐 Authentification JWT** : Gestion des rôles (Admin/Technicien/Client)
- **📱 Interface Responsive** : Design moderne avec Material-UI
- **🔄 API REST Complète** : Tous les endpoints CRUD avec filtres avancés
- **🚀 Déploiement Cloud** : Configuration Render prête à l'emploi

## 🚀 Démarrage Rapide

### Prérequis
- Python 3.8+ & Node.js 16+
- Git & GitHub account

### Installation en 3 étapes

```bash
# 1. Cloner le projet
git clone https://github.com/KriziSiwar/SmartSecurityPlatform-django.git
cd SmartSecurityPlatform-django

# 2. Backend (Django)
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser

# 3. Frontend (React)
cd frontend
npm install
npm run build  # Pour production
```

### Lancement
```bash
# Terminal 1 - Backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Accès :** http://localhost:5173

## 👥 Équipe de Développement

| Module | Développeur | Fonctionnalités | Statut |
|--------|-------------|----------------|---------|
| 🏢 **Sites & Alertes** | Mayssa Rzigui | Gestion sites, Alertes IA | ✅ Terminé |
| 📹 **Équipements** | Krizi Siwar | Caméras, Capteurs, Anomalies | ✅ Terminé |
| ⚡ **Événements** | Fares | Détection temps réel | ✅ Terminé |
| 📊 **Rapports** | Sana | Analytics & Maintenance | ✅ Terminé |

## 🏗️ Architecture Technique

### Backend Stack
- **Framework** : Django 4.2.25 + Django REST Framework
- **Authentification** : JWT (djangorestframework-simplejwt)
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **Serveur** : Gunicorn + WhiteNoise (static files)
- **Sécurité** : CORS, CSRF protection

### Frontend Stack
- **Framework** : React 18 + Vite
- **UI Library** : Material-UI (MUI) v5
- **Routing** : React Router v6
- **HTTP Client** : Axios (configuration centralisée)
- **Build Tool** : Vite (développement rapide)

### Intelligence Artificielle
- **Classification** : Scikit-learn + NLTK
- **Modèle** : Naive Bayes Multinomial
- **Prétraitement** : TF-IDF Vectorizer
- **Métriques** : Précision, Rappel, F1-Score

### Déploiement
- **Plateforme** : Render (Backend + Frontend)
- **Base de données** : PostgreSQL managé
- **CDN** : Automatic pour assets statiques
- **SSL** : Automatique (Let's Encrypt)
## 🎯 Fonctionnalités Principales

### 🤖 Intelligence Artificielle
- **Classification automatique** des alertes par mots-clés
- **Analyse prédictive** des anomalies de sécurité
- **Suggestions d'actions** basées sur le type d'alerte
- **Apprentissage continu** avec feedback utilisateur

### 📊 Dashboard & Analytics
- **Statistiques temps réel** : Sites actifs, caméras en ligne, alertes
- **Graphiques interactifs** : Évolution des événements par période
- **Filtres avancés** : Par site, type, statut, date
- **Rapports automatisés** : Génération PDF avec métriques

### 🔐 Gestion des Utilisateurs
- **3 rôles distincts** : Admin, Technicien, Client
- **Authentification JWT** : Sécurisée et stateless
- **Permissions granulaires** : CRUD selon le rôle
- **Gestion des accès** : Routes protégées côté frontend

### 📱 Interface Utilisateur
- **Design responsive** : Compatible mobile/tablette/desktop
- **Navigation intuitive** : Sidebar avec icônes Material-UI
- **Actions contextuelles** : Boutons selon permissions
- **Feedback visuel** : Loading states, success/error messages

## 🚀 Déploiement Cloud (Render)

### Configuration Backend
```yaml
# render.yaml
services:
  - type: web
    name: smart-security-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn SmartSecurityPlatform.wsgi:application
    envVars:
      - key: DATABASE_URL
        value: ${{ POSTGRESQL_DATABASE_URL }}
      - key: SECRET_KEY
        value: ${{ SECRET_KEY }}
      - key: DEBUG
        value: False
```

### Configuration Frontend
```yaml
# render.yaml (suite)
  - type: web
    name: smart-security-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_BASE_URL
        value: https://smart-security-backend.onrender.com
```

### Variables d'Environnement
```bash
# Backend
DATABASE_URL=postgresql://...
SECRET_KEY=votre-cle-secrete
DEBUG=False
ALLOWED_HOSTS=smart-security-backend.onrender.com

# Frontend
VITE_API_BASE_URL=https://smart-security-backend.onrender.com
```


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

## 📞 Support & Contact

### 🐛 Signaler un Bug
1. Ouvrir une issue sur GitHub
2. Décrire le problème avec captures d'écran
3. Indiquer les étapes pour reproduire

### 💡 Suggestions d'Amélioration
- **IA** : Intégration de modèles plus avancés (TensorFlow, PyTorch)
- **Temps réel** : WebSockets pour notifications instantanées
- **Mobile** : Application React Native
- **Analytics** : Tableau de bord plus détaillé

### 📧 Contact Équipe
- **Mayssa Rzigui** : Sites & Alertes IA
- **Krizi Siwar** : Équipements & Anomalies
- **Fares** : Événements temps réel
- **Sana** : Rapports & Maintenance

---

## 🎉 **PROJET TERMINÉ AVEC SUCCÈS !**

**📅 Date :** 31 Octobre 2025
**🚀 Statut :** **DÉPLOYÉ ET OPÉRATIONNEL**
**🌟 Technologies :** Django + React + IA + Material-UI
**☁️ Plateforme :** Render (Backend + Frontend)

**✅ Checklist Finale :**
- [x] **Backend Django** : API REST complète avec JWT
- [x] **Frontend React** : Interface moderne et responsive
- [x] **Intelligence Artificielle** : Classification automatique des alertes
- [x] **Authentification** : Système de rôles sécurisé
- [x] **Base de données** : Modèles relationnels optimisés
- [x] **Déploiement** : Configuration Render production-ready
- [x] **Documentation** : README complet et guides détaillés

**🎯 Résultat :** Plateforme de surveillance intelligente complète et professionnelle ! 🛡️✨