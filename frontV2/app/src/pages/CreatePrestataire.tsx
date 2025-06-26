import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { extractTextFromPDF } from '../utils/pdfUtils';
import type { CreatePrestataireRequest, JobType } from '../types/prestataire';
import './CreatePrestataire.css';

const JOB_OPTIONS = [
  { value: 'DEVELOPMENT', label: 'Développement' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HUMAN_RESOURCES', label: 'Ressources Humaines' },
  { value: 'SALES', label: 'Ventes' },
] as const;

const CreatePrestataire: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserRole } = useAuth();
  
  // États pour la section AI
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // États du formulaire existant
  const [formData, setFormData] = useState<CreatePrestataireRequest>({
    first_name: '',
    name: '',
    job: 'DEVELOPMENT' as JobType,
    description: '',
    experience_time: 0,
    study_level: 0,
    city: '',
    tjm: 0,
    skills: [],
    diplomas: [],
    experiences: [],
    languages: []
  });

  // États pour les listes dynamiques
  const [newSkill, setNewSkill] = useState('');
  const [newDiploma, setNewDiploma] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fonction d'animation typewriter
  const typewriterEffect = async (
    text: string, 
    fieldName: keyof CreatePrestataireRequest,
    speed: number = 50
  ): Promise<void> => {
    return new Promise((resolve) => {
      let currentIndex = 0;
      const timer = setInterval(() => {
        if (currentIndex <= text.length) {
          setFormData(prev => ({
            ...prev,
            [fieldName]: text.substring(0, currentIndex)
          }));
          currentIndex++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  };

  // Fonction pour animer les arrays (compétences, diplômes, etc.)
  const animateArrayField = async (
    items: { description: string }[],
    fieldName: keyof CreatePrestataireRequest,
    delay: number = 300
  ): Promise<void> => {
    return new Promise((resolve) => {
      let currentIndex = 0;
      const addNextItem = () => {
        if (currentIndex < items.length) {
          setFormData(prev => ({
            ...prev,
            [fieldName]: items.slice(0, currentIndex + 1)
          }));
          currentIndex++;
          setTimeout(addNextItem, delay);
        } else {
          resolve();
        }
      };
      addNextItem();
    });
  };

  // Fonction pour attendre un délai
  const wait = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Fonction d'animation principale pour remplir le formulaire
  const animateFormFill = async (data: any): Promise<void> => {
    setIsAnimating(true);
    
    try {
      // 1. Prénom (typewriter) - Tronqué à 50 caractères
      if (data.first_name) {
        const truncatedFirstName = data.first_name.length > 50 
          ? data.first_name.substring(0, 47) + '...' 
          : data.first_name;
        await typewriterEffect(truncatedFirstName, 'first_name', 80);
        await wait(400);
      }

      // 2. Nom (typewriter) - Tronqué à 50 caractères
      if (data.name) {
        const truncatedName = data.name.length > 50 
          ? data.name.substring(0, 47) + '...' 
          : data.name;
        await typewriterEffect(truncatedName, 'name', 80);
        await wait(400);
      }

      // 3. Métier (instantané) - Seulement si la valeur correspond exactement à l'enum
      if (data.job) {
        const validJobs = ['DEVELOPMENT', 'DESIGN', 'MARKETING', 'HUMAN_RESOURCES', 'SALES'];
        const normalizedJob = data.job.toUpperCase().trim();
        
        if (validJobs.includes(normalizedJob)) {
          setFormData(prev => ({
            ...prev,
            job: normalizedJob as JobType
          }));
        }
        // Si la valeur ne correspond pas, on ne fait rien (garde la valeur par défaut)
        await wait(600);
      }

      // 4. Ville (typewriter) - Tronquée à 50 caractères
      if (data.city) {
        const truncatedCity = data.city.length > 50 
          ? data.city.substring(0, 47) + '...' 
          : data.city;
        await typewriterEffect(truncatedCity, 'city', 100);
        await wait(500);
      }

      // 5. Description (typewriter) - Tronquée à 50 caractères
      if (data.description) {
        const truncatedDescription = data.description.length > 50 
          ? data.description.substring(0, 47) + '...' 
          : data.description;
        await typewriterEffect(truncatedDescription, 'description', 30);
        await wait(600);
      }

      // 6. Années d'expérience (instantané)
      if (data.experience_time) {
        setFormData(prev => ({
          ...prev,
          experience_time: data.experience_time || 0
        }));
        await wait(400);
      }

      // 7. Niveau d'études (instantané)
      if (data.study_level) {
        const studyLevel = parseInt(data.study_level.replace(/\D/g, '')) || 0;
        setFormData(prev => ({
          ...prev,
          study_level: studyLevel
        }));
        await wait(400);
      }

      // 8. TJM (instantané)
      if (data.tjm) {
        setFormData(prev => ({
          ...prev,
          tjm: data.tjm || 0
        }));
        await wait(600);
      }

      // 9. Compétences (apparition une par une) - Tronquées à 50 caractères
      if (data.skills && data.skills.length > 0) {
        const truncatedSkills = data.skills.map((skill: any) => ({
          description: skill.description.length > 50 
            ? skill.description.substring(0, 47) + '...' 
            : skill.description
        }));
        await animateArrayField(truncatedSkills, 'skills', 400);
        await wait(600);
      }

      // 10. Diplômes (apparition une par une) - Tronqués à 50 caractères
      if (data.diplomas && data.diplomas.length > 0) {
        const truncatedDiplomas = data.diplomas.map((diploma: any) => ({
          description: diploma.description.length > 50 
            ? diploma.description.substring(0, 47) + '...' 
            : diploma.description
        }));
        await animateArrayField(truncatedDiplomas, 'diplomas', 350);
        await wait(600);
      }

      // 11. Expériences (apparition une par une) - Tronquées à 50 caractères
      if (data.experiences && data.experiences.length > 0) {
        const truncatedExperiences = data.experiences.map((experience: any) => ({
          description: experience.description.length > 50 
            ? experience.description.substring(0, 47) + '...' 
            : experience.description
        }));
        await animateArrayField(truncatedExperiences, 'experiences', 450);
        await wait(600);
      }

      // 12. Langues (apparition une par une) - Tronquées à 50 caractères
      if (data.languages && data.languages.length > 0) {
        const truncatedLanguages = data.languages.map((language: any) => ({
          description: language.description.length > 50 
            ? language.description.substring(0, 47) + '...' 
            : language.description
        }));
        await animateArrayField(truncatedLanguages, 'languages', 300);
      }

    } finally {
      setIsAnimating(false);
    }
  };

  // Gestion du fichier PDF
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPdf(file);
      setAiError('');
    } else {
      setAiError('Veuillez sélectionner un fichier PDF valide');
      setSelectedPdf(null);
    }
  };

  // Fonction pour extraire les données avec l'AI
  const handleAiExtract = async () => {
    if (!aiPrompt.trim() && !selectedPdf) {
      setAiError('Veuillez entrer un prompt ou sélectionner un PDF');
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiSuccess('');

    try {
      let combinedPrompt = aiPrompt.trim();

      // Extraire le texte du PDF si présent
      if (selectedPdf) {
        const pdfText = await extractTextFromPDF(selectedPdf);
        combinedPrompt = aiPrompt.trim() ? `${aiPrompt}\n\n${pdfText}` : pdfText;
      }

      // Appeler l'API AI
      const response = await apiService.extractPrestataireData(combinedPrompt);

      if (response.success && response.data) {
        const data = response.data;
        
        // Réinitialiser le formulaire avant l'animation
        setFormData({
          first_name: '',
          name: '',
          job: 'DEVELOPMENT' as JobType,
          description: '',
          experience_time: 0,
          study_level: 0,
          city: '',
          tjm: 0,
          skills: [],
          diplomas: [],
          experiences: [],
          languages: []
        });

        setAiSuccess(`✨ Extraction réussie ! Confiance: ${Math.round(data.confidence_score * 100)}% - Animation en cours...`);
        
        // Lancer l'animation de remplissage
        await animateFormFill(data);
        
        // Mettre à jour le message de succès final
        setAiSuccess(`🎉 Formulaire prérempli avec succès ! Confiance: ${Math.round(data.confidence_score * 100)}%`);
        
        if (data.extraction_notes) {
          console.log('Notes d\'extraction:', data.extraction_notes);
        }
      } else {
        setAiError(response.error || 'Erreur lors de l\'extraction des données');
      }
    } catch (error) {
      console.error('Erreur AI:', error);
      setAiError('Erreur lors de l\'extraction des données');
    }

    setIsAiLoading(false);
  };

  // Reste du code du formulaire existant...
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { description: newSkill.trim() }]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addDiploma = () => {
    if (newDiploma.trim()) {
      setFormData(prev => ({
        ...prev,
        diplomas: [...prev.diplomas, { description: newDiploma.trim() }]
      }));
      setNewDiploma('');
    }
  };

  const removeDiploma = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diplomas: prev.diplomas.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    if (newExperience.trim()) {
      setFormData(prev => ({
        ...prev,
        experiences: [...prev.experiences, { description: newExperience.trim() }]
      }));
      setNewExperience('');
    }
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { description: newLanguage.trim() }]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.createPrestataire(formData);
      
      if (response.success && response.data) {
        updateUserRole(response.data.token, 'PRESTA', response.data.id);
        
        navigate('/');
      } else {
        setError(response.message || 'Erreur lors de la création du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue lors de la création du profil');
    }

    setIsLoading(false);
  };

  return (
    <div className="create-prestataire-container">
      <div className="create-prestataire-card">
        <h1>Créer mon profil prestataire</h1>
        
        {/* Section AI */}
        <div className="ai-section">
          <h2>🤖 Extraction automatique avec IA</h2>
          <p>Décrivez votre profil ou uploadez votre CV en PDF pour préremplir automatiquement le formulaire.</p>
          
          <div className="ai-inputs">
            <div className="ai-input-group">
              <label htmlFor="aiPrompt">Description de votre profil :</label>
              <textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Décrivez votre expérience, compétences, formation... Ex: 'Je suis développeur React avec 5 ans d'expérience, diplômé d'un Master en informatique...'"
                rows={4}
                disabled={isAnimating}
              />
            </div>
            
            <div className="ai-input-group">
              <label htmlFor="pdfFile">Ou sélectionnez votre CV (PDF) :</label>
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                onChange={handlePdfChange}
                disabled={isAnimating}
              />
              {selectedPdf && (
                <span className="file-selected">📄 {selectedPdf.name}</span>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleAiExtract}
              disabled={isAiLoading || isAnimating || (!aiPrompt.trim() && !selectedPdf)}
              className="ai-extract-btn"
            >
              {isAiLoading ? '🔄 Extraction en cours...' : 
               isAnimating ? '✨ Animation en cours...' : 
               '✨ Extraire les données'}
            </button>
            
            {aiError && <div className="ai-error">{aiError}</div>}
            {aiSuccess && <div className="ai-success">{aiSuccess}</div>}
          </div>
        </div>

        <div className="form-divider">
          <span>Ou remplissez manuellement</span>
        </div>

        {/* Formulaire existant */}
        <form onSubmit={handleSubmit} className={`create-prestataire-form ${isAnimating ? 'animating' : ''}`}>
          {/* Section Informations personnelles */}
          <div className="form-section">
            <h3>Informations personnelles</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Prénom *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={isAnimating}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Nom *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isAnimating}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job">Métier *</label>
                <select
                  id="job"
                  name="job"
                  value={formData.job}
                  onChange={handleInputChange}
                  disabled={isAnimating}
                  required
                >
                  {JOB_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="city">Ville *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isAnimating}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Décrivez votre profil, vos spécialités..."
                disabled={isAnimating}
                required
              />
            </div>
          </div>

          {/* Section Expérience professionnelle */}
          <div className="form-section">
            <h3>Expérience professionnelle</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience_time">Années d'expérience *</label>
                <input
                  type="number"
                  id="experience_time"
                  name="experience_time"
                  value={formData.experience_time}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isAnimating}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="study_level">Niveau d'études *</label>
                <input
                  type="number"
                  id="study_level"
                  name="study_level"
                  value={formData.study_level}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Ex: 3 pour Bac+3"
                  disabled={isAnimating}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="tjm">TJM en € *</label>
                <input
                  type="number"
                  id="tjm"
                  name="tjm"
                  value={formData.tjm}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={isAnimating}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Compétences */}
          <div className="form-section">
            <h3>Compétences</h3>
            
            <div className="dynamic-list">
              <div className="add-item">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Ajouter une compétence"
                  disabled={isAnimating}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button type="button" onClick={addSkill} disabled={isAnimating}>Ajouter</button>
              </div>
              
              <div className="items-list">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="list-item">
                    <span>{skill.description}</span>
                    <button type="button" onClick={() => removeSkill(index)} disabled={isAnimating}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Diplômes */}
          <div className="form-section">
            <h3>Diplômes et formations</h3>
            
            <div className="dynamic-list">
              <div className="add-item">
                <input
                  type="text"
                  value={newDiploma}
                  onChange={(e) => setNewDiploma(e.target.value)}
                  placeholder="Ajouter un diplôme"
                  disabled={isAnimating}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDiploma())}
                />
                <button type="button" onClick={addDiploma} disabled={isAnimating}>Ajouter</button>
              </div>
              
              <div className="items-list">
                {formData.diplomas.map((diploma, index) => (
                  <div key={index} className="list-item">
                    <span>{diploma.description}</span>
                    <button type="button" onClick={() => removeDiploma(index)} disabled={isAnimating}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Expériences */}
          <div className="form-section">
            <h3>Expériences détaillées</h3>
            
            <div className="dynamic-list">
              <div className="add-item">
                <input
                  type="text"
                  value={newExperience}
                  onChange={(e) => setNewExperience(e.target.value)}
                  placeholder="Ajouter une expérience"
                  disabled={isAnimating}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExperience())}
                />
                <button type="button" onClick={addExperience} disabled={isAnimating}>Ajouter</button>
              </div>
              
              <div className="items-list">
                {formData.experiences.map((experience, index) => (
                  <div key={index} className="list-item">
                    <span>{experience.description}</span>
                    <button type="button" onClick={() => removeExperience(index)} disabled={isAnimating}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Langues */}
          <div className="form-section">
            <h3>Langues</h3>
            
            <div className="dynamic-list">
              <div className="add-item">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Ajouter une langue"
                  disabled={isAnimating}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <button type="button" onClick={addLanguage} disabled={isAnimating}>Ajouter</button>
              </div>
              
              <div className="items-list">
                {formData.languages.map((language, index) => (
                  <div key={index} className="list-item">
                    <span>{language.description}</span>
                    <button type="button" onClick={() => removeLanguage(index)} disabled={isAnimating}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading || isAnimating} className="submit-btn">
            {isLoading ? 'Création en cours...' : 
             isAnimating ? 'Animation en cours...' : 
             'Créer mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePrestataire; 