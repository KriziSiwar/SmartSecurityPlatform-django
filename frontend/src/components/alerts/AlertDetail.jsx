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
  alpha,
  useTheme,
  Fade,
  Slide,
  Zoom,
  Skeleton,
  Alert,
  Tooltip,
  Avatar,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  LocalFireDepartment as FireIcon,
  Build as BuildIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import api from '../../utils/axiosConfig';
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

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchAlert();
  }, [id]);

  const fetchAlert = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.get(`/api/alertes/${id}/`);
      setAlert(response.data);
    } catch (error) {
      console.error('Error fetching alert:', error);
      setError('Erreur lors du chargement de l\'alerte');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      try {
        setActionLoading(true);
        await api.delete(`/api/alertes/${id}/`);
        navigate('/alerts');
      } catch (error) {
        console.error('Error deleting alert:', error);
        setError('Erreur lors de la suppression de l\'alerte');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleMarquerLue = async () => {
    try {
      setActionLoading(true);
      await api.post(`/api/alertes/${id}/marquer_lue/`);
      await fetchAlert();
    } catch (error) {
      console.error('Error marking alert as read:', error);
      setError('Erreur lors du marquage de l\'alerte');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiver = async () => {
    try {
      setActionLoading(true);
      await api.post(`/api/alertes/${id}/archiver/`);
      await fetchAlert();
    } catch (error) {
      console.error('Error archiving alert:', error);
      setError('Erreur lors de l\'archivage de l\'alerte');
    } finally {
      setActionLoading(false);
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
      case 'faible':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getNiveauIcon = (niveau) => {
    switch (niveau) {
      case 'critique':
        return <WarningIcon />;
      case 'eleve':
        return <WarningIcon />;
      case 'moyen':
        return <NotificationsIcon />;
      case 'faible':
        return <CheckCircleIcon />;
      default:
        return <NotificationsIcon />;
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
        return 'primary';
    }
  };

  const getCategorieIaColor = (categorie) => {
    switch (categorie) {
      case 'intrusion':
        return 'error';
      case 'incendie':
        return 'warning';
      case 'technique':
        return 'info';
      case 'fausse_alerte':
        return 'success';
      case 'autre':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getCategorieIcon = (categorie) => {
    switch (categorie) {
      case 'intrusion':
        return <SecurityIcon />;
      case 'incendie':
        return <FireIcon />;
      case 'technique':
        return <BuildIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Composant InfoCard corrigé avec forwardRef
  const InfoCard = React.forwardRef(({ title, icon, children, color = 'primary', animation = false }, ref) => (
    <Card 
      ref={ref}
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        animation: animation ? `${pulse} 2s infinite` : 'none',
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
      <Grid item xs={12} md={8}>
        <Skeleton animation="wave" height={400} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton animation="wave" height={200} />
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LoadingSkeleton />
      </Container>
    );
  }

  if (!alert) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Alerte non trouvée
        </Alert>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header cohérent */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box display="flex" alignItems="center" flex={1}>
            <Tooltip title="Retour à la liste">
              <IconButton
                onClick={() => navigate('/alerts')}
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
                Détails de l'Alerte
              </Typography>
              <Typography variant="h6" color="text.secondary">
                ID: #{alert.id}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Modifier l'alerte">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/alerts/${id}/edit`)}
                sx={{ 
                  borderRadius: 2,
                  px: 3
                }}
              >
                Modifier
              </Button>
            </Tooltip>
            <Tooltip title="Supprimer l'alerte">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={actionLoading}
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

        {actionLoading && <LinearProgress sx={{ mb: 3 }} />}

        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12} md={8}>
            <Zoom in={true} timeout={600}>
              <InfoCard 
                title="Détails de l'Alerte" 
                icon={<WarningIcon />}
                color={getNiveauColor(alert.niveau)}
                animation={alert.statut === 'envoyee'}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box mb={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                        NIVEAU D'URGENCE
                      </Typography>
                      <Chip
                        icon={getNiveauIcon(alert.niveau)}
                        label={alert.niveau?.toUpperCase() || 'INCONNU'}
                        color={getNiveauColor(alert.niveau)}
                        size="medium"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          px: 1
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box mb={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                        STATUT
                      </Typography>
                      <Chip
                        label={alert.statut?.toUpperCase() || 'INCONNU'}
                        color={getStatutColor(alert.statut)}
                        size="medium"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          px: 1
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box mb={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                        MESSAGE
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.background.default, 0.5),
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body1">
                          {alert.message || 'Aucun message'}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  {alert.actions_recommandees && alert.actions_recommandees.length > 0 && (
                    <Grid item xs={12}>
                      <Box mb={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                          ACTIONS RECOMMANDÉES
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {alert.actions_recommandees.map((action, index) => (
                            <Chip
                              key={index}
                              label={action}
                              color="info"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {alert.categorie_ia && (
                    <Grid item xs={12}>
                      <Box mb={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium">
                          CATÉGORIE IA
                        </Typography>
                        <Chip
                          icon={getCategorieIcon(alert.categorie_ia)}
                          label={alert.categorie_ia_display || alert.categorie_ia}
                          color={getCategorieIaColor(alert.categorie_ia)}
                          size="medium"
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </InfoCard>
            </Zoom>
          </Grid>

          {/* Informations secondaires */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Informations de temps */}
              <Grid item xs={12}>
                <Zoom in={true} timeout={800}>
                  <InfoCard title="Horodatage" icon={<ScheduleIcon />} color="info">
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Date d'envoi
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(alert.date_envoi).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(alert.date_envoi).toLocaleTimeString()}
                      </Typography>
                    </Box>

                    {alert.date_lecture && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Date de lecture
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(alert.date_lecture).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.date_lecture).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    )}
                  </InfoCard>
                </Zoom>
              </Grid>

              {/* Événement associé */}
              <Grid item xs={12}>
                <Zoom in={true} timeout={1000}>
                  <InfoCard title="Événement Associé" icon={<EventIcon />} color="secondary">
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {alert.evenement_description || 'Non spécifié'}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Site
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {alert.site_nom || 'Non spécifié'}
                      </Typography>
                    </Box>
                  </InfoCard>
                </Zoom>
              </Grid>

              {/* Destinataire */}
              <Grid item xs={12}>
                <Zoom in={true} timeout={1200}>
                  <InfoCard title="Destinataire" icon={<PersonIcon />} color="primary">
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Nom
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {alert.destinataire_nom || 'Non spécifié'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {alert.destinataire || 'Non spécifié'}
                      </Typography>
                    </Box>
                  </InfoCard>
                </Zoom>
              </Grid>
            </Grid>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Zoom in={true} timeout={1400}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Actions Disponibles
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {alert.statut === 'envoyee' && (
                    <Tooltip title="Marquer cette alerte comme lue">
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={handleMarquerLue}
                        disabled={actionLoading}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          bgcolor: 'success.main',
                          '&:hover': {
                            bgcolor: 'success.dark',
                          }
                        }}
                      >
                        Marquer comme lue
                      </Button>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Archiver cette alerte">
                    <Button
                      variant="outlined"
                      startIcon={<ArchiveIcon />}
                      onClick={handleArchiver}
                      disabled={actionLoading}
                      sx={{ 
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Archiver
                    </Button>
                  </Tooltip>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default AlertDetail;