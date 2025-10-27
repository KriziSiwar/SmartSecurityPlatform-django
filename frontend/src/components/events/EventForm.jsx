import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    type_evenement: '',
    description: '',
    site: '',
    camera: '',
    capteur: '',
    niveau_urgence: 'moyen',
    statut: 'en_cours',
  });
  const [sites, setSites] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [capteurs, setCapteurs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchCameras();
    fetchCapteurs();
    if (isEditing) {
      fetchEvent();
    }
  }, [id]);

  const fetchSites = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/sites/');
      const data = response.data.results || response.data;
      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    }
  };

  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/cameras/');
      const data = response.data.results || response.data;
      setCameras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setCameras([]);
    }
  };

  const fetchCapteurs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/capteurs/');
      const data = response.data.results || response.data;
      setCapteurs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching capteurs:', error);
      setCapteurs([]);
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/evenements/${id}/`);
      setFormData({
        type_evenement: response.data.type_evenement || '',
        description: response.data.description || '',
        site: response.data.site || '',
        camera: response.data.camera || '',
        capteur: response.data.capteur || '',
        niveau_urgence: response.data.niveau_urgence || 'moyen',
        statut: response.data.statut || 'en_cours',
      });
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/api/evenements/${id}/`, formData);
      } else {
        await axios.post('http://localhost:8000/api/evenements/', formData);
      }
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier l\'Événement' : 'Nouvel Événement'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth required>
              <InputLabel>Type d'événement</InputLabel>
              <Select
                name="type_evenement"
                value={formData.type_evenement}
                label="Type d'événement"
                onChange={handleChange}
              >
                <MenuItem value="intrusion">Intrusion</MenuItem>
                <MenuItem value="incendie">Incendie</MenuItem>
                <MenuItem value="mouvement">Mouvement Suspect</MenuItem>
                <MenuItem value="alarme">Déclenchement d'Alarme</MenuItem>
                <MenuItem value="panne">Panne Technique</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Site</InputLabel>
              <Select
                name="site"
                value={formData.site}
                label="Site"
                onChange={handleChange}
              >
                {sites.map((site) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Caméra (optionnel)</InputLabel>
              <Select
                name="camera"
                value={formData.camera}
                label="Caméra (optionnel)"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Aucune</em>
                </MenuItem>
                {cameras.map((camera) => (
                  <MenuItem key={camera.id} value={camera.id}>
                    {camera.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Capteur (optionnel)</InputLabel>
              <Select
                name="capteur"
                value={formData.capteur}
                label="Capteur (optionnel)"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Aucun</em>
                </MenuItem>
                {capteurs.map((capteur) => (
                  <MenuItem key={capteur.id} value={capteur.id}>
                    {capteur.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Niveau d'urgence</InputLabel>
              <Select
                name="niveau_urgence"
                value={formData.niveau_urgence}
                label="Niveau d'urgence"
                onChange={handleChange}
              >
                <MenuItem value="critique">Critique</MenuItem>
                <MenuItem value="eleve">Élevé</MenuItem>
                <MenuItem value="moyen">Moyen</MenuItem>
                <MenuItem value="faible">Faible</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Statut</InputLabel>
              <Select
                name="statut"
                value={formData.statut}
                label="Statut"
                onChange={handleChange}
              >
                <MenuItem value="en_cours">En cours</MenuItem>
                <MenuItem value="resolu">Résolu</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/events')}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EventForm;