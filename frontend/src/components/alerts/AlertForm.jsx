import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../../utils/axiosConfig';
const AlertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    evenement: '',
    destinataire: '',
    niveau: 'info',
    message: '',
  });
  const [evenements, setEvenements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // État pour la classification IA
  const [aiPrediction, setAiPrediction] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  useEffect(() => {
    fetchData();
    if (isEditing) {
      fetchAlert();
    }
  }, [id, isEditing]);

  // Classification IA automatique quand le message change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.message && formData.message.length > 10 && !isEditing) {
        classifyMessage();
      }
    }, 1000); // Délai de 1 seconde après l'arrêt de la frappe

    return () => clearTimeout(timer);
  }, [formData.message]);

  const fetchData = async () => {
    try {
      const evenementsResponse = await api.get('/api/evenements/');
      const usersResponse = await api.get('/api/auth/users/');

      setEvenements(evenementsResponse.data.results || evenementsResponse.data);
      setUsers(usersResponse.data.results || usersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAlert = async () => {
    try {
      const response = await api.get(`/api/alertes/${id}/`);
      setFormData({
        evenement: response.data.evenement,
        destinataire: response.data.destinataire,
        niveau: response.data.niveau,
        message: response.data.message,
      });
    } catch (error) {
      console.error('Error fetching alert:', error);
      setError('Erreur lors du chargement de l\'alerte');
    }
  };

  const classifyMessage = async () => {
    setClassifying(true);
    setAiPrediction(null);
    
    try {
      const response = await axios.post('/api/alertes/classify/', {
        message: formData.message
      });
      
      if (response.data.success) {
        setAiPrediction(response.data.prediction);
        setShowAiSuggestion(true);
      }
    } catch (error) {
      console.error('Error classifying message:', error);
      // Ne pas afficher d'erreur si la classification échoue
    } finally {
      setClassifying(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiPrediction) {
      // Mapper la priorité IA au niveau d'alerte Django
      const priorityMapping = {
        'critique': 'critique',
        'urgent': 'critique',
        'normal': 'moyen',
        'faible': 'info'
      };
      
      setFormData(prev => ({
        ...prev,
        niveau: priorityMapping[aiPrediction.priority] || prev.niveau
      }));
      
      setSuccess('✨ Suggestion IA appliquée avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await axios.put(`/api/alertes/${id}/`, formData);
        setSuccess('Alerte modifiée avec succès');
      } else {
        const response = await axios.post('/api/alertes/', formData);
        setSuccess('Alerte créée avec succès');
        setTimeout(() => {
          navigate(`/alerts/${response.data.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      if (error.response?.data) {
        const errors = Object.values(error.response.data).flat();
        setError(errors.join(', '));
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critique':
        return 'error';
      case 'urgent':
        return 'warning';
      case 'normal':
        return 'info';
      case 'faible':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'intrusion':
        return 'error';
      case 'incendie':
        return 'warning';
      case 'technique':
        return 'info';
      case 'fausse_alerte':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/alerts')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Modifier l\'Alerte' : 'Nouvelle Alerte'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Formulaire principal */}
        <Grid item xs={12} md={aiPrediction && showAiSuggestion ? 7 : 12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Événement</InputLabel>
                    <Select
                      name="evenement"
                      value={formData.evenement}
                      label="Événement"
                      onChange={handleChange}
                    >
                      {evenements.map((evenement) => (
                        <MenuItem key={evenement.id} value={evenement.id}>
                          {evenement.description} - {evenement.site_nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Destinataire</InputLabel>
                    <Select
                      name="destinataire"
                      value={formData.destinataire}
                      label="Destinataire"
                      onChange={handleChange}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.username} - {user.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Niveau</InputLabel>
                    <Select
                      name="niveau"
                      value={formData.niveau}
                      label="Niveau"
                      onChange={handleChange}
                    >
                      <MenuItem value="critique">Critique</MenuItem>
                      <MenuItem value="moyen">Moyen</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    id="message"
                    name="message"
                    label="Message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Entrez le message de l'alerte..."
                    helperText={
                      classifying 
                        ? "🤖 Classification IA en cours..." 
                        : !isEditing 
                        ? "L'IA analysera automatiquement votre message après 1 seconde"
                        : ""
                    }
                    InputProps={{
                      endAdornment: classifying && <CircularProgress size={20} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/alerts')}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Panneau IA - Suggestions et Analyse */}
        {aiPrediction && showAiSuggestion && (
          <Grid item xs={12} md={5}>
            <Card 
              elevation={3} 
              sx={{ 
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'sticky',
                top: 20
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PsychologyIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                  <Typography variant="h6" color="primary">
                    🤖 Analyse IA
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Catégorie détectée */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Catégorie détectée
                  </Typography>
                  <Chip
                    icon={<WarningIcon />}
                    label={aiPrediction.category_label}
                    color={getCategoryColor(aiPrediction.category)}
                    size="medium"
                    sx={{ fontSize: '1rem', py: 2 }}
                  />
                </Box>

                {/* Priorité recommandée */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Priorité recommandée
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={aiPrediction.priority_label}
                    color={getPriorityColor(aiPrediction.priority)}
                    size="medium"
                    sx={{ fontSize: '1rem', py: 2 }}
                  />
                </Box>

                {/* Niveau de confiance */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Confiance de l'IA
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: 'grey.200', 
                        borderRadius: 1,
                        mr: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: `${aiPrediction.confidence * 100}%`,
                          height: '100%',
                          bgcolor: aiPrediction.confidence > 0.7 ? 'success.main' : 'warning.main',
                          borderRadius: 1,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {(aiPrediction.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>

                {/* Explication */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Explication
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {aiPrediction.explanation}
                  </Typography>
                </Box>

                {/* Actions recommandées */}
                {aiPrediction.recommended_actions && aiPrediction.recommended_actions.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Actions recommandées
                    </Typography>
                    <List dense>
                      {aiPrediction.recommended_actions.map((action, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={`${index + 1}. ${action}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Bouton pour appliquer les suggestions */}
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={applyAiSuggestion}
                    startIcon={<CheckCircleIcon />}
                  >
                    Appliquer la suggestion IA
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowAiSuggestion(false)}
                    size="small"
                  >
                    Masquer l'analyse
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default AlertForm;