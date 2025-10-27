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
  Button,
} from '@mui/material';
import {
  Build as BuildIcon,
  Videocam as VideocamIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';

const TechnicienDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/stats/');
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
      title: 'Maintenances Assignées',
      value: stats?.technicien_maintenances || 0,
      icon: <BuildIcon />,
      color: '#F59E0B', // Amber for maintenances
      textColor: '#F59E0B',
    },
    {
      title: 'Caméras à Vérifier',
      value: stats?.cameras_maintenance || 0,
      icon: <VideocamIcon />,
      color: '#10B981', // Green for cameras
      textColor: '#10B981',
    },
    {
      title: 'Alertes Techniques',
      value: stats?.technicien_alerts || 0,
      icon: <WarningIcon />,
      color: '#EF4444', // Red for alerts
      textColor: '#EF4444',
    },
    {
      title: 'Événements Actifs',
      value: stats?.active_events || 0,
      icon: <EventIcon />,
      color: '#7C3AED', // Purple for events
      textColor: '#7C3AED',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1E3A8A' }}>
          🔧 Tableau de Bord Technicien
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
          Gestion des équipements et interventions techniques
        </Typography>
      </Box>

      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/technicien-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.15,
        zIndex: -1,
        pointerEvents: 'none',
      }} />

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
              Tâches du Jour
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Maintenance Caméra Secteur A"
                  secondary="Site: Siège Central - Priorité: Élevée"
                />
                <Button size="small" variant="outlined" color="primary">
                  Commencer
                </Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Vérification Capteurs Zone B"
                  secondary="Terminée - 09:30"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              État des Équipements
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Caméras en ligne: <Chip label={`${stats?.active_cameras || 0}/${stats?.total_cameras || 0}`} color="success" size="small" />
              </Typography>
              <Typography variant="body2" gutterBottom>
                Capteurs actifs: <Chip label={`${stats?.active_capteurs || 0}/${stats?.total_capteurs || 0}`} color="info" size="small" />
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Dernière vérification: {new Date().toLocaleTimeString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TechnicienDashboard;