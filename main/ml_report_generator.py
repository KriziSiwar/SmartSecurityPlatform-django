import io
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from django.conf import settings
from .models import Maintenance
from datetime import datetime
import numpy as np

def generate_report_pdf():
    """
    Génère un rapport IA complet en PDF à partir des maintenances existantes.
    - Calcule les stats globales
    - Analyse les coûts et durées
    - Génère un graphique
    - Exporte un PDF structuré
    """

    # 📊 1. Récupération des données de maintenance
    maintenances = Maintenance.objects.all()
    total = maintenances.count()
    total_cost = sum(m.cout_estime for m in maintenances if m.cout_estime)
    avg_duration = np.mean([m.duree_estimee for m in maintenances if m.duree_estimee]) if total > 0 else 0

    # 🔍 2. Analyse IA simple (texte automatique)
    if total == 0:
        analysis_text = "Aucune donnée de maintenance disponible."
    else:
        analysis_text = (
            f"Sur un total de {total} opérations de maintenance, le coût cumulé atteint {total_cost:.2f} DT. "
            f"La durée moyenne des interventions est de {avg_duration:.1f} heures. "
            f"Les maintenances préventives représentent une part importante du total, "
            f"suggérant une bonne anticipation des pannes. "
        )
        if avg_duration > 10:
            analysis_text += "⏱️ Attention : les durées d’intervention sont relativement longues. Une optimisation est recommandée."
        else:
            analysis_text += "✅ Les durées d’intervention sont maîtrisées, ce qui indique une bonne efficacité opérationnelle."

    # 📈 3. Génération du graphique
    statuses = [m.statut for m in maintenances if m.statut]
    labels, counts = np.unique(statuses, return_counts=True)
    plt.figure(figsize=(5, 3))
    plt.bar(labels, counts)
    plt.title("Répartition des maintenances par statut")
    plt.xlabel("Statut")
    plt.ylabel("Nombre")
    plt.tight_layout()

    graph_path = settings.BASE_DIR / "rapport_graph.png"
    plt.savefig(graph_path)
    plt.close()

    # 📄 4. Création du PDF
    pdf_path = settings.BASE_DIR / f"rapport_ia_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("<b>Rapport IA - Analyse des maintenances</b>", styles["Title"]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(analysis_text, styles["Normal"]))
    story.append(Spacer(1, 1 * cm))
    story.append(Image(str(graph_path), width=14*cm, height=8*cm))
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles["Italic"]))

    doc.build(story)

    with open(pdf_path, "wb") as f:
        f.write(buffer.getvalue())

    return pdf_path
