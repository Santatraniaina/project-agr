import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Simulator.css';

const GestionDepenses = ({ selectedYear, selectedMonth, onDepensesUpdate, depenses: parentDepenses }) => {
    const [depenses, setDepenses] = useState([]);
    const [categoriesDepenses, setCategoriesDepenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Log props for debugging
    useEffect(() => {
        console.log('GestionDepenses props:', { selectedYear, selectedMonth, parentDepenses });
    }, [selectedYear, selectedMonth, parentDepenses]);
    
    // États pour le formulaire
    const [showForm, setShowForm] = useState(false);
    const [editingDepense, setEditingDepense] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        categorie_depense_id: '',
        montant: '',
        commentaire: '',
        pieces_jointes: null
    });

    // États pour la recherche et filtrage
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    const API_BASE_URL = 'http://localhost:8000/api';

    // Charger les catégories de dépenses
    useEffect(() => {
        fetchCategories();
    }, []);

    // Charger les dépenses si elles ne sont pas fournies par le parent
    useEffect(() => {
        // Si les dépenses sont fournies par le parent, les utiliser
        if (parentDepenses) {
            setDepenses(parentDepenses);
        } else {
            // Sinon, charger les dépenses depuis l'API
            fetchDepenses();
        }
    }, [selectedYear, selectedMonth, parentDepenses]);

    const fetchCategories = async () => {
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
            setCategoriesDepenses(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement des catégories:", err);
            setError('Erreur chargement catégories.');
        }
    };

    const fetchDepenses = async () => {
        // Si les dépenses sont fournies par le parent, ne pas les récupérer
        if (parentDepenses) {
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

            // Si selectedYear et selectedMonth sont fournis, filtrer par année et mois
            let depensesUrl = `${API_BASE_URL}/depenses`;
            if (selectedYear && selectedMonth) {
                depensesUrl += `?annee=${selectedYear}&mois=${selectedMonth}`;
            }

            const response = await axios.get(depensesUrl, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });
            setDepenses(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des dépenses.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, pieces_jointes: files }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            categorie_depense_id: categoriesDepenses.length > 0 ? categoriesDepenses[0].id : '',
            montant: '',
            commentaire: '',
            pieces_jointes: null
        });
        setEditingDepense(null);
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

            const formDataToSend = new FormData();
            formDataToSend.append('date', formData.date);
            formDataToSend.append('categorie_depense_id', formData.categorie_depense_id);
            formDataToSend.append('montant', formData.montant);
            formDataToSend.append('commentaire', formData.commentaire);
            
            if (formData.pieces_jointes) {
                for (let i = 0; i < formData.pieces_jointes.length; i++) {
                    formDataToSend.append('pieces_jointes[]', formData.pieces_jointes[i]);
                }
            }

            if (editingDepense) {
                await axios.post(`${API_BASE_URL}/depenses/${editingDepense.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-HTTP-Method-Override': 'PUT'
                    },
                    withCredentials: true
                });
            } else {
                await axios.post(`${API_BASE_URL}/depenses`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    withCredentials: true
                });
            }
            
            await fetchDepenses();
            setShowForm(false);
            resetForm();
            
            // Appeler le callback de mise à jour si fourni
            if (onDepensesUpdate) {
                onDepensesUpdate();
            }
            
        } catch (err) {
            setError(editingDepense ? 'Erreur modification dépense.' : 'Erreur ajout dépense.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (depense) => {
        setEditingDepense(depense);
        setFormData({
            date: depense.date ? new Date(depense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            categorie_depense_id: depense.categorie_depense_id || '',
            montant: depense.montant || '',
            commentaire: depense.commentaire || '',
            pieces_jointes: null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
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

            await axios.delete(`${API_BASE_URL}/depenses/${id}`, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });

            await fetchDepenses();
            
            // Appeler le callback de mise à jour si fourni
            if (onDepensesUpdate) {
                onDepensesUpdate();
            }
            
        } catch (err) {
            setError('Erreur lors de la suppression.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        resetForm();
    };

    // Filtrage des dépenses
    const filteredDepenses = depenses.filter(depense => {
        // Si selectedYear et selectedMonth sont fournis, filtrer par année et mois
        const matchesYearMonth = selectedYear && selectedMonth ?
            new Date(depense.date).getFullYear() === selectedYear &&
            new Date(depense.date).getMonth() + 1 === selectedMonth :
            true;
        
        const matchesSearch = depense.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            depense.categorie_depense?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !selectedCategory || depense.categorie_depense_id == selectedCategory;
        
        const matchesDateRange = (!dateRange.start || new Date(depense.date) >= new Date(dateRange.start)) &&
                               (!dateRange.end || new Date(depense.date) <= new Date(dateRange.end));
        
        return matchesYearMonth && matchesSearch && matchesCategory && matchesDateRange;
    });

    const totalMontant = filteredDepenses.reduce((sum, depense) => sum + parseFloat(depense.montant || 0), 0);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="simulator p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Dépenses</h2>
                <p className="text-gray-600">Gérez toutes vos dépenses de manière centralisée</p>
            </div>
            
            {/* Message de test pour vérifier le rendu */}
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Test de rendu du composant GestionDepenses</p>
                <p>Si vous voyez ce message, le composant est bien rendu.</p>
                <p>Props reçues: Année={selectedYear}, Mois={selectedMonth}, Dépenses={depenses?.length || 0}</p>
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
                    Ajouter une Dépense
                </button>
            </div>
            
            {/* Formulaire */}
            {showForm && (
                <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        {editingDepense ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                <select
                                    name="categorie_depense_id"
                                    value={formData.categorie_depense_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categoriesDepenses.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (Ar)</label>
                            <input
                                type="number"
                                name="montant"
                                value={formData.montant}
                                onChange={handleInputChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                            <textarea
                                name="commentaire"
                                value={formData.commentaire}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Description de la dépense..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pièces Jointes</label>
                            <input
                                type="file"
                                name="pieces_jointes"
                                onChange={handleInputChange}
                                multiple
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Vous pouvez sélectionner plusieurs fichiers</p>
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
                                {loading ? 'Enregistrement...' : (editingDepense ? 'Modifier' : 'Ajouter')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Filtres et recherche */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Filtres</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher par commentaire ou catégorie..."
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Toutes les catégories</option>
                            {categoriesDepenses.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nom}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
            </div>
            
            {/* Statistiques */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border">
                    <h4 className="text-sm font-medium text-blue-800">Total Dépenses</h4>
                    <p className="text-2xl font-bold text-blue-900">{totalMontant.toLocaleString()} Ar</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border">
                    <h4 className="text-sm font-medium text-green-800">Nombre de Dépenses</h4>
                    <p className="text-2xl font-bold text-green-900">{filteredDepenses.length}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border">
                    <h4 className="text-sm font-medium text-purple-800">Moyenne par Dépense</h4>
                    <p className="text-2xl font-bold text-purple-900">
                        {filteredDepenses.length > 0 ? (totalMontant / filteredDepenses.length).toLocaleString() : 0} Ar
                    </p>
                </div>
            </div>
            
            {/* Liste des dépenses */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Liste des Dépenses</h3>
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
                        {filteredDepenses.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-2">Aucune dépense trouvée</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pièces Jointes</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDepenses.map((depense) => (
                                        <tr key={depense.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(depense.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {depense.categorie_depense?.nom || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                {parseFloat(depense.montant).toLocaleString()} Ar
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {depense.commentaire || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {depense.pieces_jointes && depense.pieces_jointes.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {depense.pieces_jointes.slice(0, 2).map((pj, index) => (
                                                            <a
                                                                key={index}
                                                                href={pj.path || pj.url || pj}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 text-xs block"
                                                            >
                                                                {pj.nom_original || pj.nom || `Fichier ${index + 1}`}
                                                            </a>
                                                        ))}
                                                        {depense.pieces_jointes.length > 2 && (
                                                            <span className="text-gray-500 text-xs">
                                                                +{depense.pieces_jointes.length - 2} autres
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Aucune</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(depense)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                                        title="Modifier"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(depense.id)}
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

export default GestionDepenses;
