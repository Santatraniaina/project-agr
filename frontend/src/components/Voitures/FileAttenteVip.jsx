import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FileAttenteVip = ({ fileAttente, setFileAttente, selectedPlaces, selectedVoiture, refreshPlaces, showSearch, setShowSearch, onAddClient }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    nbre_place: 1,
    contact: '',
    date: new Date().toISOString().split('T')[0],
    heure: '12:00',
    is_vip: true
  });
  const [timeStep, setTimeStep] = useState(() => {
    try {
      const minutes = parseInt(localStorage.getItem('time_step_minutes') || '5', 10);
      const clamped = Math.min(Math.max(minutes, 1), 60);
      return clamped * 60; // secondes
    } catch { return 300; }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  // Écouter les changements de fileAttente depuis le parent
  useEffect(() => {
    if (fileAttente && Array.isArray(fileAttente)) {
      // Synchroniser avec l'état local si nécessaire
      // Cette logique peut être ajustée selon les besoins
    }
  }, [fileAttente]);

  // Fonction pour ajouter un client directement (utilisée par onReportToQueue)
  const addClientToQueue = useCallback((client) => {
    if (setFileAttente) {
      setFileAttente(prev => [...prev, client]);
    }
  }, [setFileAttente]);

  // Exposer la fonction au parent si nécessaire
  useEffect(() => {
    if (onAddClient) {
      // Exposer la fonction d'ajout
      onAddClient.addClientToQueue = addClientToQueue;
    }
  }, [onAddClient, addClientToQueue]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/file-attente-vip');
      if (setFileAttente) {
        setFileAttente(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients VIP:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      const csrfToken = csrfResponse.data.csrfToken;
  
      if (currentClient) {
        await axios.put(`/file-attente-vip/${currentClient.id}`, formData, {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      } else {
        await axios.post('/file-attente-vip', formData, {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      }
      
      setOpenDialog(false);
      setCurrentClient(null);
      fetchClients();
      setFormData({
        nom: '',
        nbre_place: 1,
        contact: '',
        date: new Date().toISOString().split('T')[0],
        heure: '12:00',
        is_vip: true
      });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };
  
  const handleEdit = (client) => {
    setCurrentClient(client);
    setFormData({
      nom: client.nom,
      nbre_place: client.nbre_place,
      contact: client.contact,
      date: client.date.split('T')[0],
      heure: client.heure,
      is_vip: true
    });
    setOpenDialog(true);
  };
  
  const handleDelete = async (id) => {
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      const csrfToken = csrfResponse.data.csrfToken;
  
      await axios.delete(`/file-attente-vip/${id}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
  
      fetchClients();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleAttribution = async (client) => {
    try {
      // Debug avancé
      console.log("Début attribution - données reçues:", {
        selectedVoiture,
        selectedPlaces,
        client: {
          id: client.id,
          nom: client.nom,
          nbre_place: client.nbre_place
        }
      });
  
      // Validation robuste des inputs
      if (!selectedVoiture || isNaN(selectedVoiture)) {
        throw new Error("ID de voiture VIP invalide");
      }
  
      if (!Array.isArray(selectedPlaces) || selectedPlaces.length === 0) {
        throw new Error("Aucune place VIP sélectionnée");
      }
  
      // Vérification du nombre de places
      
  
      // Préparation du payload avec validation de type
      const payload = {
        voiture_id: Number(selectedVoiture),
        PlaceVips: selectedPlaces.map(p => {
          const num = Number(p);
          if (isNaN(num) || num < 1 || num > 10) {
            throw new Error(`Numéro de place invalide: ${p}`);
          }
          return num;
        }),
        nom: client.nom.trim(),
        contact: client.contact.trim(),
        client_id: client.id // Ajouté pour traçabilité
      };
  
      console.log("Envoi payload vérifié:", JSON.stringify(payload, null, 2));
  
      // Récupération du token CSRF
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
  
      if (!csrfResponse.data?.csrfToken) {
        throw new Error("Échec de récupération du token CSRF");
      }
  
      // Envoi de la requête
      const response = await axios.post('http://localhost:8000/api/places-vip', payload, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfResponse.data.csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000 // Timeout de 5 secondes
      });
  
      // Gestion de la réponse
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Réponse invalide du serveur");
      }
      
      // Actions post-attribution
      await handleDelete(client.id);
      
      if (refreshPlaces) {
        await refreshPlaces();
      }
      
      
      // Feedback utilisateur
      alert(`Succès: ${client.nom} attribué aux places ${selectedPlaces.join(', ')}`);
      window.location.reload();
      
  
    } catch (error) {
      console.error("Erreur complète:", {
        error: error.response?.data || error.message,
        config: error.config?.data
      });
  
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join('\n')
        : error.message;
  
      alert(`Échec de l'attribution:\n${errorMessage}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-purple-800">File d'attente VIP</h2>
        <button
          onClick={() => setOpenDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Ajouter un client VIP
        </button>
      </div>

      <div className="space-y-3">
        {fileAttente.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun client VIP en attente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Places</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Date/Heure</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fileAttente.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-purple-700">{client.nom} <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full ml-2">VIP</span></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.nbre_place}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.date} à {client.heure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleAttribution(client)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Attribuer
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-purple-800">
              {currentClient ? 'Modifier client VIP' : 'Ajouter un client VIP'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de places</label>
                  <input
                    type="number"
                    name="nbre_place"
                    min="1"
                    value={formData.nbre_place}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure</label>
                  <input
                    type="time"
                    name="heure"
                    value={formData.heure}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    step={timeStep}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDialog(false);
                    setCurrentClient(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {currentClient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAttenteVip;