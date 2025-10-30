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

const CameraDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [camera, setCamera] = useState(null);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCamera();
  }, [id]);

  const fetchCamera = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/cameras/${id}/`);
      setCamera(response.data);
      setEvenements(response.data.evenements || []);
    } catch (error) {
      console.error('Error fetching camera:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette caméra ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/cameras/${id}/`);
        navigate('/cameras');
      } catch (error) {
        console.error('Error deleting camera:', error);
      }
    }
  };

  const getStatusColor = (etat) => {
    switch (etat) {
      case 'en_ligne':
        return 'success';
      case 'hors_ligne':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!camera) {
    return <Typography>Caméra non trouvée</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cameras')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">Détails de la Caméra</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{camera.nom}</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/cameras/${id}/edit`)}
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
                  <Typography variant="body1">{camera.site_nom}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{camera.type}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">État</Typography>
                  <Chip
                    label={camera.etat}
                    color={getStatusColor(camera.etat)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Adresse IP</Typography>
                  <Typography variant="body1">{camera.adresse_ip}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Port</Typography>
                  <Typography variant="body1">{camera.port}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Résolution</Typography>
                  <Typography variant="body1">{camera.resolution}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{camera.description || 'Aucune description'}</Typography>
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
                Événements associés: {camera.nb_evenements || 0}
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

export default CameraDetail;