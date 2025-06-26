import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Bienvenue sur Services-Co</h1>
        <p className="welcome-text">
          Plateforme de mise en relation entre organisations et prestataires
        </p>
        
        {user && (
          <div className="user-info">
            <h2>Bonjour, {user.email} !</h2>
            <p>Vous êtes connecté en tant que <strong>{user.role}</strong></p>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Pour les Organisations</h3>
            <p>Trouvez des prestataires qualifiés pour vos projets</p>
          </div>
          <div className="feature-card">
            <h3>Pour les Prestataires</h3>
            <p>Découvrez de nouvelles opportunités d'affaires</p>
          </div>
          <div className="feature-card">
            <h3>Gestion Simplifiée</h3>
            <p>Interface intuitive pour gérer vos collaborations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 