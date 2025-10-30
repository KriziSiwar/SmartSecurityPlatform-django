import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Remplacez par votre URL de base si nécessaire
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Important pour les cookies de session
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs globales
    if (error.response) {
      // Erreurs 4xx/5xx
      console.error('Erreur API:', error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Pas de réponse du serveur:', error.request);
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
