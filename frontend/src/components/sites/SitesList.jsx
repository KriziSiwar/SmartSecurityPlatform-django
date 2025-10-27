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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import axios from 'axios';

const SitesList = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
  });
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchSites();
  }, [filters]);

  const fetchSites = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.statut) params.append('statut', filters.statut);

      const response = await axios.get(`http://localhost:8000/api/sites/?${params}`);
      // Handle paginated response
      const data = response.data.results || response.data;
      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
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

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sites Clients</Typography>
        {userRole === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sites/new')}
          >
            Nouveau Site
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Rechercher"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ minWidth: 200 }}
          />
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
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Caméras</TableCell>
              <TableCell>Capteurs</TableCell>
              <TableCell>Événements</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell>{site.nom}</TableCell>
                <TableCell>{site.contact_principal}</TableCell>
                <TableCell>{site.email}</TableCell>
                <TableCell>
                  <Chip
                    label={site.statut}
                    color={getStatusColor(site.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{site.nb_cameras}</TableCell>
                <TableCell>{site.nb_capteurs}</TableCell>
                <TableCell>{site.nb_evenements}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/sites/${site.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {userRole === 'admin' && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/sites/${site.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(site.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {sites.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucun site trouvé
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default SitesList;