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

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    site: '',
    periode: '',
  });
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.site) params.append('site', filters.site);
      if (filters.periode) params.append('periode', filters.periode);

      const response = await axios.get(`http://localhost:8000/api/rapports/?${params}`);
      const data = response.data.results || response.data;
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/rapports/${id}/`);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Rapports de Surveillance</Typography>
        {userRole === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/reports/new')}
          >
            Nouveau Rapport
          </Button>
        )}
      </Box>

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
          <TextField
            label="Période"
            variant="outlined"
            size="small"
            value={filters.periode}
            onChange={(e) => handleFilterChange('periode', e.target.value)}
            placeholder="ex: 2024-01"
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Période</TableCell>
              <TableCell>Auteur</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.titre}</TableCell>
                <TableCell>{report.site_nom}</TableCell>
                <TableCell>{report.periode}</TableCell>
                <TableCell>{report.auteur_nom}</TableCell>
                <TableCell>{new Date(report.date_creation).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {userRole === 'admin' && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/reports/${report.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(report.id)}
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

      {reports.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucun rapport trouvé
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ReportsList;