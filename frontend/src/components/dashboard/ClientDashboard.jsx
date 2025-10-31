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
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import api from '../../utils/axiosConfig';
const ClientDashboard = () => {
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
      title: 'Mes Sites',
      value: stats?.client_sites || 0,
      icon: <BusinessIcon />,
      color: '#03A9F4', // Blue for sites
      textColor: '#03A9F4',
    },
    {
      title: 'Alertes Actives',
      value: stats?.client_alerts || 0,
      icon: <WarningIcon />,
      color: '#EF4444', // Red for alerts
      textColor: '#EF4444',
    },
    {
      title: 'Événements Récents',
      value: stats?.client_events || 0,
      icon: <EventIcon />,
      color: '#7C3AED', // Purple for events
      textColor: '#7C3AED',
    },
    {
      title: 'Rapports Disponibles',
      value: stats?.client_reports || 0,
      icon: <AssessmentIcon />,
      color: '#10B981', // Green for reports
      textColor: '#10B981',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1E3A8A' }}>
          🏠 Mon Espace Client
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
          Surveillance et gestion de vos sites sécurisés
        </Typography>
      </Box>

      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/client-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.15,
        zIndex: -1,
        pointerEvents: 'none',
      }} />

      {/* Alert for critical notifications */}
      {stats?.client_alerts > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vous avez {stats.client_alerts} alerte(s) active(s) nécessitant votre attention.
        </Alert>
      )}

      <Grid container spacing={4}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              État de Sécurité
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body1">
                Système de sécurité opérationnel
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Dernière vérification: {new Date().toLocaleString()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="Sécurisé" color="success" size="small" />
              <Chip label="Surveillance active" color="info" size="small" sx={{ ml: 1 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notifications Récentes
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Rapport mensuel disponible"
                  secondary="Généré le 25/10/2025"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Maintenance programmée"
                  secondary="Caméra secteur A - 30/10/2025"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboard;