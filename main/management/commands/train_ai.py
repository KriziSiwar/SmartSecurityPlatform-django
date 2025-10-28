from django.core.management.base import BaseCommand
from main.ml_classifier import AlertClassifier

class Command(BaseCommand):
    help = 'Entraîne le modèle IA de classification des alertes'

    def handle(self, *args, **options):
        self.stdout.write('Debut de l\'entrainement du modele IA...')

        try:
            # Initialisation et entraînement
            classifier = AlertClassifier()
            success = classifier.initialize_classifier()

            if success:
                info = classifier.get_model_info()
                self.stdout.write(
                    self.style.SUCCESS('Modele IA entraine avec succes!')
                )
                self.stdout.write(f"{info['training_samples']} exemples d'entrainement")
                self.stdout.write(f"Categories: {', '.join(info['categories'])}")

                # Test rapide
                self.stdout.write("\nTest de prediction:")
                test_msg = "Fumee detectee dans la cuisine"
                result = classifier.predict(test_msg)
                self.stdout.write(f"   '{test_msg}' -> {result['categorie']} ({result['confiance']}%)")
            else:
                self.stdout.write(
                    self.style.ERROR('Echec de l\'entrainement du modele')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Erreur: {e}')
            )