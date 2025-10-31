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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import api from '../../utils/axiosConfig';
const CamerasList = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    site: '',
    etat: '',
    type: '',
  });
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchCameras();
  }, [filters]);

  const fetchCameras = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.site) params.append('site', filters.site);
      if (filters.etat) params.append('etat', filters.etat);
      if (filters.type) params.append('type', filters.type);

      const response = await api.get(`/api/cameras/?${params}`);
      const data = response.data.results || response.data;
      const camerasArray = Array.isArray(data) ? data : [];
      setCameras(camerasArray);

      // Calculate stats
      const total = camerasArray.length;
      const enLigne = camerasArray.filter(c => c.etat === 'en_ligne').length;
      const horsLigne = camerasArray.filter(c => c.etat === 'hors_ligne').length;
      const maintenance = camerasArray.filter(c => c.etat === 'maintenance').length;

      setStats({ total, enLigne, horsLigne, maintenance });
    } catch (error) {
      console.error('Error fetching cameras:', error);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette caméra ?')) {
      try {
        await api.delete(`/api/cameras/${id}/`);
        fetchCameras();
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

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Caméras de Surveillance</Typography>
        {userRole === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cameras/new')}
          >
            Nouvelle Caméra
          </Button>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success">{stats.enLigne}</Typography>
              <Typography variant="body2" color="text.secondary">En ligne</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error">{stats.horsLigne}</Typography>
              <Typography variant="body2" color="text.secondary">Hors ligne</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning">{stats.maintenance}</Typography>
              <Typography variant="body2" color="text.secondary">Maintenance</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Site</InputLabel>
            <Select
              value={filters.site}
              label="Site"
              onChange={(e) => handleFilterChange('site', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {/* Add site options dynamically */}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>État</InputLabel>
            <Select
              value={filters.etat}
              label="État"
              onChange={(e) => handleFilterChange('etat', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="en_ligne">En ligne</MenuItem>
              <MenuItem value="hors_ligne">Hors ligne</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="dome">Dôme</MenuItem>
              <MenuItem value="bullet">Bullet</MenuItem>
              <MenuItem value="ptz">PTZ</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Événements</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cameras.map((camera) => (
              <TableRow key={camera.id}>
                <TableCell>{camera.nom}</TableCell>
                <TableCell>{camera.site_nom}</TableCell>
                <TableCell>{camera.type}</TableCell>
                <TableCell>
                  <Chip
                    label={camera.etat}
                    color={getStatusColor(camera.etat)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{camera.nb_evenements}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/cameras/${camera.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {(userRole === 'admin' || userRole === 'technicien') && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/cameras/${camera.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      {userRole === 'admin' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(camera.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {cameras.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune caméra trouvée
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CamerasList;