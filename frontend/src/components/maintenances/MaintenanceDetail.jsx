import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';

const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenance();
  }, [id]);

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/maintenances/${id}/`);
      setMaintenance(response.data);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/maintenances/${id}/`);
        navigate('/maintenances');
      } catch (error) {
        console.error('Error deleting maintenance:', error);
      }
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'planifiee':
        return 'info';
      case 'en_cours':
        return 'warning';
      case 'realisee':
        return 'success';
      case 'annulee':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!maintenance) {
    return <Typography>Maintenance non trouvée</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/maintenances')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">Détails de la Maintenance</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{maintenance.type_maintenance}</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/maintenances/${id}/edit`)}
                    sx={{ mr: 1 }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                  >
                    Supprimer
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{maintenance.type_maintenance}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Site</Typography>
                  <Typography variant="body1">{maintenance.site_nom}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                  <Chip
                    label={maintenance.statut}
                    color={getStatusColor(maintenance.statut)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date prévue</Typography>
                  <Typography variant="body1">{new Date(maintenance.date_prevue).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Technicien</Typography>
                  <Typography variant="body1">{maintenance.technicien_nom || 'Non assigné'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Durée estimée</Typography>
                  <Typography variant="body1">{maintenance.duree_estimee} heures</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Priorité</Typography>
                  <Typography variant="body1">{maintenance.priorite}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Coût estimé</Typography>
                  <Typography variant="body1">{maintenance.cout_estime} €</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{maintenance.description || 'Aucune description'}</Typography>
                </Grid>
                {maintenance.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                    <Paper sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {maintenance.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Informations complémentaires</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Date de création: {new Date(maintenance.date_creation).toLocaleDateString()}
              </Typography>
              {maintenance.date_realisation && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Date de réalisation: {new Date(maintenance.date_realisation).toLocaleDateString()}
                </Typography>
              )}
              {maintenance.cout_reel && (
                <Typography variant="body2" color="text.secondary">
                  Coût réel: {maintenance.cout_reel} €
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MaintenanceDetail;