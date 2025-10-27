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
  Videocam as VideocamIcon,
  Sensors as SensorsIcon,
  Event as EventIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';

const SiteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [capteurs, setCapteurs] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteData();
  }, [id]);

  const fetchSiteData = async () => {
    try {
      const [siteResponse, camerasResponse, capteursResponse, evenementsResponse, alertesResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/sites/${id}/`),
        axios.get(`http://localhost:8000/api/cameras/?site=${id}`),
        axios.get(`http://localhost:8000/api/capteurs/?site=${id}`),
        axios.get(`http://localhost:8000/api/evenements/?site=${id}`),
        axios.get(`http://localhost:8000/api/alertes/?site=${id}`),
      ]);

      setSite(siteResponse.data);
      setCameras(camerasResponse.data);
      setCapteurs(capteursResponse.data);
      setEvenements(evenementsResponse.data);
      setAlertes(alertesResponse.data);
    } catch (error) {
      console.error('Error fetching site data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/sites/${id}/`);
        navigate('/sites');
      } catch (error) {
        console.error('Error deleting site:', error);
      }
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'actif':
        return 'success';
      case 'inactif':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!site) {
    return <Typography>Site non trouvé</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/sites')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" ml={1}>
            {site.nom}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/sites/${id}/edit`)}
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
        {/* Site Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du Site
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Statut
                </Typography>
                <Chip
                  label={site.statut}
                  color={getStatusColor(site.statut)}
                  size="small"
                />
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Contact Principal
                </Typography>
                <Typography>{site.contact_principal}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography>{site.email}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Téléphone
                </Typography>
                <Typography>{site.telephone}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Adresse
                </Typography>
                <Typography>{site.adresse}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center">
                    <VideocamIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h4">{site.nb_cameras}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Caméras
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center">
                    <SensorsIcon color="secondary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h4">{site.nb_capteurs}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Capteurs
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center">
                    <EventIcon color="warning" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h4">{site.nb_evenements}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Événements
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center">
                    <WarningIcon color="error" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h4">{alertes.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Alertes
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cameras */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Caméras ({cameras.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>État</TableCell>
                      <TableCell>Emplacement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cameras.slice(0, 5).map((camera) => (
                      <TableRow key={camera.id}>
                        <TableCell>{camera.nom}</TableCell>
                        <TableCell>{camera.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={camera.etat}
                            color={camera.etat === 'en_ligne' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{camera.emplacement}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Capteurs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Capteurs ({capteurs.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Valeur</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Seuil</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {capteurs.slice(0, 5).map((capteur) => (
                      <TableRow key={capteur.id}>
                        <TableCell>{capteur.type}</TableCell>
                        <TableCell>{capteur.valeur_actuelle} {capteur.unite}</TableCell>
                        <TableCell>
                          <Chip
                            label={capteur.statut}
                            color={capteur.statut === 'actif' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{capteur.seuil_min} - {capteur.seuil_max}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Events */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Événements Récents ({evenements.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Niveau d'urgence</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evenements.slice(0, 5).map((evenement) => (
                      <TableRow key={evenement.id}>
                        <TableCell>{evenement.description}</TableCell>
                        <TableCell>{evenement.type_evenement}</TableCell>
                        <TableCell>
                          <Chip
                            label={evenement.niveau_urgence}
                            color={
                              evenement.niveau_urgence === 'critique' ? 'error' :
                              evenement.niveau_urgence === 'eleve' ? 'warning' : 'info'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(evenement.date_heure).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SiteDetail;