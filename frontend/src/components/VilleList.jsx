import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VilleForm from './VilleForm';
import Sidebar from './Sidebar';

const VilleList = () => {
    const [villes, setVilles] = useState([]);
    const [editingVille, setEditingVille] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchVilles();
    }, []);

    const fetchVilles = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/villes');
            setVilles(response.data);
        } catch (error) {
            console.error('Error fetching villes:', error);
        }
    };

    const handleEdit = (ville) => {
        setEditingVille(ville);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        try {
          const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
                             withCredentials: true,
                             headers: { 'Accept': 'application/json' }
                           });
                     
                           const csrfToken = csrfResponse.data.csrfToken;
         
          await axios.delete(`http://localhost:8000/api/villes/${id}`,  {
            withCredentials: true,
            headers: {
              'X-CSRF-TOKEN': csrfToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          fetchVilles();
        } catch (error) {
          console.error('Error deleting ville:', error.response?.data || error.message);
        }
      };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingVille(null);
    };

    const handleFormSubmit = () => {
        fetchVilles();
        handleFormClose();
    };

    return (
        <div className="container mx-auto px-4 py-8">
             <Sidebar />
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestion des Villes</h1>
            
            <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-6"
            >
                Ajouter une Ville
            </button>

            {isFormOpen && (
                <VilleForm 
                    ville={editingVille} 
                    onClose={handleFormClose} 
                    onSubmit={handleFormSubmit}
                />
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {villes.map((ville) => (
                            <tr key={ville.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ville.nom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ville.numero_route || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ville.enable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {ville.enable ? 'Activé' : 'Désactivé'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(ville)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ville.id)}
                                        className="text-red-600 hover:text-red-900"
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
    );
};

export default VilleList;