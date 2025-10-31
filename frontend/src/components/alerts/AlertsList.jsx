import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme,
  Fade,
  Slide,
  Zoom,
  Skeleton,
  Alert,
  Tooltip,
  InputAdornment,
  Badge,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  LocalFireDepartment as FireIcon,
  Build as BuildIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import api from '../../utils/axiosConfig';
// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    niveau: '',
    statut: '',
    destinataire: '',
    categorie_ia: '',
    search: '',
  });
  const navigate = useNavigate();
  const { userRole, userId } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      setError(null);
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.niveau) params.append('niveau', filters.niveau);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.destinataire) params.append('destinataire', filters.destinataire);
      if (filters.categorie_ia) params.append('categorie_ia', filters.categorie_ia);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/api/alertes/?${params}`);
      const data = response.data.results || response.data;
      const alertsArray = Array.isArray(data) ? data : [];
      setAlerts(alertsArray);

      // Calculate stats
      const total = alertsArray.length;
      const critiques = alertsArray.filter(a => a.niveau === 'critique').length;
      const nonLues = alertsArray.filter(a => a.statut === 'envoyee').length;
      const archivees = alertsArray.filter(a => a.statut === 'archivee').length;
      const nouvelles = alertsArray.filter(a => {
        const alertDate = new Date(a.date_envoi);
        const now = new Date();
        const diffHours = (now - alertDate) / (1000 * 60 * 60);
        return diffHours < 24 && a.statut === 'envoyee';
      }).length;

      setStats({ total, critiques, nonLues, archivees, nouvelles });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      try {
        await api.delete(`/api/alertes/${id}/`);
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting alert:', error);
        setError('Erreur lors de la suppression de l\'alerte');
      }
    }
  };

  const handleMarquerLue = async (id) => {
    try {
      await api.post(`/api/alertes/${id}/marquer_lue/`);
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
      setError('Erreur lors du marquage de l\'alerte');
    }
  };

  const handleArchiver = async (id) => {
    try {
      await api.post(`/api/alertes/${id}/archiver/`);
      fetchAlerts();
    } catch (error) {
      console.error('Error archiving alert:', error);
      setError('Erreur lors de l\'archivage de l\'alerte');
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
        return <ErrorIcon />;
      case 'eleve':
        return <WarningIcon />;
      case 'moyen':
        return <InfoIcon />;
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

  const StatsCard = ({ title, value, color, icon, subtitle, animation = false }) => (
    <Zoom in={true} style={{ transitionDelay: '200ms' }}>
      <Card 
        sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          animation: animation ? `${pulse} 2s infinite` : 'none',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
            transition: 'all 0.3s ease',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
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
            </Box>
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  const LoadingSkeleton = () => (
    <>
      {[...Array(6)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton animation="wave" height={40} /></TableCell>
          <TableCell><Skeleton animation="wave" width={80} height={32} /></TableCell>
          <TableCell><Skeleton animation="wave" width={100} height={32} /></TableCell>
          <TableCell><Skeleton animation="wave" width={120} height={40} /></TableCell>
          <TableCell><Skeleton animation="wave" width={80} height={32} /></TableCell>
          <TableCell><Skeleton animation="wave" /></TableCell>
          <TableCell><Skeleton animation="wave" /></TableCell>
          <TableCell><Skeleton animation="wave" width={140} /></TableCell>
          <TableCell><Skeleton animation="wave" width={200} height={40} /></TableCell>
        </TableRow>
      ))}
    </>
  );

  const isAlertRecent = (alertDate) => {
    if (!alertDate) return false;
    try {
      const date = new Date(alertDate);
      const now = new Date();
      const diffMinutes = (now - date) / (1000 * 60);
      return diffMinutes < 10;
    } catch {
      return false;
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header cohérent avec SitesList */}
        <Slide direction="down" in={true} timeout={500}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Gestion des Alertes
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Surveillez et gérez toutes les alertes du système
              </Typography>
            </Box>
            {(userRole === 'admin' || userRole === 'client') && (
              <Zoom in={true} timeout={600}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/alerts/new')}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  Nouvelle Alerte
                </Button>
              </Zoom>
            )}
          </Box>
        </Slide>

        {/* Cartes de statistiques avec les mêmes couleurs que SitesList */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Alertes"
              value={stats.total || 0}
              icon={<NotificationsIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Alertes Critiques"
              value={stats.critiques || 0}
              icon={<ErrorIcon />}
              color="error"
              animation={(stats.critiques || 0) > 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Non Lues"
              value={stats.nonLues || 0}
              icon={<WarningIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Archivées"
              value={stats.archivees || 0}
              icon={<ArchiveIcon />}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Filtres avec le même style que SitesList */}
        <Slide direction="up" in={true} timeout={700}>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                label="Rechercher une alerte"
                variant="outlined"
                size="small"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                sx={{ 
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={filters.niveau}
                  label="Niveau"
                  onChange={(e) => handleFilterChange('niveau', e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous les niveaux</MenuItem>
                  <MenuItem value="critique">Critique</MenuItem>
                  <MenuItem value="eleve">Élevé</MenuItem>
                  <MenuItem value="moyen">Moyen</MenuItem>
                  <MenuItem value="faible">Faible</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Catégorie IA</InputLabel>
                <Select
                  value={filters.categorie_ia || ''}
                  label="Catégorie IA"
                  onChange={(e) => handleFilterChange('categorie_ia', e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="intrusion">Intrusion</MenuItem>
                  <MenuItem value="incendie">Incendie</MenuItem>
                  <MenuItem value="technique">Technique</MenuItem>
                  <MenuItem value="fausse_alerte">Fausse Alerte</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.statut}
                  label="Statut"
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="envoyee">Envoyée</MenuItem>
                  <MenuItem value="lue">Lue</MenuItem>
                  <MenuItem value="archivee">Archivée</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Actualiser">
                <IconButton 
                  onClick={fetchAlerts}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'rotate(180deg)',
                      transition: 'transform 0.6s ease',
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Slide>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Tableau avec le même style que SitesList */}
        <Fade in={true} timeout={1000}>
          <Paper 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {loading && <LinearProgress />}
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Événement</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Niveau</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie IA</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions IA</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Site</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : alerts.map((alert, index) => {
                    const isRecent = isAlertRecent(alert.date_envoi);
                    
                    return (
                      <Slide 
                        key={alert.id} 
                        direction="up" 
                        in={true} 
                        timeout={500 + (index * 100)}
                        mountOnEnter
                        unmountOnExit
                      >
                        <TableRow 
                          sx={{ 
                            animation: `${fadeIn} 0.5s ease-out`,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              transform: 'translateY(-2px)',
                              transition: 'all 0.3s ease',
                            },
                            ...(isRecent && {
                              borderLeft: `4px solid ${theme.palette.warning.main}`,
                            })
                          }}
                          onClick={() => navigate(`/alerts/${alert.id}`)}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {isRecent && (
                                <Badge color="warning" variant="dot">
                                  <EmailIcon fontSize="small" color="action" />
                                </Badge>
                              )}
                              <Typography fontWeight="medium">
                                {alert.evenement_description || 'Aucune description'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getNiveauIcon(alert.niveau)}
                              label={alert.niveau || 'Inconnu'}
                              color={getNiveauColor(alert.niveau)}
                              size="small"
                              sx={{ 
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {alert.categorie_ia ? (
                              <Chip
                                icon={getCategorieIcon(alert.categorie_ia)}
                                label={alert.categorie_ia_display || alert.categorie_ia}
                                color={getCategorieIaColor(alert.categorie_ia)}
                                size="small"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  fontWeight: 'medium'
                                }}
                              />
                            ) : (
                              <Chip
                                label="Non classifiée"
                                variant="outlined"
                                size="small"
                                color="default"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {alert.actions_recommandees && alert.actions_recommandees.length > 0 ? (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  {alert.actions_recommandees.length} action(s)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {alert.actions_recommandees.slice(0, 2).join(', ')}
                                  {alert.actions_recommandees.length > 2 && '...'}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Aucune
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.statut || 'Inconnu'}
                              color={getStatutColor(alert.statut)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {alert.site_nom || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {alert.date_envoi ? new Date(alert.date_envoi).toLocaleDateString() : 'Date inconnue'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {alert.date_envoi ? new Date(alert.date_envoi).toLocaleTimeString() : ''}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/alerts/${alert.id}`)}
                                  sx={{
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.main' }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {(userRole === 'admin' || (userRole === 'client' && alert.destinataire === userId)) && (
                                <>
                                  <Tooltip title="Modifier">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/alerts/${alert.id}/edit`)}
                                      sx={{
                                        bgcolor: 'secondary.light',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'secondary.main' }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {alert.statut === 'envoyee' && (
                                    <Tooltip title="Marquer comme lue">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleMarquerLue(alert.id)}
                                        sx={{
                                          bgcolor: 'success.light',
                                          color: 'white',
                                          '&:hover': { bgcolor: 'success.main' }
                                        }}
                                      >
                                        <CheckCircleIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="Archiver">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleArchiver(alert.id)}
                                      sx={{
                                        bgcolor: 'grey.400',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'grey.600' }
                                      }}
                                    >
                                      <ArchiveIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {userRole === 'admin' && (
                                    <Tooltip title="Supprimer">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(alert.id)}
                                        sx={{
                                          bgcolor: 'error.light',
                                          color: 'white',
                                          '&:hover': { bgcolor: 'error.main' }
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Slide>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {!loading && alerts.length === 0 && (
              <Box sx={{ p: 8, textAlign: 'center' }}>
                <NotificationsIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: 'text.secondary', 
                    mb: 2 
                  }} 
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune alerte trouvée
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {filters.search || filters.niveau || filters.statut || filters.categorie_ia
                    ? 'Aucune alerte ne correspond à vos critères de recherche.' 
                    : 'Commencez par créer votre première alerte.'}
                </Typography>
                {(userRole === 'admin' || userRole === 'client') && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/alerts/new')}
                  >
                    Créer une alerte
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Fade>
      </Container>
    </Fade>
  );
};

export default AlertsList;