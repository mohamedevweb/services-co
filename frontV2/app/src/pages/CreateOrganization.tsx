import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { CreateOrganizationRequest } from '../types/organization';
import './CreateOrganization.css';

const CreateOrganization: React.FC = () => {
  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    name: '',
    adresse: '',
    tel: '',
    solde: 0
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateUserRole } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'solde' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation côté client
    if (!formData.name.trim()) {
      setError('Le nom de l\'organisation est requis');
      setIsSubmitting(false);
      return;
    }

    if (!formData.adresse.trim()) {
      setError('L\'adresse est requise');
      setIsSubmitting(false);
      return;
    }

    if (!formData.tel.trim()) {
      setError('Le numéro de téléphone est requis');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiService.createOrganization(formData);
      
      if (response.success && response.data) {
        updateUserRole(response.data.token, 'ORG', response.data.id);
        
        navigate('/');
      } else {
        setError(response.message || 'Erreur lors de la création de l\'organisation');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la création de l\'organisation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-org-container">
      <div className="create-org-card">
        <h1 className="create-org-title">Créer votre organisation</h1>
        <p className="create-org-subtitle">
          Renseignez les informations de votre organisation
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-org-form">
          <div className="form-group">
            <label htmlFor="name">Nom de l'organisation *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nom de votre organisation"
            />
          </div>

          <div className="form-group">
            <label htmlFor="adresse">Adresse *</label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              required
              placeholder="Adresse complète"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tel">Téléphone *</label>
            <input
              type="tel"
              id="tel"
              name="tel"
              value={formData.tel}
              onChange={handleChange}
              required
              placeholder="Numéro de téléphone"
            />
          </div>

          <div className="form-group">
            <label htmlFor="solde">Solde initial (€)</label>
            <input
              type="number"
              id="solde"
              name="solde"
              value={formData.solde}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <button
            type="submit"
            className="create-org-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création en cours...' : 'Créer l\'organisation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganization; 