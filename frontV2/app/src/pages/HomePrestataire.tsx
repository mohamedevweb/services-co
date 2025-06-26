import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import './HomePrestataire.css';

interface PrestataireProject {
  id: number;
  title: string;
  description: string;
  organizationId: number;
  organization: {
    id: number;
    name: string;
  };
  paths: Array<{
    id: number;
    number: number;
    isChoose: boolean;
    tasks: Array<{
      name: string;
      nbDays: number;
      isApproved: boolean;
    }>;
  }>;
}

const HomePrestataire: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<PrestataireProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrestataireProjects = async () => {
      if (!user?.prestataireId) {
        console.log('User prestataireId non disponible:', user);
        setError('ID du prestataire non trouvé. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }

      try {
        console.log('Récupération des projets pour le prestataire ID:', user.prestataireId);
        const response = await apiService.getApi().get(`/project/prestataire/${user.prestataireId}`);
        
        console.log('Réponse API projets prestataire:', response.data);
        
        if (response.data.success) {
          setProjects(response.data.data || []);
        } else {
          setError('Erreur lors de la récupération des projets');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        setError('Erreur lors de la récupération des projets');
      }

      setLoading(false);
    };

    fetchPrestataireProjects();
  }, [user?.prestataireId]);

  // Les données arrivent déjà groupées par projet du backend
  const projectsList = projects;

  if (loading) {
    return (
      <div className="home-prestataire-container">
        <div className="loading">Chargement de vos projets...</div>
      </div>
    );
  }

  return (
    <div className="home-prestataire-container">
      <div className="prestataire-header">
        <h1>Tableau de bord - Prestataire</h1>
        <div className="user-info">
          <span className="welcome-text">Bienvenue, {user?.email} !</span>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="projects-section">
        <h2>Vos Projets ({projectsList.length})</h2>
        
        {projectsList.length === 0 ? (
          <div className="no-projects">
            <div className="empty-icon">📋</div>
            <h3>Aucun projet assigné</h3>
            <p>Vous n'êtes actuellement assigné à aucun projet.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projectsList.map((projectData) => {
              // Vérifier s'il y a un path choisi
              const chosenPath = projectData.paths.find((path: any) => path.isChoose);
              const hasChosenPath = !!chosenPath;
              
              return (
                <div key={projectData.id} className="project-card">
                  <div className="project-header">
                    <h3>{projectData.title}</h3>
                    <span className="project-id">#{projectData.id}</span>
                  </div>
                  
                  <div className="project-organization">
                    🏢 {projectData.organization.name}
                  </div>
                  
                  <p className="project-description">{projectData.description}</p>
                  
                  <div className="project-status">
                    {hasChosenPath ? (
                      <div className="status-ready">
                        <span>Parcours choisi - Prêt à travailler</span>
                      </div>
                    ) : (
                      <div className="status-pending">
                        <span>Projet en cours de préparation</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="project-tasks-summary">
                    <div className="tasks-info">
                      <span className="label">Vos tâches :</span>
                      <span className="value">{projectData.paths.reduce((total: number, path: any) => total + path.tasks.length, 0)}</span>
                    </div>
                    <div className="tasks-info">
                      <span className="label">Approuvées :</span>
                      <span className="value">
                        {projectData.paths.reduce((total: number, path: any) => 
                          total + path.tasks.filter((task: any) => task.isApproved).length, 0
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="project-actions">
                    <button 
                      onClick={() => navigate(`/prestataire/project/${projectData.id}`)}
                      className="view-btn"
                    >
                      👁️ Voir le projet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePrestataire; 