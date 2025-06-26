import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { ProjectDetailResponse, ProjectPathWithDetails } from '../types/project';
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [projectData, setProjectData] = useState<ProjectDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProjectDetails(parseInt(id));
    }
  }, [id]);

  const fetchProjectDetails = async (projectId: number) => {
    try {
      const response = await apiService.getProjectDetails(projectId);
      
      if (response.success && response.data) {
        setProjectData(response.data);
      } else {
        setError(response.error || 'Erreur lors de la récupération du projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération du projet');
    }
    
    setLoading(false);
  };

  const handlePathChoice = async (pathId: number, isChoose: boolean) => {
    setUpdating(`path-${pathId}`);
    
    try {
      const response = await apiService.updatePathChoice(pathId, isChoose);
      
      if (response.success) {
        // Actualiser les données
        if (id) {
          await fetchProjectDetails(parseInt(id));
        }
      } else {
        setError(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour');
    }
    
    setUpdating(null);
  };

  const getJobDisplayName = (job: string): string => {
    const jobMap: { [key: string]: string } = {
      'DEVELOPMENT': 'Développement',
      'DESIGN': 'Design',
      'MARKETING': 'Marketing',
      'HUMAN_RESOURCES': 'Ressources Humaines',
      'SALES': 'Ventes'
    };
    return jobMap[job] || job;
  };

  // Vérifier s'il y a déjà un path choisi
  const hasChosenPath = projectData ? projectData.paths.some(path => path.isChoose) : false;
  const chosenPath = projectData ? projectData.paths.find(path => path.isChoose) : null;

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="loading">Chargement du projet...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-detail-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/projects')} className="back-btn">
          ← Retour aux projets
        </button>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="project-detail-container">
        <div className="error-message">Projet non trouvé</div>
        <button onClick={() => navigate('/projects')} className="back-btn">
          ← Retour aux projets
        </button>
      </div>
    );
  }

  const { project, organization, paths } = projectData;

  return (
    <div className="project-detail-container">
      {/* Header */}
      <div className="project-header">
        <div className="header-content">
          <button onClick={() => navigate('/projects')} className="back-btn">
            ← Retour aux projets
          </button>
          
          <div className="project-title-section">
            <h1>{project.title}</h1>
            <span className="project-id">#{project.id}</span>
          </div>
        </div>
      </div>

      {/* Informations du projet */}
      <div className="project-info-section">
        <div className="info-card">
          <h2>📋 Description du projet</h2>
          <p className="project-description">{project.description}</p>
        </div>

        <div className="info-card">
          <h2>🏢 Organisation</h2>
          <div className="organization-details">
            <div className="detail-row">
              <span className="label">Nom :</span>
              <span className="value">{organization.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Adresse :</span>
              <span className="value">{organization.adresse}</span>
            </div>
            <div className="detail-row">
              <span className="label">Téléphone :</span>
              <span className="value">{organization.tel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paths du projet */}
      <div className="paths-section">
        <h2>🛤️ Parcours de développement ({paths.length} options)</h2>
        
        <div className="paths-grid">
          {paths.map((path) => {
            const isThisPathChosen = path.isChoose;
            const canChooseThisPath = !hasChosenPath || isThisPathChosen;
            
            return (
              <div 
                key={path.id} 
                className={`path-card ${path.isChoose ? 'chosen' : ''} ${!canChooseThisPath ? 'disabled' : ''}`}
              >
                <div className="path-header">
                  <h3>Parcours {path.number}</h3>
                  <div className="path-status">
                    {path.isChoose ? (
                      <span className="status-badge chosen">✅ Choisi</span>
                    ) : (
                      <button 
                        onClick={() => handlePathChoice(path.id, true)}
                        disabled={updating === `path-${path.id}` || !canChooseThisPath}
                        className={`choose-btn ${!canChooseThisPath ? 'disabled' : ''}`}
                        title={!canChooseThisPath ? 'Un autre parcours est déjà choisi' : ''}
                      >
                        {updating === `path-${path.id}` ? 'Sélection...' : 
                         !canChooseThisPath ? 'Indisponible' : 'Choisir ce parcours'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="tasks-list">
                  <h4>📝 Tâches ({path.tasks.length})</h4>
                  
                  <div className="tasks-grid">
                    {path.tasks.map((task, index) => (
                      <div key={`${task.pathId}-${task.prestataireId}`} className="task-item">
                        <div className="task-header">
                          <span className="task-number">#{index + 1}</span>
                          <h5 className="task-name">{task.name}</h5>
                          <span className="task-duration">{task.nbDays} jours</span>
                        </div>

                        <div className="prestataire-info">
                          <div className="prestataire-details">
                            <div className="prestataire-name">
                              👤 {task.prestataire.firstName} {task.prestataire.name}
                            </div>
                            <div className="prestataire-meta">
                              <span className="job">💼 {getJobDisplayName(task.prestataire.job)}</span>
                              <span className="experience">⏱️ {task.prestataire.experienceTime} ans</span>
                              <span className="location">📍 {task.prestataire.city}</span>
                              <span className="tjm">💰 {task.prestataire.tjm}€/jour</span>
                            </div>
                            <div className="prestataire-description">
                              {task.prestataire.description}
                            </div>
                          </div>

                          <div className="task-status">
                            {task.isApproved ? (
                              <div className="approval-status approved">
                                <span className="status-icon">✅</span>
                                <span>Approuvé</span>
                              </div>
                            ) : (
                              <div className="approval-status pending">
                                <span className="status-icon">⏳</span>
                                <span>En attente</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Résumé du path */}
                <div className="path-summary">
                  <div className="summary-item">
                    <span className="label">Durée totale :</span>
                    <span className="value">
                      {path.tasks.reduce((total, task) => total + task.nbDays, 0)} jours
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Coût estimé :</span>
                    <span className="value">
                      {path.tasks.reduce((total, task) => 
                        total + (task.nbDays * parseFloat(task.prestataire.tjm)), 0
                      ).toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Tâches approuvées :</span>
                    <span className="value">
                      {path.tasks.filter(task => task.isApproved).length} / {path.tasks.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 