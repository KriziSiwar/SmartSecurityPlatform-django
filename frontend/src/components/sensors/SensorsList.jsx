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
const SensorsList = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    site: '',
    type: '',
    statut: '',
  });
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchSensors();
  }, [filters]);

  const fetchSensors = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.site) params.append('site', filters.site);
      if (filters.type) params.append('type', filters.type);
      if (filters.statut) params.append('statut', filters.statut);

      const response = await api.get(`/api/capteurs/?${params}`);
      const data = response.data.results || response.data;
      const sensorsArray = Array.isArray(data) ? data : [];
      setSensors(sensorsArray);

      // Calculate stats
      const total = sensorsArray.length;
      const actifs = sensorsArray.filter(s => s.statut === 'actif').length;
      const inactifs = sensorsArray.filter(s => s.statut === 'inactif').length;
      const defectueux = sensorsArray.filter(s => s.statut === 'defectueux').length;

      setStats({ total, actifs, inactifs, defectueux });
    } catch (error) {
      console.error('Error fetching sensors:', error);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce capteur ?')) {
      try {
        await api.delete(`/api/capteurs/${id}/`);
        fetchSensors();
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

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Capteurs</Typography>
        {userRole === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sensors/new')}
          >
            Nouveau Capteur
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
              <Typography variant="h4" color="success">{stats.actifs}</Typography>
              <Typography variant="body2" color="text.secondary">Actifs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning">{stats.inactifs}</Typography>
              <Typography variant="body2" color="text.secondary">Inactifs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error">{stats.defectueux}</Typography>
              <Typography variant="body2" color="text.secondary">Défectueux</Typography>
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
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="mouvement">Mouvement</MenuItem>
              <MenuItem value="temperature">Température</MenuItem>
              <MenuItem value="humidite">Humidité</MenuItem>
              <MenuItem value="luminosite">Luminosité</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.statut}
              label="Statut"
              onChange={(e) => handleFilterChange('statut', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="inactif">Inactif</MenuItem>
              <MenuItem value="defectueux">Défectueux</MenuItem>
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
              <TableCell>Statut</TableCell>
              <TableCell>Valeur</TableCell>
              <TableCell>Événements</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sensors.map((sensor) => (
              <TableRow key={sensor.id}>
                <TableCell>{sensor.nom}</TableCell>
                <TableCell>{sensor.site_nom}</TableCell>
                <TableCell>{sensor.type}</TableCell>
                <TableCell>
                  <Chip
                    label={sensor.statut}
                    color={getStatusColor(sensor.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{sensor.valeur_actuelle} {sensor.unite}</TableCell>
                <TableCell>{sensor.nb_evenements}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/sensors/${sensor.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {(userRole === 'admin' || userRole === 'technicien') && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/sensors/${sensor.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      {userRole === 'admin' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(sensor.id)}
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

      {sensors.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucun capteur trouvé
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default SensorsList;