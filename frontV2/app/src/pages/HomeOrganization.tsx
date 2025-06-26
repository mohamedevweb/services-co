import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import './HomeOrganization.css';

interface Organization {
  id: number;
  name: string;
  adresse: string;
  tel: string;
  solde: string;
}

const HomeOrganization: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        // Utiliser la route pour récupérer l'organisation de l'utilisateur connecté
        const response = await apiService.getApi().get('/organization/me/organization');
        
        if (response.data.success) {
          setOrganization(response.data.data);
        } else {
          setError('Erreur lors de la récupération des données de l\'organisation');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors de la récupération des données de l\'organisation');
      }

      setLoading(false);
    };

    fetchOrganizationData();
  }, []);

  const handleCreateProject = () => {
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="home-organization-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-organization-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-organization-container">
      <div className="organization-header">
        <h1>Tableau de bord - Organisation</h1>
        
        {/* Informations de l'organisation */}
        {organization && (
          <div className="organization-info">
            <h2>{organization.name}</h2>
            <div className="organization-details">
              <div className="detail-item">
                <span className="label">📍 Adresse :</span>
                <span className="value">{organization.adresse}</span>
              </div>
              <div className="detail-item">
                <span className="label">📞 Téléphone :</span>
                <span className="value">{organization.tel}</span>
              </div>
              <div className="detail-item">
                <span className="label">💰 Solde :</span>
                <span className="value">{organization.solde} €</span>
              </div>
              <div className="detail-item">
                <span className="label">✉️ Email :</span>
                <span className="value">{user?.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section principale avec le bouton de création de projet */}
      <div className="main-content">
        <div className="create-project-section">
          <h3>Gestion des projets</h3>
          <p>Créez et gérez vos projets avec l'aide de l'intelligence artificielle</p>
          
          <button 
            onClick={handleCreateProject}
            className="create-project-btn"
          >
            🚀 Créer un nouveau projet
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="quick-stats">
          <div className="stat-card">
            <h4>Projets actifs</h4>
            <div className="stat-number">-</div>
          </div>
          <div className="stat-card">
            <h4>Prestataires</h4>
            <div className="stat-number">-</div>
          </div>
          <div className="stat-card">
            <h4>Budget utilisé</h4>
            <div className="stat-number">-</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeOrganization; 