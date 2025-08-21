import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';


const FileAttente = ({ fileAttente, setFileAttente, selectedPlaces, selectedVoiture, refreshPlaces, showSearch, setShowSearch, onAddClient }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    nbre_place: 1,
    contact: '',
    date: new Date().toISOString().split('T')[0],
    heure: '12:00'
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
      const response = await axios.get('/file-attente');
      if (setFileAttente) {
        setFileAttente(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
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
        await axios.put(`/file-attente/${currentClient.id}`, formData, {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      } else {
        await axios.post('/file-attente', formData, {
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
      if (refreshPlaces) refreshPlaces();
      setFormData({
        nom: '',
        nbre_place: 1,
        contact: '',
        date: new Date().toISOString().split('T')[0],
        heure: '12:00'
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
      heure: client.heure
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
  
      await axios.delete(`/file-attente/${id}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
  
      fetchClients();
       if (refreshPlaces) refreshPlaces();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleAttribution = async (client) => {
    try {
      if (!selectedVoiture || selectedPlaces.length === 0) {
        alert("Veuillez sélectionner une voiture et des places dans PlaceList");
        return;
      }

      // 1. Attribuer les places (comme dans PlaceList)
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      const csrfToken = csrfResponse.data.csrfToken;
      
      const response = await axios.post('/places', {
        voiture_id: selectedVoiture,
        places: selectedPlaces.map(p => parseInt(p, 10)),
        nom: client.nom,
        contact: client.contact,
        arret: '',
        payment_type: 'cash',
        mobile_money_operator: null
      }, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        // 2. Supprimer le client de la file d'attente
        await handleDelete(client.id);
         if (refreshPlaces) refreshPlaces();
        
        // 3. Rafraîchir les places si refreshPlaces est fourni
        if (refreshPlaces) {
          await refreshPlaces();
       }
        
        alert(`Client ${client.nom} attribué avec succès aux places sélectionnées`);
      } else {
        throw new Error(response.data.message || "Erreur lors de l'attribution");
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution:', error);
      alert(`Erreur: ${error.message}`);
    }
  };


  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-1xl font-semibold">File d'attente</h2>
        <button
          onClick={() => setOpenDialog(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter un client
        </button>
      </div>

      <div className="space-y-3">
        {fileAttente.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun client en attente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Places</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Heure</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fileAttente.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{client.nom}</div>
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

      {/* Dialog pour ajouter/modifier (inchangé) */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {currentClient ? 'Modifier client' : 'Ajouter un client'}
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default FileAttente;