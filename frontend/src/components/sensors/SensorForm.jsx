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

const SensorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    site: '',
    type: 'mouvement',
    emplacement: '',
    statut: 'actif',
    description: '',
  });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
    if (isEditing) {
      fetchSensor();
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

  const fetchSensor = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/capteurs/${id}/`);
      setFormData({
        site: response.data.site || '',
        type: response.data.type || 'mouvement',
        emplacement: response.data.emplacement || '',
        statut: response.data.statut || 'actif',
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Error fetching sensor:', error);
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
        await axios.put(`http://localhost:8000/api/capteurs/${id}/`, formData);
      } else {
        await axios.post('http://localhost:8000/api/capteurs/', formData);
      }
      navigate('/sensors');
    } catch (error) {
      console.error('Error saving sensor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sensors')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier le Capteur' : 'Nouveau Capteur'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
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

            <FormControl fullWidth required>
              <InputLabel>Type de capteur</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type de capteur"
                onChange={handleChange}
              >
                <MenuItem value="mouvement">Détecteur de Mouvement</MenuItem>
                <MenuItem value="fumee">Détecteur de Fumée</MenuItem>
                <MenuItem value="temperature">Capteur de Température</MenuItem>
                <MenuItem value="humidite">Capteur d'Humidité</MenuItem>
                <MenuItem value="intrusion">Détecteur d'Intrusion</MenuItem>
                <MenuItem value="gaz">Détecteur de Gaz</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Emplacement"
              name="emplacement"
              value={formData.emplacement}
              onChange={handleChange}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Statut</InputLabel>
              <Select
                name="statut"
                value={formData.statut}
                label="Statut"
                onChange={handleChange}
              >
                <MenuItem value="actif">Actif</MenuItem>
                <MenuItem value="inactif">Inactif</MenuItem>
                <MenuItem value="defectueux">Défectueux</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/sensors')}
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

export default SensorForm;