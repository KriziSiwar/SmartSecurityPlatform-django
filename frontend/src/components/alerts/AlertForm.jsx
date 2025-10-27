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

const AlertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    evenement: '',
    destinataire: '',
    niveau: 'info',
    message: '',
  });
  const [evenements, setEvenements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
    if (isEditing) {
      fetchAlert();
    }
  }, [id, isEditing]);

  const fetchData = async () => {
    try {
      const evenementsResponse = await axios.get('http://localhost:8000/api/evenements/');
      const usersResponse = await axios.get('http://localhost:8000/api/auth/users/');

      setEvenements(evenementsResponse.data.results || evenementsResponse.data);
      setUsers(usersResponse.data.results || usersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAlert = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/alertes/${id}/`);
      setFormData({
        evenement: response.data.evenement,
        destinataire: response.data.destinataire,
        niveau: response.data.niveau,
        message: response.data.message,
      });
    } catch (error) {
      console.error('Error fetching alert:', error);
      setError('Erreur lors du chargement de l\'alerte');
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

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/api/alertes/${id}/`, formData);
        setSuccess('Alerte modifiée avec succès');
      } else {
        const response = await axios.post('http://localhost:8000/api/alertes/', formData);
        setSuccess('Alerte créée avec succès');
        setTimeout(() => {
          navigate(`/alerts/${response.data.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving alert:', error);
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
          onClick={() => navigate('/alerts')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier l\'Alerte' : 'Nouvelle Alerte'}
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
              <FormControl fullWidth required>
                <InputLabel>Événement</InputLabel>
                <Select
                  name="evenement"
                  value={formData.evenement}
                  label="Événement"
                  onChange={handleChange}
                >
                  {evenements.map((evenement) => (
                    <MenuItem key={evenement.id} value={evenement.id}>
                      {evenement.description} - {evenement.site_nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Destinataire</InputLabel>
                <Select
                  name="destinataire"
                  value={formData.destinataire}
                  label="Destinataire"
                  onChange={handleChange}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username} - {user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Niveau</InputLabel>
                <Select
                  name="niveau"
                  value={formData.niveau}
                  label="Niveau"
                  onChange={handleChange}
                >
                  <MenuItem value="critique">Critique</MenuItem>
                  <MenuItem value="moyen">Moyen</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                id="message"
                name="message"
                label="Message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Entrez le message de l'alerte..."
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/alerts')}
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

export default AlertForm;