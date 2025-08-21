import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepenseList from './DepenseList';
import './Simulator.css';

const DepenseManager = () => {
    const [depenses, setDepenses] = useState([]);
    const [categoriesDepenses, setCategoriesDepenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // États pour le formulaire de dépense
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const [currentDepense, setCurrentDepense] = useState(null);
    const [dateDepense, setDateDepense] = useState(new Date().toISOString().split('T')[0]);
    const [categorieDepenseId, setCategorieDepenseId] = useState('');
    const [montantDepense, setMontantDepense] = useState('');
    const [commentaireDepense, setCommentaireDepense] = useState('');
    const [piecesJointesDepense, setPiecesJointesDepense] = useState(null);

    const API_BASE_URL = 'http://localhost:8000/api';

    // Récupérer les catégories de dépenses au montage
    useEffect(() => {
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
                console.error("Erreur lors du chargement des catégories de dépenses:", err);
                setError('Erreur chargement catégories.');
            }
        };
        fetchCategories();
    }, []);

    // Pré-remplir le formulaire si on édite une dépense
    useEffect(() => {
        if (currentDepense) {
            setDateDepense(currentDepense.date ? new Date(currentDepense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setCategorieDepenseId(currentDepense.categorie_depense_id || '');
            setMontantDepense(currentDepense.montant || '');
            setCommentaireDepense(currentDepense.commentaire || '');
            setPiecesJointesDepense(null);
            setShowDepenseForm(true);
        } else {
            setDateDepense(new Date().toISOString().split('T')[0]);
            setCategorieDepenseId(categoriesDepenses.length > 0 ? categoriesDepenses[0].id : '');
            setMontantDepense('');
            setCommentaireDepense('');
            setPiecesJointesDepense(null);
        }
    }, [currentDepense, categoriesDepenses]);

    // Récupérer les dépenses lorsque le mois/année change
    useEffect(() => {
        const fetchDepenses = async () => {
            setError('');
            setLoading(true);
            
            try {
                const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });
                const csrfToken = csrfResponse.data.csrfToken;

                const depensesUrl = `${API_BASE_URL}/depenses?annee=${selectedYear}&mois=${selectedMonth}`;
                const depensesRes = await axios.get(depensesUrl, {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    withCredentials: true
                });
                setDepenses(depensesRes.data);
            } catch (err) {
                setError('Erreur lors du chargement des dépenses.');
                console.error("Erreur dépenses:", err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedMonth && selectedYear) {
            fetchDepenses();
        }
    }, [selectedMonth, selectedYear]);

    const handleDepenseInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setPiecesJointesDepense(files);
        } else {
            switch (name) {
                case 'dateDepense': setDateDepense(value); break;
                case 'categorieDepenseId': setCategorieDepenseId(value); break;
                case 'montantDepense': setMontantDepense(value); break;
                case 'commentaireDepense': setCommentaireDepense(value); break;
                default: break;
            }
        }
    };

    const handleDepenseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            const formData = new FormData();
            formData.append('date', dateDepense);
            formData.append('categorie_depense_id', categorieDepenseId);
            formData.append('montant', montantDepense);
            formData.append('commentaire', commentaireDepense);
            
            if (piecesJointesDepense) {
                for (let i = 0; i < piecesJointesDepense.length; i++) {
                    formData.append('pieces_jointes[]', piecesJointesDepense[i]);
                }
            }

            if (currentDepense) {
                await axios.post(`${API_BASE_URL}/depenses/${currentDepense.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-HTTP-Method-Override': 'PUT'
                    },
                    withCredentials: true
                });
            } else {
                await axios.post(`${API_BASE_URL}/depenses`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    withCredentials: true
                });
            }
            
            setCurrentDepense(null);
            await fetchDepenses();
            
        } catch (err) {
            setError(currentDepense ? 'Erreur modification dépense.' : 'Erreur ajout dépense.');
            console.error(err);
        } finally {
            setLoading(false);
            handleCancelDepenseForm();
        }
    };

    const handleCancelDepenseForm = () => {
        setShowDepenseForm(false);
        setCurrentDepense(null);
        setDateDepense(new Date().toISOString().split('T')[0]);
        setCategorieDepenseId(categoriesDepenses.length > 0 ? categoriesDepenses[0].id : '');
        setMontantDepense('');
        setCommentaireDepense('');
        setPiecesJointesDepense(null);
    };

    const handleEditDepense = (depense) => {
        setCurrentDepense(depense);
        setShowDepenseForm(true);
    };

    const handleDeleteDepense = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
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
                
            } catch (err) {
                setError('Erreur lors de la suppression de la dépense.');
                console.error("Erreur suppression dépense:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="simulator p-4">
            <h2 className="text-xl font-semibold mb-4">Gestion des Dépenses</h2>

            {/* Sélecteur de Mois/Année */}
            <div className="mb-4 flex gap-4 items-center">
                <div>
                    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Mois:</label>
                    <select id="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('fr-FR', { month: 'long' })}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">Année:</label>
                    <input type="number" id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>

            {/* Section Dépenses */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Dépenses du Mois</h3>
                    <button onClick={() => { setShowDepenseForm(true); setCurrentDepense(null); }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Ajouter Dépense
                    </button>
                </div>

                {/* Formulaire d'ajout/modification de dépense */}
                {showDepenseForm && (
                    <div className="p-4 border rounded-md bg-gray-50 mb-4">
                        <h4 className="text-md font-semibold mb-3">{currentDepense ? 'Modifier la Dépense' : 'Ajouter une Dépense'}</h4>
                        <form onSubmit={handleDepenseSubmit} className="space-y-3">
                            <div>
                                <label htmlFor="dateDepense" className="block text-sm font-medium text-gray-700">Date:</label>
                                <input type="date" id="dateDepense" name="dateDepense" value={dateDepense} onChange={handleDepenseInputChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="categorieDepenseId" className="block text-sm font-medium text-gray-700">Catégorie:</label>
                                <select id="categorieDepenseId" name="categorieDepenseId" value={categorieDepenseId} onChange={handleDepenseInputChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                    <option value="">Sélectionner une catégorie</option>
                                    {categoriesDepenses.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="montantDepense" className="block text-sm font-medium text-gray-700">Montant (Ar):</label>
                                <input type="number" id="montantDepense" name="montantDepense" value={montantDepense} onChange={handleDepenseInputChange} required step="0.01" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="commentaireDepense" className="block text-sm font-medium text-gray-700">Commentaire:</label>
                                <textarea id="commentaireDepense" name="commentaireDepense" value={commentaireDepense} onChange={handleDepenseInputChange} rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div>
                                <label htmlFor="piecesJointesDepense" className="block text-sm font-medium text-gray-700">Pièces Jointes (Optionnel):</label>
                                <input type="file" id="piecesJointesDepense" name="piecesJointesDepense" onChange={handleDepenseInputChange} multiple className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {piecesJointesDepense && piecesJointesDepense.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>Fichiers sélectionnés :</p>
                                        <ul>
                                            {Array.from(piecesJointesDepense).map((file, index) => (
                                                <li key={index}>- {file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Vous pouvez sélectionner plusieurs fichiers.</p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={handleCancelDepenseForm} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                                    Annuler
                                </button>
                                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>
                                    {loading ? 'Enregistrement...' : (currentDepense ? 'Modifier' : 'Ajouter')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading && <p>Chargement des dépenses...</p>}
                {!loading && error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <DepenseList depenses={depenses} onEdit={handleEditDepense} onDelete={handleDeleteDepense} />
                )}
            </div>
        </div>
    );
};

export default DepenseManager;