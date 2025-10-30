"""
Vues IA en Django pur (sans DRF)
Fichier: main/ai_views.py
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def classify_alert_pure(request):
    """
    Classification IA en Django pur (sans DRF)
    GET: Test de l'endpoint
    POST: Classification d'un message
    """
    print(f"🔍 classify_alert_pure - Method: {request.method}")
    print(f"📦 Request path: {request.path}")
    print(f"👤 User: {request.user}")
    
    # Gestion OPTIONS pour CORS
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    # Gestion GET
    if request.method == 'GET':
        response = JsonResponse({
            'status': 'active',
            'message': 'Endpoint IA actif. Utilisez POST avec {"message": "votre texte"}',
            'version': '1.0'
        })
        response['Access-Control-Allow-Origin'] = '*'
        return response
    
    # Gestion POST
    try:
        # Récupération des données
        if request.content_type == 'application/json':
            data = json.loads(request.body.decode('utf-8'))
        else:
            return JsonResponse({
                'error': 'Content-Type doit être application/json'
            }, status=400)
        
        message = data.get('message', '')
        print(f"📝 Message reçu: '{message}'")
        
        if not message:
            return JsonResponse({
                'error': 'Le message est requis'
            }, status=400)
        
        # Classification IA
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['fumée', 'feu', 'incendie', 'flamme', 'brûle', 'température']):
            category = 'incendie'
            category_label = 'Incendie / Fumée'
            priority = 'critique'
            actions = [
                'Activer l\'alarme incendie immédiatement',
                'Contacter les pompiers (198)',
                'Évacuer le site',
                'Vérifier les détecteurs de fumée'
            ]
        elif any(word in message_lower for word in ['intrusion', 'accès', 'non autorisé', 'mouvement', 'suspect', 'effraction']):
            category = 'intrusion'
            category_label = 'Intrusion détectée'
            priority = 'critique'
            actions = [
                'Vérifier les caméras de surveillance',
                'Contacter les forces de l\'ordre',
                'Déclencher l\'alarme sonore',
                'Verrouiller les accès'
            ]
        elif any(word in message_lower for word in ['panne', 'hors ligne', 'défaillance', 'erreur', 'maintenance', 'dysfonctionnement']):
            category = 'technique'
            category_label = 'Problème technique'
            priority = 'moyen'
            actions = [
                'Vérifier les connexions réseau',
                'Redémarrer l\'équipement',
                'Contacter le support technique',
                'Planifier une maintenance'
            ]
        else:
            category = 'fausse_alerte'
            category_label = 'Fausse alerte probable'
            priority = 'faible'
            actions = [
                'Vérifier manuellement la situation',
                'Recalibrer les capteurs si nécessaire',
                'Analyser les logs système'
            ]
        
        priority_labels = {
            'critique': 'Intervention immédiate requise',
            'eleve': 'Intervention rapide nécessaire',
            'moyen': 'Surveillance renforcée',
            'faible': 'Information simple'
        }
        
        prediction = {
            'category': category,
            'category_label': category_label,
            'priority': priority,
            'priority_label': priority_labels.get(priority, 'Non défini'),
            'confidence': 0.85,
            'recommended_actions': actions,
            'explanation': f'Détection basée sur les mots-clés liés à : {category_label}. Classification automatique avec confiance moyenne.'
        }
        
        print(f"✅ Classification réussie: {category_label} (priorité: {priority})")
        
        response = JsonResponse({
            'success': True,
            'prediction': prediction,
            'message': 'Classification IA effectuée avec succès'
        })
        
        # CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'JSON invalide'
        }, status=400)
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'error': f'Erreur serveur: {str(e)}'
        }, status=500)