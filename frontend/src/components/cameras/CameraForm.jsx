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

const CameraForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nom: '',
    site: '',
    type: 'fixe',
    etat: 'en_ligne',
    ip_address: '',
    emplacement: '',
    resolution: '',
    description: '',
  });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
    if (isEditing) {
      fetchCamera();
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

  const fetchCamera = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/cameras/${id}/`);
      setFormData({
        nom: response.data.nom || '',
        site: response.data.site || '',
        type: response.data.type || 'fixe',
        etat: response.data.etat || 'en_ligne',
        ip_address: response.data.ip_address || '',
        emplacement: response.data.emplacement || '',
        resolution: response.data.resolution || '',
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Error fetching camera:', error);
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
        await axios.put(`http://localhost:8000/api/cameras/${id}/`, formData);
      } else {
        await axios.post('http://localhost:8000/api/cameras/', formData);
      }
      navigate('/cameras');
    } catch (error) {
      console.error('Error saving camera:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cameras')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier la Caméra' : 'Nouvelle Caméra'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
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

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleChange}
              >
                <MenuItem value="fixe">Fixe</MenuItem>
                <MenuItem value="ptz">PTZ (Pan-Tilt-Zoom)</MenuItem>
                <MenuItem value="thermique">Thermique</MenuItem>
                <MenuItem value="dome">Dôme</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>État</InputLabel>
              <Select
                name="etat"
                value={formData.etat}
                label="État"
                onChange={handleChange}
              >
                <MenuItem value="en_ligne">En ligne</MenuItem>
                <MenuItem value="hors_ligne">Hors ligne</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Adresse IP"
              name="ip_address"
              value={formData.ip_address}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Emplacement"
              name="emplacement"
              value={formData.emplacement}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Résolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleChange}
              placeholder="ex: 1920x1080"
              fullWidth
            />

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
                onClick={() => navigate('/cameras')}
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

export default CameraForm;