import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FaPlus, FaRoute, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const Itineraire = () => {
  const [showModal, setShowModal] = useState(false);
  const [itineraires, setItineraires] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    depart: '',
    itineraire: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8000/api/itineraires';

  useEffect(() => {
    fetchItineraires();
  }, []);

  const fetchItineraires = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erreur lors du chargement des itinéraires');
      const data = await response.json();
      setItineraires(data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  

  // Méthode pour AJOUTER un nouvel itinéraire
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Récupérer le token CSRF
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;

      // 2. Envoyer les données avec axios
      const response = await axios.post('http://localhost:8000/api/itineraires', 
        formData, // Les données à envoyer
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // 3. Gérer la réponse
      await fetchItineraires();
      resetForm();
      setShowModal(false);
    } catch (err) {
      // 4. Gestion des erreurs spécifique à axios
      const errorMessage = err.response?.data?.message || err.message || "Échec de l'ajout de l'itinéraire";
      setError(errorMessage);
      console.error('Erreur ajout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Méthode pour MODIFIER un itinéraire existant
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;
      const itineraireId = itineraires[editingIndex].id;

      await axios.put(`http://localhost:8000/api/itineraires/${itineraireId}`, formData, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json'
        }
      });

      await fetchItineraires();
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la modification");
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
};

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet itinéraire ?')) {
      setLoading(true);
      setError(null);
      try {
        const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        });
  
        const csrfToken = csrfResponse.data.csrfToken;
        
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        await fetchItineraires();
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', depart: '', itineraire: '' });
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (index) => {
    setFormData(itineraires[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Votre Sidebar existant - non modifié */}
      <Sidebar />
      
      <div className="flex-1 ml-64 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Itinéraires</h1>
              <p className="text-gray-600">Planifiez et gérez vos itinéraires</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200 shadow-md"
              disabled={loading}
            >
              <FaPlus className="mr-2" />
              {loading ? 'Chargement...' : 'Ajouter un itinéraire'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-700">Liste des itinéraires</h2>
            </div>
            
            {loading && !itineraires.length ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Chargement en cours...</p>
              </div>
            ) : itineraires.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itinéraire</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itineraires.map((itineraire, index) => (
                      <tr key={itineraire.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{itineraire.nom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{itineraire.depart}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{itineraire.itineraire}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(index)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              title="Modifier"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(itineraire.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="Supprimer"
                              disabled={loading}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <FaRoute className="inline-block text-4xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Aucun itinéraire enregistré</h3>
                <p className="text-gray-500 mt-1">Commencez par ajouter un nouvel itinéraire</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <FaRoute className="mr-2 text-blue-500" />
                {editingIndex !== null ? 'Modifier Itinéraire' : 'Nouvel Itinéraire'}
              </h2>
              <button 
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="text-gray-400 hover:text-gray-500"
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={editingIndex !== null ? handleUpdate : handleAdd} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'itinéraire</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Ex: Itinéraire Dakar-Thiès"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Point de départ</label>
                  <input
                    type="text"
                    name="depart"
                    value={formData.depart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Ex: Dakar"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itinéraire</label>
                  <input
                    type="text"
                    name="itineraire"
                    value={formData.itineraire}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Ex: Dakar > Thiès > Mbour"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 
                   (editingIndex !== null ? 'Mettre à jour' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itineraire;