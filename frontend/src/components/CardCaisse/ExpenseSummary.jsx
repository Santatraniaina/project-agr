import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseSummary = () => {
    const [depenses, setDepenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const API_BASE_URL = 'http://localhost:8000/api';

    useEffect(() => {
        const fetchRecentExpenses = async () => {
            setError('');
            setLoading(true);
            
            try {
                const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });
                const csrfToken = csrfResponse.data.csrfToken;

                // Get expenses for the current month
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

        fetchRecentExpenses();
    }, [selectedMonth, selectedYear]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Calculate total expenses for the month
    const totalExpenses = depenses.reduce((sum, depense) => sum + parseFloat(depense.montant || 0), 0);

    return (
        <div className="expense-summary">
            <h3 className="text-lg font-semibold mb-3">Résumé des Dépenses</h3>
            
            {/* Month/Year selector */}
            <div className="mb-3 flex gap-3 items-center">
                <div>
                    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Mois:</label>
                    <select 
                        id="month-select" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                        className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm text-sm"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => 
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('fr-FR', { month: 'short' })}</option>
                        )}
                    </select>
                </div>
                <div>
                    <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">Année:</label>
                    <input 
                        type="number" 
                        id="year-select" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                        className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm text-sm" 
                    />
                </div>
            </div>

            {/* Total expenses */}
            <div className="mb-3 p-3 bg-red-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">Total Dépenses:</span>
                    <span className="text-xl font-bold text-red-900">{totalExpenses.toLocaleString()} Ar</span>
                </div>
            </div>

            {/* Recent expenses list */}
            <div className="max-h-60 overflow-y-auto">
                {loading && <p className="text-gray-500">Chargement des dépenses...</p>}
                {!loading && error && <p className="error-message text-red-500">{error}</p>}
                {!loading && !error && depenses.length === 0 && (
                    <p className="text-gray-500">Aucune dépense pour ce mois.</p>
                )}
                {!loading && !error && depenses.length > 0 && (
                    <ul className="space-y-2">
                        {depenses.slice(0, 10).map((depense) => (
                            <li key={depense.id} className="border-b border-gray-200 pb-2">
                                <div className="flex justify-between">
                                    <span className="font-medium text-sm">{depense.categorie_depense?.nom || 'N/A'}</span>
                                    <span className="font-bold text-red-700">{parseFloat(depense.montant || 0).toLocaleString()} Ar</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{formatDate(depense.date)}</span>
                                    <span>{depense.commentaire ? depense.commentaire.substring(0, 20) + (depense.commentaire.length > 20 ? '...' : '') : ''}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-3 text-center">
                <button 
                    onClick={() => window.location.hash = '#depenses'}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Voir toutes les dépenses →
                </button>
            </div>
        </div>
    );
};

export default ExpenseSummary;