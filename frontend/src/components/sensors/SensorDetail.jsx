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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';

const SensorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState(null);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensor();
  }, [id]);

  const fetchSensor = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/capteurs/${id}/`);
      setSensor(response.data);
      setEvenements(response.data.evenements || []);
    } catch (error) {
      console.error('Error fetching sensor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce capteur ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/capteurs/${id}/`);
        navigate('/sensors');
      } catch (error) {
        console.error('Error deleting sensor:', error);
      }
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'actif':
        return 'success';
      case 'inactif':
        return 'warning';
      case 'defectueux':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!sensor) {
    return <Typography>Capteur non trouvé</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sensors')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">Détails du Capteur</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{sensor.nom}</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/sensors/${id}/edit`)}
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
                  <Typography variant="subtitle2" color="text.secondary">Site</Typography>
                  <Typography variant="body1">{sensor.site_nom}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{sensor.type}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                  <Chip
                    label={sensor.statut}
                    color={getStatusColor(sensor.statut)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Valeur actuelle</Typography>
                  <Typography variant="body1">{sensor.valeur_actuelle} {sensor.unite}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Seuil minimum</Typography>
                  <Typography variant="body1">{sensor.seuil_min} {sensor.unite}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Seuil maximum</Typography>
                  <Typography variant="body1">{sensor.seuil_max} {sensor.unite}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{sensor.description || 'Aucune description'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Statistiques</Typography>
              <Typography variant="body2" color="text.secondary">
                Événements associés: {sensor.nb_evenements || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Événements récents</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Niveau</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evenements.map((evenement) => (
                <TableRow key={evenement.id}>
                  <TableCell>{evenement.type_evenement}</TableCell>
                  <TableCell>{evenement.description}</TableCell>
                  <TableCell>{new Date(evenement.date_heure).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={evenement.niveau_urgence}
                      color={evenement.niveau_urgence === 'critique' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {evenements.length === 0 && (
          <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucun événement récent
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default SensorDetail;