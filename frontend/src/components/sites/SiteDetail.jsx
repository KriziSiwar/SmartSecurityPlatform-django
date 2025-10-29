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
  alpha,
  useTheme,
  Fade,
  Zoom,
  Skeleton,
  Alert,
  Tooltip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Videocam as VideocamIcon,
  Sensors as SensorsIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon, // Ajout de l'import manquant
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import axios from 'axios';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const SiteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [capteurs, setCapteurs] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchSiteData();
  }, [id]);

  const fetchSiteData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [siteResponse, camerasResponse, capteursResponse, evenementsResponse, alertesResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/sites/${id}/`),
        axios.get(`http://localhost:8000/api/cameras/?site=${id}`),
        axios.get(`http://localhost:8000/api/capteurs/?site=${id}`),
        axios.get(`http://localhost:8000/api/evenements/?site=${id}`),
        axios.get(`http://localhost:8000/api/alertes/?site=${id}`),
      ]);

      setSite(siteResponse.data);
      
      setCameras(Array.isArray(camerasResponse.data) ? camerasResponse.data : (camerasResponse.data?.results || []));
      setCapteurs(Array.isArray(capteursResponse.data) ? capteursResponse.data : (capteursResponse.data?.results || []));
      setEvenements(Array.isArray(evenementsResponse.data) ? evenementsResponse.data : (evenementsResponse.data?.results || []));
      setAlertes(Array.isArray(alertesResponse.data) ? alertesResponse.data : (alertesResponse.data?.results || []));
      
    } catch (error) {
      console.error('Error fetching site data:', error);
      setError('Erreur lors du chargement des données du site');
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
        setError('Erreur lors de la suppression du site');
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

  const StatsCard = ({ title, value, icon, color, subtitle }) => (
    <Zoom in={true} timeout={600}>
      <Card 
        sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          animation: `${fadeIn} 0.6s ease-out`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
            transition: 'all 0.3s ease',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ color: `${color}.main`, mb: 1 }}>{icon}</Box>
          <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          <Typography variant="h6" fontWeight="medium">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );

  const InfoCard = React.forwardRef(({ title, icon, children, color = 'primary' }, ref) => (
    <Card 
      ref={ref}
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.1)}`,
          transition: 'all 0.3s ease',
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  ));

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Skeleton animation="wave" height={80} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton animation="wave" height={300} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton animation="wave" height={300} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton animation="wave" height={200} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton animation="wave" height={200} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton animation="wave" height={200} />
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LoadingSkeleton />
      </Container>
    );
  }

  if (!site) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Site non trouvé
        </Alert>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header cohérent */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box display="flex" alignItems="center" flex={1}>
            <Tooltip title="Retour à la liste">
              <IconButton
                onClick={() => navigate('/sites')}
                sx={{ 
                  mr: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {site.nom}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Détails du site client
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Modifier le site">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/sites/${id}/edit`)}
                sx={{ 
                  borderRadius: 2,
                  px: 3
                }}
              >
                Modifier
              </Button>
            </Tooltip>
            <Tooltip title="Supprimer le site">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{ 
                  borderRadius: 2,
                  px: 3
                }}
              >
                Supprimer
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Caméras"
              value={cameras.length}
              icon={<VideocamIcon fontSize="large" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Capteurs"
              value={capteurs.length}
              icon={<SensorsIcon fontSize="large" />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Événements"
              value={evenements.length}
              icon={<EventIcon fontSize="large" />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Alertes"
              value={alertes.length}
              icon={<WarningIcon fontSize="large" />}
              color="error"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Informations du site */}
          <Grid item xs={12} md={6}>
            <Zoom in={true} timeout={600}>
              <InfoCard 
                title="Informations du Site" 
                icon={<BusinessIcon />}
                color="primary"
              >
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                    STATUT
                  </Typography>
                  <Chip
                    label={site.statut?.toUpperCase() || 'INCONNU'}
                    color={getStatusColor(site.statut)}
                    size="medium"
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      px: 1
                    }}
                  />
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                    CONTACT PRINCIPAL
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body1" fontWeight="medium">
                      {site.contact_principal || 'Non spécifié'}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                    EMAIL
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body1" fontWeight="medium">
                      {site.email || 'Non spécifié'}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                    TÉLÉPHONE
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body1" fontWeight="medium">
                      {site.telephone || 'Non spécifié'}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                    ADRESSE
                  </Typography>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body1" fontWeight="medium">
                      {site.adresse || 'Non spécifiée'}
                    </Typography>
                  </Box>
                </Box>
              </InfoCard>
            </Zoom>
          </Grid>

          {/* État du système */}
          <Grid item xs={12} md={6}>
            <Zoom in={true} timeout={800}>
              <InfoCard 
                title="État du Système" 
                icon={<VideocamIcon />}
                color="info"
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {cameras.filter(c => c.etat === 'en_ligne').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Caméras en ligne
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        sur {cameras.length}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {capteurs.filter(c => c.statut === 'actif').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Capteurs actifs
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        sur {capteurs.length}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {evenements.filter(e => e.niveau_urgence === 'critique').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Événements critiques
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="error.main" fontWeight="bold">
                        {alertes.filter(a => a.niveau === 'critique').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Alertes critiques
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </InfoCard>
            </Zoom>
          </Grid>

          {/* Caméras */}
          <Grid item xs={12}>
            <Zoom in={true} timeout={1000}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      <VideocamIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Caméras ({cameras.length})
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ 
                          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>État</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Emplacement</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cameras.length > 0 ? (
                          cameras.slice(0, 5).map((camera, index) => (
                            <TableRow 
                              key={camera.id}
                              sx={{ 
                                animation: `${fadeIn} 0.5s ease-out`,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                },
                              }}
                            >
                              <TableCell>
                                <Typography fontWeight="medium">
                                  {camera.nom}
                                </Typography>
                              </TableCell>
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
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Aucune caméra disponible
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Capteurs */}
          <Grid item xs={12}>
            <Zoom in={true} timeout={1200}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'secondary.main',
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      <SensorsIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Capteurs ({capteurs.length})
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ 
                          background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                        }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valeur</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Seuil</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {capteurs.length > 0 ? (
                          capteurs.slice(0, 5).map((capteur, index) => (
                            <TableRow 
                              key={capteur.id}
                              sx={{ 
                                animation: `${fadeIn} 0.5s ease-out`,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                                },
                              }}
                            >
                              <TableCell>{capteur.type}</TableCell>
                              <TableCell>
                                <Typography fontWeight="medium">
                                  {capteur.valeur_actuelle || 'N/A'} {capteur.unite || ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={capteur.statut}
                                  color={capteur.statut === 'actif' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {capteur.seuil_min || 'N/A'} - {capteur.seuil_max || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Aucun capteur disponible
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Événements récents */}
          <Grid item xs={12}>
            <Zoom in={true} timeout={1400}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'warning.main',
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      <EventIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Événements Récents ({evenements.length})
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ 
                          background: `linear-gradient(45deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                        }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Niveau d'urgence</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {evenements.length > 0 ? (
                          evenements.slice(0, 5).map((evenement, index) => (
                            <TableRow 
                              key={evenement.id}
                              sx={{ 
                                animation: `${fadeIn} 0.5s ease-out`,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.warning.main, 0.04),
                                },
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2">
                                  {evenement.description || 'N/A'}
                                </Typography>
                              </TableCell>
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
                              <TableCell>
                                {new Date(evenement.date_heure || evenement.date_detection).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Aucun événement disponible
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default SiteDetail;