import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Project, CreateProjectAIRequest, CreateProjectAIResponse } from '../types/project';
import './Projects.css';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // État pour les projets
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // État pour la création de projet via IA
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [user?.organizationId]);

  const fetchProjects = async () => {
    if (!user?.organizationId) {
      setError('ID de l\'organisation non trouvé');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.getProjectsByOrganization(user.organizationId);
      
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        setError(response.error || 'Erreur lors de la récupération des projets');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération des projets');
    }

    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length !== files.length) {
        setCreateError('Seuls les fichiers PDF sont acceptés');
        return;
      }
      
      setSelectedFiles(pdfFiles);
      setCreateError('');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() && selectedFiles.length === 0) {
      setCreateError('Veuillez fournir un prompt ou télécharger des fichiers PDF');
      return;
    }

    if (!user?.organizationId) {
      setCreateError('ID de l\'organisation non trouvé');
      return;
    }

    setIsCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      // Extraire le texte des PDFs et combiner avec le prompt
      const combinedPrompt = await apiService.extractProjectData(prompt, selectedFiles);
      
      const data: CreateProjectAIRequest = {
        prompt: combinedPrompt,
        organizationId: user.organizationId
      };

      const response: CreateProjectAIResponse = await apiService.createProjectWithAI(data);

      if (response.success) {
        setCreateSuccess('Projet créé avec succès !');
        setPrompt('');
        setSelectedFiles([]);
        setShowCreateForm(false);
        
        // Actualiser la liste des projets
        await fetchProjects();
        
        // Reset success message après quelques secondes
        setTimeout(() => setCreateSuccess(''), 3000);
      } else {
        setCreateError(response.error || 'Erreur lors de la création du projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setCreateError('Erreur lors de la création du projet');
    }

    setIsCreating(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="projects-container">
        <div className="loading">Chargement des projets...</div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Gestion des Projets</h1>
        <button 
          onClick={() => navigate('/')}
          className="back-btn"
        >
          ← Retour au tableau de bord
        </button>
      </div>

      {/* Messages de succès/erreur globaux */}
      {createSuccess && (
        <div className="success-message global">{createSuccess}</div>
      )}
      {error && (
        <div className="error-message global">{error}</div>
      )}

      {/* Section de création de projet */}
      <div className="create-section">
        {!showCreateForm ? (
          <div className="create-prompt">
            <div className="ai-icon">🤖</div>
            <h2>Créer un projet with AI</h2>
            <p>Décrivez votre projet ou téléchargez des documents PDF. Notre IA analysera vos besoins et créera automatiquement un projet structuré avec des tâches et des prestataires appropriés.</p>
            
            <button 
              onClick={() => setShowCreateForm(true)}
              className="create-btn"
            >
              ✨ Commencer la création
            </button>
          </div>
        ) : (
          <div className="create-form-container">
            <div className="form-header">
              <h2>🚀 Création de projet avec IA</h2>
              <button 
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError('');
                  setPrompt('');
                  setSelectedFiles([]);
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="create-form">
              {/* Section prompt */}
              <div className="form-section">
                <label htmlFor="prompt">💬 Décrivez votre projet</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Je veux créer une application mobile de livraison avec paiement en ligne, interface utilisateur moderne, système de géolocalisation..."
                  rows={4}
                  disabled={isCreating}
                />
              </div>

              {/* Section upload PDF */}
              <div className="form-section">
                <label htmlFor="pdfs">📄 Ou téléchargez vos documents PDF</label>
                <div className="file-upload-area">
                  <input
                    id="pdfs"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileSelect}
                    disabled={isCreating}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="pdfs" className="file-upload-btn">
                    📁 Choisir des fichiers PDF
                  </label>
                  <span className="file-info">Formats acceptés: PDF uniquement</span>
                </div>

                {/* Liste des fichiers sélectionnés */}
                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <h4>Fichiers sélectionnés:</h4>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span>📄 {file.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="remove-file-btn"
                          disabled={isCreating}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages d'erreur */}
              {createError && (
                <div className="error-message">{createError}</div>
              )}

              {/* Boutons d'action */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={isCreating || (!prompt.trim() && selectedFiles.length === 0)}
                  className="submit-btn"
                >
                  {isCreating ? (
                    <>
                      <span className="spinner"></span>
                      Création en cours...
                    </>
                  ) : (
                    '🚀 Créer le projet'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Liste des projets existants */}
      <div className="projects-list">
        <h2>Vos Projets ({projects.length})</h2>
        
        {projects.length === 0 ? (
          <div className="no-projects">
            <div className="empty-icon">📋</div>
            <h3>Aucun projet pour le moment</h3>
            <p>Créez votre premier projet avec l'aide de notre IA !</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span className="project-id">#{project.id}</span>
                </div>
                <p className="project-description">{project.description}</p>
                
                <div className="project-actions">
                  <button 
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="view-btn"
                  >
                    👁️ Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects; 