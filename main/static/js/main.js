// Fonction pour afficher les messages de manière élégante
function showMessage(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('main .container') || document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (alert) {
                alert.close();
            }
        }, 5000);
    }
}

// Gestion des messages Django
document.addEventListener('DOMContentLoaded', function() {
    // Activer les tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Activer les popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Gestion des formulaires avec confirmation
    const confirmForms = document.querySelectorAll('form[data-confirm]');
    confirmForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm(this.getAttribute('data-confirm'))) {
                e.preventDefault();
                return false;
            }
            return true;
        });
    });
});

// Fonction pour mettre à jour l'aperçu des images téléchargées
function updateImagePreview(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    } else {
        preview.src = '#';
        preview.style.display = 'none';
    }
}

// Gestion des onglets dans l'URL
if (window.location.hash) {
    const tabTrigger = new bootstrap.Tab(document.querySelector(`[href="${window.location.hash}"]`));
    tabTrigger.show();
}

// Mettre à jour l'URL lors du changement d'onglet
const tabLinks = document.querySelectorAll('a[data-bs-toggle="tab"]');
tabLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        window.location.hash = target;
        const tabTrigger = new bootstrap.Tab(this);
        tabTrigger.show();
    });
});

// Fonction utilitaire pour les requêtes AJAX
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        throw error;
    }
}
