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
import api from '../../utils/axiosConfig';
const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/api/evenements/${id}/`);
      setEvent(response.data);
      setAlertes(response.data.alertes || []);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await api.delete(`/api/evenements/${id}/`);
        navigate('/events');
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleResoudre = async () => {
    try {
      await api.post(`/api/evenements/${id}/resoudre/`);
      fetchEvent();
    } catch (error) {
      console.error('Error resolving event:', error);
    }
  };

  const getUrgencyColor = (niveau) => {
    switch (niveau) {
      case 'critique':
        return 'error';
      case 'eleve':
        return 'warning';
      case 'moyen':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_cours':
        return 'warning';
      case 'resolu':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!event) {
    return <Typography>Événement non trouvé</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">Détails de l'Événement</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{event.type_evenement}</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/events/${id}/edit`)}
                    sx={{ mr: 1 }}
                  >
                    Modifier
                  </Button>
                  {event.statut === 'en_cours' && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleResoudre}
                      sx={{ mr: 1 }}
                    >
                      Marquer résolu
                    </Button>
                  )}
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
                  <Typography variant="body1">{event.type_evenement}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Site</Typography>
                  <Typography variant="body1">{event.site_nom}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Niveau d'urgence</Typography>
                  <Chip
                    label={event.niveau_urgence}
                    color={getUrgencyColor(event.niveau_urgence)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                  <Chip
                    label={event.statut}
                    color={getStatusColor(event.statut)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date et heure</Typography>
                  <Typography variant="body1">{new Date(event.date_heure).toLocaleString()}</Typography>
                </Grid>
                {event.camera_nom && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Caméra</Typography>
                    <Typography variant="body1">{event.camera_nom}</Typography>
                  </Grid>
                )}
                {event.capteur_nom && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Capteur</Typography>
                    <Typography variant="body1">{event.capteur_nom}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{event.description || 'Aucune description'}</Typography>
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
                Alertes associées: {event.nb_alertes || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Alertes associées</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Niveau</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Destinataire</TableCell>
                <TableCell>Date d'envoi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alertes.map((alerte) => (
                <TableRow key={alerte.id}>
                  <TableCell>
                    <Chip
                      label={alerte.niveau}
                      color={alerte.niveau === 'critique' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alerte.statut}
                      color={alerte.statut === 'lue' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{alerte.destinataire_nom}</TableCell>
                  <TableCell>{new Date(alerte.date_envoi).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {alertes.length === 0 && (
          <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune alerte associée
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default EventDetail;