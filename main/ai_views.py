# main/ai_views.py — version propre & complète

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .ml_predictor import predict_next_maintenance, train_model  # train_model retourne une chaîne:contentReference[oaicite:1]{index=1}
from .models import Maintenance  # adapte si le nom de ton modèle diffère


# =========================
# Django pur : classifier IA
# =========================
@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def classify_alert_pure(request):
    """
    Classification IA en Django pur (sans DRF)
    GET: Test
    POST: { "message": "..." }
    """
    # Préflight CORS
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    # GET simple
    if request.method == 'GET':
        response = JsonResponse({
            'status': 'active',
            'message': 'Endpoint IA actif. Utilisez POST avec {"message": "..."}',
            'version': '1.0'
        })
        response['Access-Control-Allow-Origin'] = '*'
        return response

    # POST
    try:
        if request.content_type != 'application/json':
            return JsonResponse({'error': 'Content-Type doit être application/json'}, status=400)

        data = json.loads(request.body.decode('utf-8'))
        message = data.get('message', '').lower().strip()
        if not message:
            return JsonResponse({'error': 'Le message est requis'}, status=400)

        if any(w in message for w in ['fumée', 'feu', 'incendie', 'flamme', 'brûle', 'température']):
            category, category_label, priority = 'incendie', 'Incendie / Fumée', 'critique'
            actions = [
                "Activer l'alarme incendie immédiatement",
                "Contacter les pompiers (198)",
                "Évacuer le site",
                "Vérifier les détecteurs de fumée",
            ]
        elif any(w in message for w in ['intrusion', 'accès', 'non autorisé', 'mouvement', 'suspect', 'effraction']):
            category, category_label, priority = 'intrusion', 'Intrusion détectée', 'critique'
            actions = [
                "Vérifier les caméras de surveillance",
                "Contacter les forces de l'ordre",
                "Déclencher l'alarme sonore",
                "Verrouiller les accès",
            ]
        elif any(w in message for w in ['panne', 'hors ligne', 'défaillance', 'erreur', 'maintenance', 'dysfonctionnement']):
            category, category_label, priority = 'technique', 'Problème technique', 'moyen'
            actions = [
                "Vérifier les connexions réseau",
                "Redémarrer l'équipement",
                "Contacter le support technique",
                "Planifier une maintenance",
            ]
        else:
            category, category_label, priority = 'fausse_alerte', 'Fausse alerte probable', 'faible'
            actions = [
                'Vérifier manuellement la situation',
                'Recalibrer les capteurs si nécessaire',
                'Analyser les logs système',
            ]

        priority_labels = {
            'critique': 'Intervention immédiate requise',
            'eleve': 'Intervention rapide nécessaire',
            'moyen': 'Surveillance renforcée',
            'faible': 'Information simple',
        }

        prediction = {
            'category': category,
            'category_label': category_label,
            'priority': priority,
            'priority_label': priority_labels.get(priority, 'Non défini'),
            'confidence': 0.85,
            'recommended_actions': actions,
            'explanation': f'Détection basée sur des mots-clés liés à : {category_label}.',
        }

        response = JsonResponse({'success': True, 'prediction': prediction, 'message': 'OK'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON invalide'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Erreur serveur: {str(e)}'}, status=500)


# =========================
# DRF : IA Maintenance
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_next_maintenance_view(request):
    """
    Prédire la prochaine maintenance pour un seul enregistrement envoyé par le front.
    Corps JSON attendu (exemple minimal) :
    {
        "equipement": "Router-1",
        "site_nom": "Site A"
    }
    """
    data = request.data or {}
    result = predict_next_maintenance({
        "type_maintenance": data.get("type_maintenance", "preventive"),
        "equipement": data.get("equipement", "inconnu"),
        "site_nom": data.get("site_nom", "inconnu"),
        "duree_estimee": float(data.get("duree_estimee", 1)),
        "priorite": data.get("priorite", "moyenne"),
        "statut": data.get("statut", "planifiee"),
        "cout_estime": float(data.get("cout_estime", 0)),
    })
    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_model_view(request):
    """
    Réentraîner le modèle IA (placeholder).
    NOTE : train_model() renvoie une chaîne (message), pas un tuple. :contentReference[oaicite:2]{index=2}
    """
    message = train_model()  # ✅ correction par rapport à ton ancienne version
    return Response({"message": message})


@api_view(['GET'])
def predict_all_maintenances_view(request):
    """
    Prédire la prochaine maintenance pour CHAQUE enregistrement en base.
    S'appuie sur predict_next_maintenance(data_list) qui accepte une liste. :contentReference[oaicite:3]{index=3}
    """
    maintenances = Maintenance.objects.all()
    data = []

    for m in maintenances:
        # Essaie d'obtenir un nom lisible ; fallback sur str(objet) si pas d’attribut .nom
        equipement_nom = (
            getattr(getattr(m, 'equipement', None), 'nom', None)
            or (str(getattr(m, 'equipement')) if getattr(m, 'equipement', None) else None)
            or "Inconnu"
        )
        site_nom = (
            getattr(getattr(m, 'site', None), 'nom', None)
            or (str(getattr(m, 'site')) if getattr(m, 'site', None) else None)
            or "Inconnu"
        )

        data.append({
            "type_maintenance": getattr(m, "type_maintenance", "preventive"),
            "equipement": equipement_nom,
            "site_nom": site_nom,
            "duree_estimee": float(getattr(m, "duree_estimee", 1) or 1),
            "priorite": getattr(m, "priorite", "moyenne"),
            "statut": getattr(m, "statut", "planifiee"),
            "cout_estime": float(getattr(m, "cout_estime", 0) or 0),
        })

    results = predict_next_maintenance(data)  # retourne une liste d'objets (equipement, site, predicted_days, recommended_date):contentReference[oaicite:4]{index=4}
    return Response(results)
