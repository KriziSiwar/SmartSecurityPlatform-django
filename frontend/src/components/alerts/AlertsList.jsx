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
import axios from 'axios';

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    niveau: '',
    statut: '',
    destinataire: '',
  });
  const navigate = useNavigate();
  const { userRole, userId } = useAuth();

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.niveau) params.append('niveau', filters.niveau);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.destinataire) params.append('destinataire', filters.destinataire);

      const response = await axios.get(`http://localhost:8000/api/alertes/?${params}`);
      const data = response.data.results || response.data;
      const alertsArray = Array.isArray(data) ? data : [];
      setAlerts(alertsArray);

      // Calculate stats
      const total = alertsArray.length;
      const critiques = alertsArray.filter(a => a.niveau === 'critique').length;
      const nonLues = alertsArray.filter(a => a.statut === 'envoyee').length;
      const archivees = alertsArray.filter(a => a.statut === 'archivee').length;

      setStats({ total, critiques, nonLues, archivees });
    } catch (error) {
      console.error('Error fetching alerts:', error);
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
        await axios.delete(`http://localhost:8000/api/alertes/${id}/`);
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };

  const handleMarquerLue = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/alertes/${id}/marquer_lue/`);
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleArchiver = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/alertes/${id}/archiver/`);
      fetchAlerts();
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

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Alertes</Typography>
        {(userRole === 'admin' || userRole === 'client') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/alerts/new')}
          >
            Nouvelle Alerte
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
              <Typography variant="h4" color="error">{stats.critiques}</Typography>
              <Typography variant="body2" color="text.secondary">Critiques</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning">{stats.nonLues}</Typography>
              <Typography variant="body2" color="text.secondary">Non lues</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="text.secondary">{stats.archivees}</Typography>
              <Typography variant="body2" color="text.secondary">Archivées</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Niveau</InputLabel>
            <Select
              value={filters.niveau}
              label="Niveau"
              onChange={(e) => handleFilterChange('niveau', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="critique">Critique</MenuItem>
              <MenuItem value="eleve">Élevé</MenuItem>
              <MenuItem value="moyen">Moyen</MenuItem>
              <MenuItem value="faible">Faible</MenuItem>
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
              <MenuItem value="envoyee">Envoyée</MenuItem>
              <MenuItem value="lue">Lue</MenuItem>
              <MenuItem value="archivee">Archivée</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Événement</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Destinataire</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{alert.evenement_description}</TableCell>
                <TableCell>
                  <Chip
                    label={alert.niveau}
                    color={getNiveauColor(alert.niveau)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={alert.statut}
                    color={getStatutColor(alert.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{alert.destinataire_nom}</TableCell>
                <TableCell>{alert.site_nom}</TableCell>
                <TableCell>{new Date(alert.date_envoi).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/alerts/${alert.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {(userRole === 'admin' || (userRole === 'client' && alert.destinataire === userId)) && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/alerts/${alert.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      {alert.statut === 'envoyee' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMarquerLue(alert.id)}
                          sx={{ ml: 1 }}
                        >
                          Marquer lue
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleArchiver(alert.id)}
                        sx={{ ml: 1 }}
                      >
                        Archiver
                      </Button>
                      {userRole === 'admin' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(alert.id)}
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

      {alerts.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune alerte trouvée
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AlertsList;