import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Simulator.css';

const GestionCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ nom: '' });

    const API_BASE_URL = 'http://localhost:8000/api';

    // Charger les catégories au montage
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            const response = await axios.get(`${API_BASE_URL}/categories-depenses`, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });
            setCategories(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des catégories.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, nom: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            if (editingCategory) {
                const response = await axios.put(`${API_BASE_URL}/categories-depenses/${editingCategory.id}`, formData, {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    withCredentials: true
                });
                setCategories(categories.map(cat => cat.id === editingCategory.id ? response.data : cat));
            } else {
                const response = await axios.post(`${API_BASE_URL}/categories-depenses`, formData, {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    withCredentials: true
                });
                setCategories([...categories, response.data]);
            }

            setShowForm(false);
            setEditingCategory(null);
            setFormData({ nom: '' });
        } catch (err) {
            setError(editingCategory ? 'Erreur lors de la modification.' : 'Erreur lors de l\'ajout.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ nom: category.nom });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            await axios.delete(`${API_BASE_URL}/categories-depenses/${id}`, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });

            setCategories(categories.filter(cat => cat.id !== id));
        } catch (err) {
            setError('Erreur lors de la suppression.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ nom: '' });
    };

    return (
        <div className="simulator p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Catégories</h2>
                <p className="text-gray-600">Gérez les catégories de dépenses utilisées dans votre système</p>
            </div>

            {/* Bouton d'ajout */}
            <div className="mb-6">
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter une Catégorie
                </button>
            </div>

            {/* Formulaire */}
            {showForm && (
                <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la catégorie</label>
                            <input
                                type="text"
                                value={formData.nom}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: Carburant, Salaires, Maintenance..."
                            />
                        </div>
                        
                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50"
                            >
                                {loading ? 'Enregistrement...' : (editingCategory ? 'Modifier' : 'Ajouter')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des catégories */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Catégories Existantes</h3>
                </div>
                
                {loading && (
                    <div className="p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Chargement...</p>
                    </div>
                )}
                
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
                
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        {categories.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="mt-2">Aucune catégorie trouvée</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {category.nom}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                                        title="Modifier"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                        title="Supprimer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionCategories;