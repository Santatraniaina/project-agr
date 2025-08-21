import React, { useState, useEffect } from 'react';
import { FaPlus, FaRoute, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

const CooperativeItinerary = ({ cooperative, onBack }) => {
  const [showModal, setShowModal] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    depart: '',
    itineraire: '',
    cooperative_id: cooperative?.id || null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8000/api/itineraires';

  useEffect(() => {
    if (cooperative?.id) {
      fetchItineraries();
    }
  }, [cooperative]);

  const fetchItineraries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des itinéraires');
      const data = await response.json();
      // Filter by cooperative_id on the frontend for now
      const filteredData = data.filter(itinerary =>
        itinerary.cooperative_id === cooperative.id
      );
      setItineraries(filteredData);
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
      // Get CSRF token
      const csrfResponse = await fetch('http://localhost:8000/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!csrfResponse.ok) throw new Error('Failed to get CSRF token');
      
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;

      // Vérifier que cooperative existe
      if (!cooperative || !cooperative.id) {
        throw new Error('Aucune coopérative sélectionnée');
      }

      // Créer un nouvel itinéraire avec des données locales
      const newItinerary = {
        id: Date.now(),
        cooperative_id: cooperative.id,
        cooperative_name: cooperative.nom || 'Coopérative',
        depart: formData.depart,
        arrivee: formData.arrivee,
        distance: formData.distance,
        duree: formData.duree,
        prix: formData.prix,
        statut: 'Actif',
        created_at: new Date().toISOString()
      };

      // Ajouter à la liste locale
      setItineraries([...itineraries, newItinerary]);
      
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Échec de l'ajout de l'itinéraire");
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
      if (!cooperative || !cooperative.id) {
        throw new Error('Aucune coopérative sélectionnée');
      }

      const itineraryId = itineraries[editingIndex].id;
      
      // Mettre à jour l'itinéraire dans la liste locale
      const updatedItineraries = itineraries.map((itinerary, index) => {
        if (index === editingIndex) {
          return {
            ...itinerary,
            depart: formData.depart,
            arrivee: formData.arrivee,
            distance: formData.distance,
            duree: formData.duree,
            prix: formData.prix,
            cooperative_id: cooperative.id,
            cooperative_name: cooperative.nom || 'Coopérative',
            updated_at: new Date().toISOString()
          };
        }
        return itinerary;
      });

      setItineraries(updatedItineraries);
      resetForm();
      setShowModal(false);
      setError(null);
    } catch (err) {
      setError(err.message || "Erreur lors de la modification");
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
        const csrfResponse = await fetch('http://localhost:8000/api/csrf-token', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!csrfResponse.ok) throw new Error('Failed to get CSRF token');
        
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;
        
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        await fetchItineraries();
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      nom: '', 
      depart: '', 
      itineraire: '',
      cooperative_id: cooperative?.id || null
    });
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (index) => {
    setFormData(itineraries[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Itinéraires de {cooperative?.nom}</h2>
            <p className="text-gray-600 text-sm mt-1">Gérez les itinéraires pour cette coopérative</p>
          </div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Retour
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Liste des itinéraires</h3>
            <p className="text-gray-600 text-sm">Gérez les itinéraires de votre coopérative</p>
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

        {loading && !itineraries.length ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Chargement en cours...</p>
          </div>
        ) : itineraries.length > 0 ? (
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
                {itineraries.map((itinerary, index) => (
                  <tr key={itinerary.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{itinerary.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{itinerary.depart}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{itinerary.itineraire}</td>
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
                          onClick={() => handleDelete(itinerary.id)}
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
            <p className="text-gray-500 mt-1">Commencez par ajouter un nouvel itinéraire pour cette coopérative</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200 shadow-md mx-auto"
              disabled={loading}
            >
              <FaPlus className="mr-2" />
              Ajouter un itinéraire
            </button>
          </div>
        )}
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

export default CooperativeItinerary;