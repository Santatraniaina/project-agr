import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const VilleForm = ({ ville, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        nom: '',
        numero_route: '',
        enable: true
    });

    useEffect(() => {
        if (ville) {
            setFormData({
                nom: ville.nom,
                numero_route: ville.numero_route || '',
                enable: ville.enable
            });
        }
    }, [ville]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
             const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                  });
            
                  const csrfToken = csrfResponse.data.csrfToken;


            if (ville) {
                await axios.put(`http://localhost:8000/api/villes/${ville.id}`, formData, {
                    withCredentials: true,
                    headers: {
                      'X-CSRF-TOKEN': csrfToken,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json'
                    }
                  });

            } else {
                await axios.post('http://localhost:8000/api/villes', formData,
                     {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
                );
            }
            onSubmit();
        } catch (error) {
            console.error('Error saving ville:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                 <Sidebar />
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {ville ? 'Modifier Ville' : 'Ajouter une Ville'}
                    </h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nom">
                                Nom de la ville*
                            </label>
                            <input
                                type="text"
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numero_route">
                                Numéro de route
                            </label>
                            <input
                                type="text"
                                id="numero_route"
                                name="numero_route"
                                value={formData.numero_route}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="enable"
                                    checked={formData.enable}
                                    onChange={handleChange}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="text-gray-700">Activé</span>
                            </label>
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
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {ville ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VilleForm;