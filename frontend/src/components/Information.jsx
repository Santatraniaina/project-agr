import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';

const Information = () => {
  const [vehicules, setVehicules] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentVehicule, setCurrentVehicule] = useState(null);
  const [formData, setFormData] = useState({
    numero_matricule: '',
    proprietaire_nom: '',
    proprietaire_contact: '',
    chauffeur_nom: '',
    chauffeur_contact: ''
  });
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState('');

  // Charger les véhicules et le token CSRF
  useEffect(() => {
    const fetchData = async () => {
      await fetchCsrfToken();
      await fetchVehicules();
    };
    fetchData();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('Erreur lors de la récupération du token CSRF:', error);
    }
  };

  const fetchVehicules = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/vehicules', {
        withCredentials: true
      });
      setVehicules(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
    }
  };

  const validateMatricule = (matricule) => {
    // Exemple de validation: 3 lettres suivies de 3 chiffres (ex: ABC123)
    const regex = /^[A-Za-z]{3}\d{3}$/;
    return regex.test(matricule);
  };

  const validateForm = () => {
    const newErrors = {};
        
    if (!formData.proprietaire_nom) {
      newErrors.proprietaire_nom = 'Le nom du propriétaire est requis';
    }
    
    if (!formData.proprietaire_contact) {
      newErrors.proprietaire_contact = 'Le contact du propriétaire est requis';
    }
    
    if (!formData.chauffeur_nom) {
      newErrors.chauffeur_nom = 'Le nom du chauffeur est requis';
    }
    
    if (!formData.chauffeur_contact) {
      newErrors.chauffeur_contact = 'Le contact du chauffeur est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await axios.post(
        'http://localhost:8000/api/vehicules',
        formData,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        fetchVehicules();
        setIsAddDialogOpen(false);
        setFormData({
          numero_matricule: '',
          proprietaire_nom: '',
          proprietaire_contact: '',
          chauffeur_nom: '',
          chauffeur_contact: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du véhicule:', error);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await axios.put(
        `http://localhost:8000/api/vehicules/${currentVehicule.id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        fetchVehicules();
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du véhicule:', error);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/vehicules/${id}`,
          {
            withCredentials: true,
            headers: {
              'X-CSRF-TOKEN': csrfToken,
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.status === 204) {
          fetchVehicules();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du véhicule:', error);
      }
    }
  };

  const openEditDialog = (vehicule) => {
    setCurrentVehicule(vehicule);
    setFormData({
      numero_matricule: vehicule.numero_matricule,
      proprietaire_nom: vehicule.proprietaire_nom,
      proprietaire_contact: vehicule.proprietaire_contact,
      chauffeur_nom: vehicule.chauffeur_nom,
      chauffeur_contact: vehicule.chauffeur_contact
    });
    setIsEditDialogOpen(true);
    setErrors({});
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenu principal avec marge pour la sidebar */}
      <div className="flex-1 ml-64 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Gestion des Véhicules</h1>
          <p className="text-gray-600">Gérez vos véhicules et leurs informations</p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Liste des Véhicules</h2>
              <button
                onClick={() => {
                  setIsAddDialogOpen(true);
                  setErrors({});
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                Ajouter un véhicule
              </button>
            </div>

            {/* Tableau des véhicules */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Matricule</th>
                    <th className="py-3 px-4 text-left">Propriétaire</th>
                    <th className="py-3 px-4 text-left">Contact Propriétaire</th>
                    <th className="py-3 px-4 text-left">Chauffeur</th>
                    <th className="py-3 px-4 text-left">Contact Chauffeur</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicules.map((vehicule) => (
                    <tr key={vehicule.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">{vehicule.numero_matricule}</td>
                      <td className="py-3 px-4">{vehicule.proprietaire_nom}</td>
                      <td className="py-3 px-4">{vehicule.proprietaire_contact}</td>
                      <td className="py-3 px-4">{vehicule.chauffeur_nom}</td>
                      <td className="py-3 px-4">{vehicule.chauffeur_contact}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button
                          onClick={() => openEditDialog(vehicule)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(vehicule.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue d'ajout */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Ajouter un véhicule</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Numéro matricule</label>
                <input
                  type="text"
                  name="numero_matricule"
                  value={formData.numero_matricule}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.numero_matricule ? 'border-red-500' : ''}`}
                  placeholder="ABC123"
                  required
                />
                {errors.numero_matricule && (
                  <p className="text-red-500 text-sm mt-1">{errors.numero_matricule}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nom du propriétaire</label>
                <input
                  type="text"
                  name="proprietaire_nom"
                  value={formData.proprietaire_nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.proprietaire_nom ? 'border-red-500' : ''}`}
                  required
                />
                {errors.proprietaire_nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.proprietaire_nom}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contact du propriétaire</label>
                <input
                  type="text"
                  name="proprietaire_contact"
                  value={formData.proprietaire_contact}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.proprietaire_contact ? 'border-red-500' : ''}`}
                  required
                />
                {errors.proprietaire_contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.proprietaire_contact}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nom du chauffeur</label>
                <input
                  type="text"
                  name="chauffeur_nom"
                  value={formData.chauffeur_nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.chauffeur_nom ? 'border-red-500' : ''}`}
                  required
                />
                {errors.chauffeur_nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.chauffeur_nom}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Contact du chauffeur</label>
                <input
                  type="text"
                  name="chauffeur_contact"
                  value={formData.chauffeur_contact}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.chauffeur_contact ? 'border-red-500' : ''}`}
                  required
                />
                {errors.chauffeur_contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.chauffeur_contact}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialogue de modification */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Modifier le véhicule</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Numéro matricule</label>
                <input
                  type="text"
                  name="numero_matricule"
                  value={formData.numero_matricule}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.numero_matricule ? 'border-red-500' : ''}`}
                  required
                />
                {errors.numero_matricule && (
                  <p className="text-red-500 text-sm mt-1">{errors.numero_matricule}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nom du propriétaire</label>
                <input
                  type="text"
                  name="proprietaire_nom"
                  value={formData.proprietaire_nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.proprietaire_nom ? 'border-red-500' : ''}`}
                  required
                />
                {errors.proprietaire_nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.proprietaire_nom}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contact du propriétaire</label>
                <input
                  type="text"
                  name="proprietaire_contact"
                  value={formData.proprietaire_contact}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.proprietaire_contact ? 'border-red-500' : ''}`}
                  required
                />
                {errors.proprietaire_contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.proprietaire_contact}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nom du chauffeur</label>
                <input
                  type="text"
                  name="chauffeur_nom"
                  value={formData.chauffeur_nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.chauffeur_nom ? 'border-red-500' : ''}`}
                  required
                />
                {errors.chauffeur_nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.chauffeur_nom}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Contact du chauffeur</label>
                <input
                  type="text"
                  name="chauffeur_contact"
                  value={formData.chauffeur_contact}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.chauffeur_contact ? 'border-red-500' : ''}`}
                  required
                />
                {errors.chauffeur_contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.chauffeur_contact}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Information;