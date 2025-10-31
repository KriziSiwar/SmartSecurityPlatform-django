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
const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    site: '',
    type_evenement: '',
    niveau_urgence: '',
    statut: '',
  });
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.site) params.append('site', filters.site);
      if (filters.type_evenement) params.append('type_evenement', filters.type_evenement);
      if (filters.niveau_urgence) params.append('niveau_urgence', filters.niveau_urgence);
      if (filters.statut) params.append('statut', filters.statut);

      const response = await api.get(`/api/evenements/?${params}`);
      const data = response.data.results || response.data;
      const eventsArray = Array.isArray(data) ? data : [];
      setEvents(eventsArray);

      // Calculate stats
      const total = eventsArray.length;
      const enCours = eventsArray.filter(e => e.statut === 'en_cours').length;
      const resolus = eventsArray.filter(e => e.statut === 'resolu').length;
      const critiques = eventsArray.filter(e => e.niveau_urgence === 'critique').length;

      setStats({ total, enCours, resolus, critiques });
    } catch (error) {
      console.error('Error fetching events:', error);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await api.delete(`/api/evenements/${id}/`);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleResoudre = async (id) => {
    try {
      await api.post(`/api/evenements/${id}/resoudre/`);
      fetchEvents();
    } catch (error) {
      console.error('Error resolving event:', error);
    }
  };

  const getUrgencyColor = (niveau) => {
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

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_cours':
        return 'warning';
      case 'resolu':
        return 'success';
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
        <Typography variant="h4">Événements</Typography>
        {(userRole === 'admin' || userRole === 'client') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/new')}
          >
            Nouvel Événement
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
              <Typography variant="h4" color="warning">{stats.enCours}</Typography>
              <Typography variant="body2" color="text.secondary">En cours</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success">{stats.resolus}</Typography>
              <Typography variant="body2" color="text.secondary">Résolus</Typography>
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
              value={filters.type_evenement}
              label="Type"
              onChange={(e) => handleFilterChange('type_evenement', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="intrusion">Intrusion</MenuItem>
              <MenuItem value="panne">Panne</MenuItem>
              <MenuItem value="anomalie">Anomalie</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Niveau d'urgence</InputLabel>
            <Select
              value={filters.niveau_urgence}
              label="Niveau d'urgence"
              onChange={(e) => handleFilterChange('niveau_urgence', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="critique">Critique</MenuItem>
              <MenuItem value="eleve">Élevé</MenuItem>
              <MenuItem value="moyen">Moyen</MenuItem>
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
              <MenuItem value="en_cours">En cours</MenuItem>
              <MenuItem value="resolu">Résolu</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.type_evenement}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.site_nom}</TableCell>
                <TableCell>
                  <Chip
                    label={event.niveau_urgence}
                    color={getUrgencyColor(event.niveau_urgence)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.statut}
                    color={getStatusColor(event.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(event.date_heure).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {(userRole === 'admin' || userRole === 'client') && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/events/${event.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      {event.statut === 'en_cours' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleResoudre(event.id)}
                          sx={{ ml: 1 }}
                        >
                          Résoudre
                        </Button>
                      )}
                      {userRole === 'admin' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(event.id)}
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

      {events.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucun événement trouvé
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default EventsList;