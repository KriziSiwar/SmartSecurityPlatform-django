import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, message, Spin, Alert, Typography } from 'antd';
import { CameraOutlined, StopOutlined } from '@ant-design/icons';
import api from '../../utils/axiosConfig';

const CameraAnomalyDetection = ({ cameraId, cameraName, streamUrl }) => {
  // États
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState([]);
  const [abandonedObjects, setAbandonedObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Références
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  // Fonction pour arrêter une piste individuelle
  const stopTrack = useCallback((track) => {
    return new Promise((resolve) => {
      if (!track || track.readyState === 'ended') {
        console.log(`La piste est déjà arrêtée ou n'existe pas`);
        return resolve();
      }

      console.log(`Arrêt de la piste: ${track.kind} (${track.label || 'sans nom'})`);
      
      const onTrackEnded = () => {
        console.log(`Piste ${track.kind} arrêtée avec succès`);
        track.removeEventListener('ended', onTrackEnded);
        resolve();
      };
      
      track.addEventListener('ended', onTrackEnded);
      
      try {
        track.stop();
        
        // Timeout de sécurité
        const timeoutId = setTimeout(() => {
          console.warn(`La piste ${track.kind} n'a pas signalé la fin correctement`);
          track.removeEventListener('ended', onTrackEnded);
          resolve();
        }, 1500);
        
        return () => clearTimeout(timeoutId);
        
      } catch (err) {
        console.warn('Erreur lors de l\'arrêt de la piste:', err);
        track.removeEventListener('ended', onTrackEnded);
        resolve();
      }
    });
  }, []);

  // Fonction pour arrêter la détection
  const stopDetection = useCallback(() => {
    console.log('Arrêt de la détection...');
    setIsDetecting(false);
    setIsLoading(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    
    setDetections([]);
    setAbandonedObjects([]);
    
    console.log('Détection arrêtée avec succès');
  }, []);

  // Nettoyage des ressources
  useEffect(() => {
    return () => {
      console.log('Nettoyage des ressources...');
      stopDetection();
    };
  }, [stopDetection]);

  // Fonction pour démarrer la détection
  const startDetection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifications préalables
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra. Essayez avec Chrome, Firefox ou Edge.');
      }

      // Vérifier que nous sommes en HTTPS ou localhost
      const isSecureOrigin = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
      
      if (!isSecureOrigin) {
        throw new Error('La caméra nécessite une connexion sécurisée (HTTPS) ou un environnement local (localhost)');
      }

      // Vérifier la disponibilité des caméras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('Aucune caméra détectée sur cet appareil');
      }

      console.log(`[DEBUG] ${videoDevices.length} caméra(s) détectée(s):`, videoDevices);
      
      // Configuration de la caméra
      const constraints = {
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: 'environment'
        },
        audio: false
      };

      // Obtenir le flux vidéo
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!stream) {
        throw new Error('Impossible d\'accéder à la caméra');
      }

      // Mettre à jour la référence du stream
      streamRef.current = stream;
      
      // Configurer la vidéo
      const video = videoRef.current;
      if (!video) {
        throw new Error('Élément vidéo non trouvé');
      }

      video.srcObject = stream;
      
      // Attendre que la vidéo soit prête
      await new Promise((resolve, reject) => {
        const onLoaded = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (err) => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', onError);
          reject(new Error('Erreur lors du chargement du flux vidéo'));
        };
        
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);
        
        // Démarrer la lecture
        video.play().catch(err => {
          console.error('Erreur lors du démarrage de la lecture:', err);
          reject(err);
        });
      });
      
      // Démarrer la détection
      setIsDetecting(true);
      
    } catch (err) {
      console.error('Erreur lors du démarrage de la détection:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'accès à la caméra');
      stopDetection();
    } finally {
      setIsLoading(false);
    }
  }, [stopDetection]);

  // Effet pour le traitement vidéo
  useEffect(() => {
    if (!isDetecting || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Ajuster la taille du canvas à la vidéo
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    let animationId;
    
    // Variables pour la détection de mouvement
    let lastFrame = null;
    const threshold = 30; // Seuil de détection (0-255)
    const minArea = 1000; // Aire minimale pour considérer un mouvement
    
    const processFrame = () => {
      if (!isDetecting) return;
      
      try {
        // Dessiner la vidéo sur le canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Obtenir les données d'image actuelles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        if (lastFrame) {
          // Calculer la différence avec l'image précédente
          let diffPixels = 0;
          let minX = canvas.width;
          let minY = canvas.height;
          let maxX = 0;
          let maxY = 0;
          
          // Comparer chaque pixel avec l'image précédente
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Convertir en niveau de gris
            const gray = 0.3 * r + 0.59 * g + 0.11 * b;
            
            // Calculer la différence avec le frame précédent
            const lastGray = lastFrame[i / 4];
            const diff = Math.abs(gray - lastGray);
            
            if (diff > threshold) {
              diffPixels++;
              
              // Mettre à jour les coordonnées du rectangle de détection
              const x = (i / 4) % canvas.width;
              const y = Math.floor((i / 4) / canvas.width);
              
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
              
              // Mettre en évidence les pixels en mouvement
              data[i] = 255;     // R
              data[i + 1] = 0;   // G
              data[i + 2] = 0;   // B
            }
          }
          
          // Mettre à jour les détections si un mouvement significatif est détecté
          const area = (maxX - minX) * (maxY - minY);
          if (area > minArea) {
            setDetections([{x: minX, y: minY, width: maxX - minX, height: maxY - minY}]);
            
            // Dessiner un rectangle autour de la zone de mouvement
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
            
            // Afficher le pourcentage de pixels en mouvement
            const motionPercent = (diffPixels / (canvas.width * canvas.height)) * 100;
            ctx.fillStyle = '#FF0000';
            ctx.font = '16px Arial';
            ctx.fillText(`Mouvement détecté: ${motionPercent.toFixed(2)}%`, 10, 20);
          } else {
            setDetections([]);
          }
          
          // Mettre à jour l'affichage
          ctx.putImageData(imageData, 0, 0);
        } else {
          // Stocker le premier frame pour comparaison
          lastFrame = new Uint8Array(canvas.width * canvas.height);
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            lastFrame[i/4] = 0.3 * r + 0.59 * g + 0.11 * b;
          }
        }
        
        // Planifier la prochaine frame
        animationId = requestAnimationFrame(processFrame);
      } catch (err) {
        console.error('Erreur lors du traitement vidéo:', err);
        setError('Erreur lors du traitement vidéo');
        stopDetection();
      }
    };
    
    // Démarrer le traitement
    animationId = requestAnimationFrame(processFrame);
    
    // Nettoyage
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isDetecting, stopDetection]);

  return (
    <div className="camera-anomaly-detection">
      <h2>Détection d'anomalies - {cameraName || 'Caméra'}</h2>
      
      {error && (
        <Alert 
          message="Erreur" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div className="video-container" style={{ position: 'relative', marginBottom: 16 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            display: isDetecting ? 'block' : 'none',
            width: '100%',
            maxWidth: '800px',
            backgroundColor: '#000'
          }}
        />
        
        <canvas
          ref={canvasRef}
          style={{
            display: isDetecting ? 'block' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            maxWidth: '800px'
          }}
        />
        
        {!isDetecting && (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            height: '450px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #ccc'
          }}>
            <span>Prévisualisation de la caméra</span>
          </div>
        )}
      </div>
      
      <div className="controls" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<CameraOutlined />}
          onClick={startDetection}
          loading={isLoading}
          disabled={isDetecting}
          style={{ marginRight: 8 }}
        >
          Démarrer la détection
        </Button>
        
        <Button
          danger
          icon={<StopOutlined />}
          onClick={stopDetection}
          disabled={!isDetecting}
        >
          Arrêter
        </Button>
      </div>
      
      <div className="detection-info">
        <p>Détections actives: {detections.length}</p>
        <p>Objets abandonnés: {abandonedObjects.length}</p>
      </div>
    </div>
  );
};

export default CameraAnomalyDetection;
