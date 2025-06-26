import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRoleSelection = (role: 'ORGANISATION' | 'PRESTATAIRE') => {
    console.log(`Rôle sélectionné: ${role}`);
    
    if (role === 'ORGANISATION') {
      navigate('/create-organization');
    } else {
      navigate('/create-prestataire');
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Who are you?</h1>
        <p className="onboarding-subtitle">
          Choisissez votre profil pour personnaliser votre expérience
        </p>

        <div className="role-selection">
          <button
            className="role-button organisation"
            onClick={() => handleRoleSelection('ORGANISATION')}
          >
            <div className="role-icon">🏢</div>
            <h3>ORGANISATION</h3>
            <p>Je recherche des prestataires pour mes projets</p>
          </button>

          <button
            className="role-button prestataire"
            onClick={() => handleRoleSelection('PRESTATAIRE')}
          >
            <div className="role-icon">👨‍💼</div>
            <h3>PRESTATAIRE</h3>
            <p>Je propose mes services aux organisations</p>
          </button>
        </div>

        {user && (
          <div className="user-info-onboarding">
            <p>Connecté en tant que : <strong>{user.email}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding; 