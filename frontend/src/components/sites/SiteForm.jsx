import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const SiteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nom: '',
    contact_principal: '',
    email: '',
    telephone: '',
    adresse: '',
    statut: 'actif',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchSite();
    }
  }, [id, isEditing]);

  const fetchSite = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/sites/${id}/`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching site:', error);
      setError('Erreur lors du chargement du site');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check permissions for creation
    if (!isEditing && userRole !== 'admin') {
      setError('Vous n\'avez pas la permission de créer un site. Seuls les administrateurs peuvent créer des sites.');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/api/sites/${id}/`, formData);
        setSuccess('Site modifié avec succès');
      } else {
        const response = await axios.post('http://localhost:8000/api/sites/', formData);
        setSuccess('Site créé avec succès');
        setTimeout(() => {
          navigate(`/sites/${response.data.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving site:', error);
      if (error.response?.data) {
        const errors = Object.values(error.response.data).flat();
        setError(errors.join(', '));
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sites')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier le Site' : 'Nouveau Site'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="nom"
                name="nom"
                label="Nom du site"
                value={formData.nom}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="contact_principal"
                name="contact_principal"
                label="Contact principal"
                value={formData.contact_principal}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="telephone"
                name="telephone"
                label="Téléphone"
                value={formData.telephone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="adresse"
                name="adresse"
                label="Adresse"
                value={formData.adresse}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/sites')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default SiteForm;