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

const MaintenancesList = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [predictions, setPredictions] = useState([]); // 🧠 nouvel état IA
  const [filters, setFilters] = useState({
    site: '',
    statut: '',
    date_debut: '',
    date_fin: '',
  });
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchMaintenances();
  }, [filters]);

  const fetchMaintenances = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.site) params.append('site', filters.site);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);

      const response = await axios.get(`http://localhost:8000/api/maintenances/?${params}`);
      const data = response.data.results || response.data;
      const maintenancesArray = Array.isArray(data) ? data : [];
      setMaintenances(maintenancesArray);

      const total = maintenancesArray.length;
      const planifiees = maintenancesArray.filter(m => m.statut === 'planifiee').length;
      const enCours = maintenancesArray.filter(m => m.statut === 'en_cours').length;
      const realisees = maintenancesArray.filter(m => m.statut === 'realisee').length;

      setStats({ total, planifiees, enCours, realisees });
    } catch (error) {
      console.error('Error fetching maintenances:', error);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/maintenances/${id}/`);
        fetchMaintenances();
      } catch (error) {
        console.error('Error deleting maintenance:', error);
      }
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'planifiee':
        return 'info';
      case 'en_cours':
        return 'warning';
      case 'realisee':
        return 'success';
      case 'annulee':
        return 'error';
      default:
        return 'default';
    }
  };

  // 🧠 Nouvelle fonction IA : prédire la prochaine maintenance pour CHAQUE équipement
  const handlePredictAI = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/predict-all-maintenance/");

      const predictionsData = res.data;

      if (Array.isArray(predictionsData) && predictionsData.length > 0) {
        setPredictions(predictionsData);
      } else {
        setPredictions([]);
        alert("Aucune donnée de prédiction disponible.");
      }
    } catch (error) {
      console.error("Erreur IA :", error);
      alert("❌ Erreur IA : vérifie que ton serveur Django est bien lancé et la route existe.");
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Maintenances</Typography>
        {(userRole === 'admin' || userRole === 'technicien') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/maintenances/new')}
          >
            Nouvelle Maintenance
          </Button>
        )}
      </Box>

      {/* 🧠 Bouton IA : prédire prochaines maintenances */}
      {(userRole === 'admin' || userRole === 'technicien') && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handlePredictAI}
          >
            🧠 Prédire prochaines maintenances
          </Button>
        </Box>
      )}

      {/* Statistiques */}
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
              <Typography variant="h4" color="info">{stats.planifiees}</Typography>
              <Typography variant="body2" color="text.secondary">Planifiées</Typography>
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
              <Typography variant="h4" color="success">{stats.realisees}</Typography>
              <Typography variant="body2" color="text.secondary">Réalisées</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
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
              <MenuItem value="planifiee">Planifiée</MenuItem>
              <MenuItem value="en_cours">En cours</MenuItem>
              <MenuItem value="realisee">Réalisée</MenuItem>
              <MenuItem value="annulee">Annulée</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Date début"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.date_debut}
            onChange={(e) => handleFilterChange('date_debut', e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Date fin"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.date_fin}
            onChange={(e) => handleFilterChange('date_fin', e.target.value)}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Paper>

      {/* Tableau principal */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date prévue</TableCell>
              <TableCell>Technicien</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenances.map((maintenance) => (
              <TableRow key={maintenance.id}>
                <TableCell>{maintenance.type_maintenance}</TableCell>
                <TableCell>{maintenance.description}</TableCell>
                <TableCell>{maintenance.site_nom}</TableCell>
                <TableCell>
                  <Chip
                    label={maintenance.statut}
                    color={getStatusColor(maintenance.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(maintenance.date_prevue).toLocaleDateString()}</TableCell>
                <TableCell>{maintenance.technicien_nom || 'Non assigné'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/maintenances/${maintenance.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {(userRole === 'admin' || userRole === 'technicien') && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/maintenances/${maintenance.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      {userRole === 'admin' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(maintenance.id)}
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

      {/* 🧠 Tableau des prédictions IA */}
      {predictions.length > 0 && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" mb={2}>
            🧠 Prédictions IA – Prochaines maintenances
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Équipement</TableCell>
                  <TableCell>Site</TableCell>
                  <TableCell>Jours restants</TableCell>
                  <TableCell>Date recommandée</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {predictions.map((p, index) => (
                  <TableRow key={index}>
                    <TableCell>{p.equipement}</TableCell>
                    <TableCell>{p.site}</TableCell>
                    <TableCell>{p.predicted_days}</TableCell>
                    <TableCell>{p.recommended_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {maintenances.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune maintenance trouvée
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default MaintenancesList;
