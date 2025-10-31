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
import api from '../../utils/axiosConfig';
const MaintenanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    type_maintenance: 'preventive',
    equipement: '',
    description: '',
    site: '',
    technicien: '',
    date_prevue: '',
    duree_estimee: 1,
    priorite: 'moyenne',
    statut: 'planifiee',
    cout_estime: '',
    notes: '',
  });
  const [sites, setSites] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchTechniciens();
    if (isEditing) {
      fetchMaintenance();
    }
  }, [id]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/api/sites/');
      setSites(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    }
  };

  const fetchTechniciens = async () => {
    try {
      // Fetch users with role 'technicien'
      const response = await api.get('/api/auth/techniciens/');
      setTechniciens(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Error fetching techniciens:', error);
      setTechniciens([]);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await api.get(`/api/maintenances/${id}/`);
      setFormData({
        type_maintenance: response.data.type_maintenance || 'preventive',
        equipement: response.data.equipement || '',
        description: response.data.description || '',
        site: response.data.site || '',
        technicien: response.data.technicien || '',
        date_prevue: response.data.date_prevue ? response.data.date_prevue.split('T')[0] : '',
        duree_estimee: response.data.duree_estimee || 1,
        priorite: response.data.priorite || 'moyenne',
        statut: response.data.statut || 'planifiee',
        cout_estime: response.data.cout_estime || '',
        notes: response.data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching maintenance:', error);
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
        await api.put(`/api/maintenances/${id}/`, formData);
      } else {
        await api.post('/api/maintenances/', formData);
      }
      navigate('/maintenances');
    } catch (error) {
      console.error('Error saving maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/maintenances')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier la Maintenance' : 'Nouvelle Maintenance'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
           
          <FormControl fullWidth required>
              <InputLabel>Type de maintenance</InputLabel>
              <Select
                name="type_maintenance"
                value={formData.type_maintenance}
                label="Type de maintenance"
                onChange={handleChange}
              >
                <MenuItem value="preventive">Préventive</MenuItem>
                <MenuItem value="curative">Curative</MenuItem>
                <MenuItem value="predictive">Prédictive</MenuItem>
              </Select>
            </FormControl>*/
           

            <TextField
              label="Équipement"
              name="equipement"
              value={formData.equipement}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
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
                {Array.isArray(sites) && sites.map((site) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Technicien (optionnel)</InputLabel>
              <Select
                name="technicien"
                value={formData.technicien}
                label="Technicien (optionnel)"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Non assigné</em>
                </MenuItem>
                {Array.isArray(techniciens) && techniciens.map((tech) => (
                  <MenuItem key={tech.id} value={tech.id}>
                    {tech.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date prévue"
              name="date_prevue"
              type="date"
              value={formData.date_prevue}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="Durée estimée (heures)"
              name="duree_estimee"
              type="number"
              value={formData.duree_estimee}
              onChange={handleChange}
              inputProps={{ min: 1 }}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Priorité</InputLabel>
              <Select
                name="priorite"
                value={formData.priorite}
                label="Priorité"
                onChange={handleChange}
              >
                <MenuItem value="faible">Faible</MenuItem>
                <MenuItem value="moyenne">Moyenne</MenuItem>
                <MenuItem value="elevee">Élevée</MenuItem>
                <MenuItem value="critique">Critique</MenuItem>
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
                <MenuItem value="planifiee">Planifiée</MenuItem>
                <MenuItem value="en_cours">En cours</MenuItem>
                <MenuItem value="realisee">Réalisée</MenuItem>
                <MenuItem value="annulee">Annulée</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Coût estimé (€)"
              name="cout_estime"
              type="number"
              value={formData.cout_estime}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />

            <TextField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/maintenances')}
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

export default MaintenanceForm;