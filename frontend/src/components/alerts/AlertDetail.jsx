import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlert();
  }, [id]);

  const fetchAlert = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/alertes/${id}/`);
      setAlert(response.data);
    } catch (error) {
      console.error('Error fetching alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/alertes/${id}/`);
        navigate('/alerts');
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };

  const handleMarquerLue = async () => {
    try {
      await axios.post(`http://localhost:8000/api/alertes/${id}/marquer_lue/`);
      fetchAlert();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleArchiver = async () => {
    try {
      await axios.post(`http://localhost:8000/api/alertes/${id}/archiver/`);
      fetchAlert();
    } catch (error) {
      console.error('Error archiving alert:', error);
    }
  };

  const getNiveauColor = (niveau) => {
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

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'envoyee':
        return 'warning';
      case 'lue':
        return 'success';
      case 'archivee':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!alert) {
    return <Typography>Alerte non trouvée</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/alerts')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h4">
            Alerte #{alert.id}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/alerts/${id}/edit`)}
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

      <Grid container spacing={3}>
        {/* Alert Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Détails de l'Alerte
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Niveau d'urgence
                </Typography>
                <Chip
                  label={alert.niveau}
                  color={getNiveauColor(alert.niveau)}
                  size="medium"
                />
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Statut
                </Typography>
                <Chip
                  label={alert.statut}
                  color={getStatutColor(alert.statut)}
                  size="medium"
                />
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message
                </Typography>
                <Typography variant="body1">
                  {alert.message}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date d'envoi
                </Typography>
                <Typography variant="body1">
                  {new Date(alert.date_envoi).toLocaleString()}
                </Typography>
              </Box>

              {alert.date_lecture && (
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date de lecture
                  </Typography>
                  <Typography variant="body1">
                    {new Date(alert.date_lecture).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Event Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Événement Associé
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">
                  {alert.evenement_description}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Site
                </Typography>
                <Typography variant="body1">
                  {alert.site_nom}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recipient Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Destinataire
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nom d'utilisateur
                </Typography>
                <Typography variant="body1">
                  {alert.destinataire_nom}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1">
                  {alert.destinataire}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {alert.statut === 'envoyee' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMarquerLue}
                >
                  Marquer comme lue
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleArchiver}
              >
                Archiver
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AlertDetail;