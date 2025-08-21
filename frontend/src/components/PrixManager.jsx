import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const PrixManager = () => {
  const [prixData, setPrixData] = useState([]);
  const [editingPrix, setEditingPrix] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itineraires, setItineraires] = useState([]);

  useEffect(() => {
    fetchData();
    fetchItineraires();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/prix');
      setPrixData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchItineraires = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/itineraires');
      setItineraires(response.data);
    } catch (error) {
      console.error('Error fetching itineraires:', error);
    }
  };

  const handleEdit = (prix) => {
    setEditingPrix(prix);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;
      await axios.delete(`http://localhost:8000/api/prix/${id}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting prix:', error);
    }
  };

  const handleFormSubmit = () => {
    fetchData();
    setIsFormOpen(false);
    setEditingPrix(null);
  };

  const PrixForm = ({ prix, itineraires, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      prix_matin: '',
      prix_soir: '',
      arret: '',
      destination: '',
      itineraire_id: ''
    });
  
    useEffect(() => {
      if (prix) {
        setFormData({
          prix_matin: prix.prix_matin,
          prix_soir: prix.prix_soir,
          arret: prix.arret,
          destination: prix.destination,
          itineraire_id: prix.itineraire_id
        });
      }
    }, [prix]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Configuration de base pour toutes les requêtes
    const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;

    if (prix) {
      // Modification existante
      await axios.put(`http://localhost:8000/api/prix/${prix.id}`, formData,
        {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json'
        }
      }
      );
    } else {
      // Nouvelle création
      await axios.post('http://localhost:8000/api/prix', formData,
        {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json'
        }
      }
      );
    }
    
    onSubmit(); // Rafraîchir les données après succès
    
  } catch (error) {
    console.error('Erreur:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    alert(
      error.response?.data?.message || 
      "Une erreur est survenue. Voir la console pour plus de détails."
    );
  }
};
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {prix ? 'Modifier Tarif' : 'Ajouter un Tarif'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itineraire_id">
                  Itinéraire*
                </label>
                <select
                  id="itineraire_id"
                  name="itineraire_id"
                  value={formData.itineraire_id}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Sélectionner un itinéraire</option>
                  {itineraires.map(it => (
                    <option key={it.id} value={it.id}>{it.nom}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="arret">
                  Arrêt*
                </label>
                <input
                  type="text"
                  id="arret"
                  name="arret"
                  value={formData.arret}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination">
                  Destination*
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prix_matin">
                    Prix Matin (MAD)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="prix_matin"
                    name="prix_matin"
                    value={formData.prix_matin}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prix_soir">
                    Prix Soir (MAD)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="prix_soir"
                    name="prix_soir"
                    value={formData.prix_soir}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {prix ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const PrixTable = ({ title, data, priceField, bgColor, borderColor, textColor }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className={`${bgColor} px-6 py-3 border-b ${borderColor}`}>
          <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrêt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix (MAD)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.filter(item => item[priceField]).length > 0 ? (
                data.filter(item => item[priceField]).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.arret}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.destination}</td>
                   <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textColor}`}>
  {typeof item[priceField] === 'number' ? item[priceField].toFixed(2) : item[priceField]}
</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    {`Aucun tarif ${title.toLowerCase()} trouvé`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 ml-64">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Tarifs</h1>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Tableaux des Prix</h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Ajouter un Tarif
          </button>
        </div>

        {isFormOpen && (
          <PrixForm 
            prix={editingPrix} 
            itineraires={itineraires}
            onClose={() => {
              setIsFormOpen(false);
              setEditingPrix(null);
            }} 
            onSubmit={handleFormSubmit}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PrixTable 
            title="Prix du Matin" 
            data={prixData} 
            priceField="prix_matin" 
            bgColor="bg-blue-100" 
            borderColor="border-blue-200" 
            textColor="text-blue-600" 
          />
          <PrixTable 
            title="Prix du Soir" 
            data={prixData} 
            priceField="prix_soir" 
            bgColor="bg-purple-100" 
            borderColor="border-purple-200" 
            textColor="text-purple-600" 
          />
        </div>
      </div>
    </div>
  );
};

export default PrixManager;