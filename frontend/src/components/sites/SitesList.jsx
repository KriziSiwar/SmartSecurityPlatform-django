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
  Card,
  CardContent,
  Grid,
  alpha,
  useTheme,
  Fade,
  Slide,
  Zoom,
  Skeleton,
  Alert,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import axios from 'axios';

// Animation pour le chargement
const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SitesList = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
  });
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchSites();
  }, [filters]);

  const fetchSites = async () => {
    try {
      setError(null);
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.statut) params.append('statut', filters.statut);

      const response = await axios.get(`http://localhost:8000/api/sites/?${params}`);
      const data = response.data.results || response.data;
      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setError('Erreur lors du chargement des sites');
      setSites([]);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/sites/${id}/`);
        fetchSites();
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

  const StatsCard = ({ title, value, icon, color }) => (
    <Zoom in={true} style={{ transitionDelay: '200ms' }}>
      <Card 
        sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ color: `${color}.main`, mb: 1 }}>{icon}</Box>
          <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton animation="wave" /></TableCell>
          <TableCell><Skeleton animation="wave" /></TableCell>
          <TableCell><Skeleton animation="wave" /></TableCell>
          <TableCell><Skeleton animation="wave" width={80} /></TableCell>
          <TableCell><Skeleton animation="wave" width={60} /></TableCell>
          <TableCell><Skeleton animation="wave" width={60} /></TableCell>
          <TableCell><Skeleton animation="wave" width={60} /></TableCell>
          <TableCell><Skeleton animation="wave" width={120} /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header avec animation */}
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
                Sites Clients
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Gérez et surveillez tous vos sites clients
              </Typography>
            </Box>
            {userRole === 'admin' && (
              <Zoom in={true} timeout={600}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/sites/new')}
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
                  Nouveau Site
                </Button>
              </Zoom>
            )}
          </Box>
        </Slide>

        {/* Cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Sites Actifs"
              value={sites.filter(site => site.statut === 'actif').length}
              icon={<LocationIcon fontSize="large" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Sites"
              value={sites.length}
              icon={<LocationIcon fontSize="large" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Caméras"
              value={sites.reduce((acc, site) => acc + (site.nb_cameras || 0), 0)}
              icon={<VisibilityIcon fontSize="large" />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Événements"
              value={sites.reduce((acc, site) => acc + (site.nb_evenements || 0), 0)}
              icon={<EmailIcon fontSize="large" />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Filtres avec animation */}
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
                label="Rechercher un site"
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
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.statut}
                  label="Statut"
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="inactif">Inactif</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Actualiser">
                <IconButton 
                  onClick={fetchSites}
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

        {/* Tableau avec animations */}
        <Fade in={true} timeout={1000}>
          <Paper 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Caméras</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Capteurs</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Événements</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : sites.map((site, index) => (
                    <Slide 
                      key={site.id} 
                      direction="up" 
                      in={true} 
                      timeout={500 + (index * 100)}
                      mountOnEnter
                      unmountOnExit
                    >
                      <TableRow 
                        sx={{ 
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease',
                          },
                          animation: `${fadeIn} 0.5s ease-out`,
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/sites/${site.id}`)}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon color="primary" fontSize="small" />
                            <Typography fontWeight="medium">{site.nom}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            {site.contact_principal}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <EmailIcon fontSize="small" color="action" />
                            {site.email}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={site.statut}
                            color={getStatusColor(site.statut)}
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={site.nb_cameras} 
                            variant="outlined" 
                            size="small" 
                            color="info"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={site.nb_capteurs} 
                            variant="outlined" 
                            size="small" 
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={site.nb_evenements} 
                            variant="outlined" 
                            size="small" 
                            color="warning"
                          />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Voir les détails">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/sites/${site.id}`)}
                                sx={{
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'primary.main' }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {userRole === 'admin' && (
                              <>
                                <Tooltip title="Modifier">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/sites/${site.id}/edit`)}
                                    sx={{
                                      bgcolor: 'secondary.light',
                                      color: 'white',
                                      '&:hover': { bgcolor: 'secondary.main' }
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(site.id)}
                                    sx={{
                                      bgcolor: 'error.light',
                                      color: 'white',
                                      '&:hover': { bgcolor: 'error.main' }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Slide>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* États vides et erreurs */}
            {error && (
              <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && sites.length === 0 && (
              <Box sx={{ p: 8, textAlign: 'center' }}>
                <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun site trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {filters.search || filters.statut 
                    ? 'Aucun site ne correspond à vos critères de recherche.' 
                    : 'Commencez par ajouter votre premier site client.'}
                </Typography>
                {userRole === 'admin' && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/sites/new')}
                  >
                    Créer un site
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

export default SitesList;