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

const ReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    titre: '',
    site: '',
    periode: '',
    contenu: '',
  });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
    if (isEditing) {
      fetchReport();
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

  const fetchReport = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/rapports/${id}/`);
      setFormData({
        titre: response.data.titre || '',
        contenu: response.data.contenu || '',
        site: response.data.site || '',
        periode: response.data.periode || '',
      });
    } catch (error) {
      console.error('Error fetching report:', error);
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
        await axios.put(`http://localhost:8000/api/rapports/${id}/`, formData);
      } else {
        await axios.post('http://localhost:8000/api/rapports/', formData);
      }
      navigate('/reports');
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier le Rapport' : 'Nouveau Rapport'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Titre"
              name="titre"
              value={formData.titre}
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

            <TextField
              label="Période"
              name="periode"
              value={formData.periode}
              onChange={handleChange}
              placeholder="ex: 2024-01"
              required
              fullWidth
            />

            <TextField
              label="Contenu"
              name="contenu"
              value={formData.contenu}
              onChange={handleChange}
              multiline
              rows={10}
              required
              fullWidth
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/reports')}
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

export default ReportForm;