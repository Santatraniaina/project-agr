import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaMoneyBillWave, FaChartLine, FaCalendarAlt, FaTag } from 'react-icons/fa';

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([
        {
            id: 1,
            description: 'Carburant pour véhicule TAA-123-A',
            amount: 150000,
            category: 'Carburant',
            cooperative: 'Coopérative Manakara',
            date: '2024-02-15',
            status: 'Approuvé',
            vehicle: 'TAA-123-A',
            notes: 'Plein complet pour trajet Manakara-Fianarantsoa'
        },
        {
            id: 2,
            description: 'Maintenance véhicule TAA-456-B',
            amount: 250000,
            category: 'Maintenance',
            cooperative: 'Coopérative Fianarantsoa',
            date: '2024-02-10',
            status: 'En attente',
            vehicle: 'TAA-456-B',
            notes: 'Réparation système de freinage'
        },
        {
            id: 3,
            description: 'Achat pneus',
            amount: 180000,
            category: 'Équipement',
            cooperative: 'Coopérative Manakara',
            date: '2024-02-08',
            status: 'Approuvé',
            vehicle: 'TAA-123-A',
            notes: '4 pneus Michelin pour véhicule principal'
        }
    ]);
    
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCooperative, setFilterCooperative] = useState('all');

    const expenseCategories = ['Carburant', 'Maintenance', 'Équipement', 'Salaires', 'Administratif', 'Autres'];
    const expenseStatuses = ['En attente', 'Approuvé', 'Rejeté', 'Payé'];
    const cooperatives = ['Coopérative Manakara', 'Coopérative Fianarantsoa', 'Coopérative Antananarivo'];

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.notes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
        const matchesCooperative = filterCooperative === 'all' || expense.cooperative === filterCooperative;
        
        return matchesSearch && matchesCategory && matchesStatus && matchesCooperative;
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const approvedExpenses = expenses.filter(expense => expense.status === 'Approuvé').reduce((sum, expense) => sum + expense.amount, 0);
    const pendingExpenses = expenses.filter(expense => expense.status === 'En attente').reduce((sum, expense) => sum + expense.amount, 0);

    const handleAddExpense = () => {
        setEditingExpense(null);
        setShowForm(true);
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setShowForm(true);
    };

    const handleDeleteExpense = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const expenseData = {
            description: formData.get('description'),
            amount: parseInt(formData.get('amount')),
            category: formData.get('category'),
            cooperative: formData.get('cooperative'),
            date: formData.get('date'),
            status: formData.get('status'),
            vehicle: formData.get('vehicle'),
            notes: formData.get('notes')
        };

        if (editingExpense) {
            setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...expenseData, id: e.id } : e));
        } else {
            setExpenses([...expenses, { ...expenseData, id: Date.now() }]);
        }
        
        setShowForm(false);
        setEditingExpense(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approuvé': return 'bg-green-100 text-green-800';
            case 'En attente': return 'bg-yellow-100 text-yellow-800';
            case 'Rejeté': return 'bg-red-100 text-red-800';
            case 'Payé': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Carburant': return <FaMoneyBillWave className="text-orange-600" />;
            case 'Maintenance': return <FaChartLine className="text-blue-600" />;
            case 'Équipement': return <FaTag className="text-purple-600" />;
            case 'Salaires': return <FaMoneyBillWave className="text-green-600" />;
            case 'Administratif': return <FaCalendarAlt className="text-gray-600" />;
            default: return <FaMoneyBillWave className="text-gray-600" />;
        }
    };

    if (showForm) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
                    </h2>
                    <button
                        onClick={() => setShowForm(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                defaultValue={editingExpense?.description || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Description de la dépense"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Montant (Ar)
                            </label>
                            <input
                                type="number"
                                name="amount"
                                defaultValue={editingExpense?.amount || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="150000"
                                min="0"
                                step="1000"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catégorie
                            </label>
                            <select
                                name="category"
                                defaultValue={editingExpense?.category || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {expenseCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coopérative
                            </label>
                            <select
                                name="cooperative"
                                defaultValue={editingExpense?.cooperative || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner une coopérative</option>
                                {cooperatives.map(coop => (
                                    <option key={coop} value={coop}>{coop}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                defaultValue={editingExpense?.date || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                name="status"
                                defaultValue={editingExpense?.status || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner un statut</option>
                                {expenseStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Véhicule
                            </label>
                            <input
                                type="text"
                                name="vehicle"
                                defaultValue={editingExpense?.vehicle || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="TAA-123-A"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                defaultValue={editingExpense?.notes || ''}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Notes supplémentaires..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {editingExpense ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaMoneyBillWave className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Dépenses</p>
                            <p className="text-2xl font-bold text-gray-900">{totalExpenses.toLocaleString()} Ar</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaMoneyBillWave className="text-green-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Approuvées</p>
                            <p className="text-2xl font-bold text-gray-900">{approvedExpenses.toLocaleString()} Ar</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FaMoneyBillWave className="text-yellow-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">En Attente</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingExpenses.toLocaleString()} Ar</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FaChartLine className="text-purple-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Nombre</p>
                            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre d'outils */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une dépense..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Toutes les catégories</option>
                                {expenseCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            {expenseStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        
                        <select
                            value={filterCooperative}
                            onChange={(e) => setFilterCooperative(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Toutes les coopératives</option>
                            {cooperatives.map(coop => (
                                <option key={coop} value={coop}>{coop}</option>
                            ))}
                        </select>
                        
                        <button
                            onClick={handleAddExpense}
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="mr-2" />
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste des dépenses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dépense
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Montant
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Catégorie
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coopérative
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {getCategoryIcon(expense.category)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {expense.description}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Véhicule: {expense.vehicle}
                                                </div>
                                                {expense.notes && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {expense.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {expense.amount.toLocaleString()} Ar
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {expense.cooperative}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(expense.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditExpense(expense)}
                                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
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
                
                {filteredExpenses.length === 0 && (
                    <div className="text-center py-12">
                        <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune dépense trouvée</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterCooperative !== 'all'
                                ? 'Essayez de modifier vos critères de recherche.' 
                                : 'Commencez par ajouter votre première dépense.'}
                        </p>
                        {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && filterCooperative === 'all' && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddExpense}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <FaPlus className="mr-2" />
                                    Ajouter une dépense
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseManagement;
