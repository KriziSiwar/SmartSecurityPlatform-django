import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Videocam as VideocamIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Build as BuildIcon,
  Sensors as SensorsIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import api from '../../utils/axiosConfig';
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  const statCards = [
    {
      title: 'Sites Clients',
      value: stats?.total_sites || 0,
      active: stats?.active_sites || 0,
      icon: <BusinessIcon />,
      color: '#03A9F4', // Blue for sites
      textColor: '#03A9F4',
    },
    {
      title: 'Caméras',
      value: stats?.total_cameras || 0,
      active: stats?.active_cameras || 0,
      icon: <VideocamIcon />,
      color: '#10B981', // Green for active cameras
      textColor: '#10B981',
    },
    {
      title: 'Capteurs',
      value: stats?.total_capteurs || 0,
      icon: <SensorsIcon />,
      color: '#7C3AED', // Purple for sensors
      textColor: '#7C3AED',
    },
    {
      title: 'Événements',
      value: stats?.total_evenements || 0,
      active: stats?.active_events || 0,
      icon: <EventIcon />,
      color: '#7C3AED', // Purple for events
      textColor: '#7C3AED',
    },
    {
      title: 'Alertes',
      value: stats?.total_alertes || 0,
      critical: stats?.alertes_critiques || 0,
      icon: <WarningIcon />,
      color: '#EF4444', // Red for alerts
      textColor: '#EF4444',
    },
    {
      title: 'Maintenances',
      value: stats?.total_maintenances || 0,
      planned: stats?.maintenances_planifiees || 0,
      icon: <BuildIcon />,
      color: '#F59E0B', // Amber for maintenances
      textColor: '#F59E0B',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1E3A8A' }}>
          🏢 Tableau de Bord Administrateur
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
          Vue d'ensemble complète du système de sécurité
        </Typography>
      </Box>

      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/admin-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.15,
        zIndex: -1,
        pointerEvents: 'none',
      }} />

      <Grid container spacing={4}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{
                    bgcolor: card.color,
                    mr: 2,
                    width: 56,
                    height: 56,
                    boxShadow: `0 4px 12px ${card.color}30`
                  }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" component="div" sx={{
                  color: card.textColor,
                  fontWeight: 700,
                  mb: 1
                }}>
                  {card.value}
                </Typography>
                {card.active !== undefined && (
                  <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>
                    ✓ Actif: {card.active}
                  </Typography>
                )}
                {card.critical !== undefined && (
                  <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 500 }}>
                    ⚠ Critiques: {card.critical}
                  </Typography>
                )}
                {card.planned !== undefined && (
                  <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 500 }}>
                    ⏰ Planifiées: {card.planned}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité Système
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Performance du système"
                  secondary="Tous les services opérationnels"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Utilisateurs actifs"
                  secondary={`${stats?.active_users || 0} utilisateurs connectés`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alertes Critiques
            </Typography>
            <Typography variant="h4" color="error">
              {stats?.alertes_critiques || 0}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="Critique" color="error" size="small" />
              <Chip label="Élevé" color="warning" size="small" sx={{ ml: 1 }} />
              <Chip label="Moyen" color="info" size="small" sx={{ ml: 1 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;