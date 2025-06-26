import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import './PrestataireProjectDetail.css';

interface Prestataire {
  id: number;
  firstName: string;
  name: string;
  job: string;
  description: string;
  experienceTime: number;
  city: string;
  tjm: string;
}

interface Task {
  prestataireId: number;
  pathId: number;
  isApproved: boolean;
  nbDays: number;
  name: string;
  prestataire: Prestataire;
}

interface Path {
  id: number;
  number: number;
  isChoose: boolean;
  projectId: number;
  tasks: Task[];
}

interface Organization {
  id: number;
  name: string;
  adresse: string;
  tel: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  organizationId: number;
}

interface ProjectData {
  project: Project;
  organization: Organization;
  paths: Path[];
}

const PrestataireProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingTask, setApprovingTask] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) {
        setError('ID de projet manquant');
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getApi().get(`/project/${id}`);
        
        if (response.data.success) {
          setProjectData(response.data.data);
        } else {
          setError('Erreur lors de la récupération du projet');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors de la récupération du projet');
      }

      setLoading(false);
    };

    fetchProjectData();
  }, [id]);

  const handleApproveTask = async (pathId: number, prestataireId: number, currentStatus: boolean) => {
    const taskKey = `${pathId}-${prestataireId}`;
    setApprovingTask(taskKey);

    try {
      const response = await apiService.getApi().patch(
        `/project/path/${pathId}/prestataire/${prestataireId}/approve`,
        { isApproved: !currentStatus }
      );

      if (response.data.success) {
        // Mettre à jour les données localement
        setProjectData(prevData => {
          if (!prevData) return null;
          
          return {
            ...prevData,
            paths: prevData.paths.map(path => ({
              ...path,
              tasks: path.tasks.map(task => 
                task.pathId === pathId && task.prestataireId === prestataireId
                  ? { ...task, isApproved: !currentStatus }
                  : task
              )
            }))
          };
        });
      } else {
        setError('Erreur lors de la mise à jour de la tâche');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour de la tâche');
    }

    setApprovingTask(null);
  };

  if (loading) {
    return (
      <div className="prestataire-project-detail-container">
        <div className="loading">Chargement du projet...</div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="prestataire-project-detail-container">
        <div className="error-message">{error || 'Projet non trouvé'}</div>
        <button onClick={() => navigate('/home-prestataire')} className="back-btn">
          ← Retour à l'accueil
        </button>
      </div>
    );
  }

  // Trouver le path choisi
  const chosenPath = projectData.paths.find(path => path.isChoose);

  // Filtrer les tâches du prestataire connecté
  const userTasks = chosenPath?.tasks.filter(task => task.prestataireId === user?.prestataireId) || [];

  return (
    <div className="prestataire-project-detail-container">
      {/* Header */}
      <div className="project-header">
        <button onClick={() => navigate('/home-prestataire')} className="back-btn">
          ← Retour
        </button>
        <div className="project-title-section">
          <h1>{projectData.project.title}</h1>
          <span className="project-id">Projet #{projectData.project.id}</span>
        </div>
      </div>

      {/* Organization Info */}
      <div className="organization-card">
        <h3>🏢 Organisation</h3>
        <div className="org-details">
          <div className="org-info">
            <strong>{projectData.organization.name}</strong>
            <p>📍 {projectData.organization.adresse}</p>
            <p>📞 {projectData.organization.tel}</p>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="project-description-card">
        <h3>📋 Description du projet</h3>
        <p>{projectData.project.description}</p>
      </div>

      {/* Project Status */}
      {!chosenPath ? (
        <div className="no-path-selected">
          <div className="status-icon">⏳</div>
          <h3>Projet en cours de préparation</h3>
          <p>L'organisation n'a pas encore choisi de parcours de développement pour ce projet.</p>
          <p>Vous serez notifié dès qu'un parcours sera sélectionné.</p>
        </div>
      ) : (
        <div className="chosen-path-section">
          <div className="path-header">
            <h3>🎯 Parcours de développement sélectionné</h3>
            <span className="path-number">Parcours #{chosenPath.number}</span>
          </div>

          {/* User's Tasks */}
          <div className="user-tasks-section">
            <h4>🎯 Vos tâches ({userTasks.length})</h4>
            {userTasks.length === 0 ? (
              <div className="no-tasks">
                <p>Vous n'avez aucune tâche assignée dans ce parcours.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {userTasks.map((task) => (
                  <div key={`${task.pathId}-${task.prestataireId}`} className="user-task-card">
                    <div className="task-header">
                      <h5>{task.name}</h5>
                      <div className={`task-status ${task.isApproved ? 'approved' : 'pending'}`}>
                        {task.isApproved ? '✅ Approuvée' : '⏳ En attente'}
                      </div>
                    </div>
                    <div className="task-details">
                      <span className="task-duration">⏱️ {task.nbDays} jours</span>
                      <span className="task-tjm">💰 {task.prestataire.tjm}€/jour</span>
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => handleApproveTask(task.pathId, task.prestataireId, task.isApproved)}
                        disabled={approvingTask === `${task.pathId}-${task.prestataireId}` || task.isApproved}
                        className={`approve-btn ${task.isApproved ? 'approved-disabled' : 'approve'}`}
                      >
                        {approvingTask === `${task.pathId}-${task.prestataireId}` ? (
                          'Traitement...'
                        ) : task.isApproved ? (
                          '✅ Tâche approuvée'
                        ) : (
                          '✅ Approuver la tâche'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Tasks in Path */}
          <div className="all-tasks-section">
            <h4>👥 Toutes les tâches du parcours</h4>
            <div className="tasks-horizontal-grid">
              {chosenPath.tasks.map((task) => {
                const isUserTask = task.prestataireId === user?.prestataireId;
                return (
                  <div 
                    key={`${task.pathId}-${task.prestataireId}`} 
                    className={`task-card ${isUserTask ? 'user-task' : 'other-task'}`}
                  >
                    <div className="task-header">
                      <h5>{task.name}</h5>
                      <div className={`task-status ${task.isApproved ? 'approved' : 'pending'}`}>
                        {task.isApproved ? '✅' : '⏳'}
                      </div>
                    </div>
                    
                    <div className="prestataire-info">
                      <div className={`prestataire-name ${isUserTask ? 'user-name' : ''}`}>
                        {isUserTask ? '👤 Vous' : `👤 ${task.prestataire.firstName} ${task.prestataire.name}`}
                      </div>
                      <div className="prestataire-job">{task.prestataire.job}</div>
                      <div className="prestataire-details">
                        <span>📍 {task.prestataire.city}</span>
                        <span>⭐ {task.prestataire.experienceTime} ans</span>
                      </div>
                    </div>
                    
                    <div className="task-bottom">
                      <div className="task-duration">⏱️ {task.nbDays} jours</div>
                      <div className="task-rate">💰 {task.prestataire.tjm}€/jour</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestataireProjectDetail; 