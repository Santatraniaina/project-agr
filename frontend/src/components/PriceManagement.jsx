import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaMoneyBillWave, FaRoute, FaCity, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const PriceManagement = () => {
    const [prices, setPrices] = useState([
        {
            id: 1,
            route: 'Antananarivo - Fianarantsoa',
            cooperative: 'Coopérative Manakara',
            basePrice: 25000,
            peakPrice: 30000,
            offPeakPrice: 20000,
            currency: 'Ar',
            effectiveDate: '2024-01-01',
            status: 'Actif',
            vehicleType: 'Bus',
            distance: '400 km',
            notes: 'Prix standard pour trajet principal'
        }
    ]);
    
    const [showForm, setShowForm] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCooperative, setFilterCooperative] = useState('all');

    const priceStatuses = ['Actif', 'En révision', 'Inactif', 'Expiré'];
    const cooperatives = ['Coopérative Manakara', 'Coopérative Fianarantsoa', 'Coopérative Antananarivo'];
    const vehicleTypes = ['Bus', 'Minibus', 'Taxi', 'Camion'];

    const filteredPrices = prices.filter(price => {
        const matchesSearch = price.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            price.cooperative.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || price.status === filterStatus;
        const matchesCooperative = filterCooperative === 'all' || price.cooperative === filterCooperative;
        
        return matchesSearch && matchesStatus && matchesCooperative;
    });

    const totalRoutes = prices.length;
    const activePrices = prices.filter(price => price.status === 'Actif').length;

    const handleAddPrice = () => {
        setEditingPrice(null);
        setShowForm(true);
    };

    const handleEditPrice = (price) => {
        setEditingPrice(price);
        setShowForm(true);
    };

    const handleDeletePrice = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
            setPrices(prices.filter(p => p.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const priceData = {
            route: formData.get('route'),
            cooperative: formData.get('cooperative'),
            basePrice: parseInt(formData.get('basePrice')),
            peakPrice: parseInt(formData.get('peakPrice')),
            offPeakPrice: parseInt(formData.get('offPeakPrice')),
            currency: formData.get('currency'),
            effectiveDate: formData.get('effectiveDate'),
            status: formData.get('status'),
            vehicleType: formData.get('vehicleType'),
            distance: formData.get('distance'),
            notes: formData.get('notes')
        };

        if (editingPrice) {
            setPrices(prices.map(p => p.id === editingPrice.id ? { ...priceData, id: p.id } : p));
        } else {
            setPrices([...prices, { ...priceData, id: Date.now() }]);
        }
        
        setShowForm(false);
        setEditingPrice(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Actif': return 'bg-green-100 text-green-800';
            case 'En révision': return 'bg-yellow-100 text-yellow-800';
            case 'Inactif': return 'bg-red-100 text-red-800';
            case 'Expiré': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (showForm) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editingPrice ? 'Modifier le tarif' : 'Ajouter un tarif'}
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
                                Itinéraire
                            </label>
                            <input
                                type="text"
                                name="route"
                                defaultValue={editingPrice?.route || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Antananarivo - Fianarantsoa"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coopérative
                            </label>
                            <select
                                name="cooperative"
                                defaultValue={editingPrice?.cooperative || ''}
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
                                Type de véhicule
                            </label>
                            <select
                                name="vehicleType"
                                defaultValue={editingPrice?.vehicleType || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner un type</option>
                                {vehicleTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix de base (Ar)
                            </label>
                            <input
                                type="number"
                                name="basePrice"
                                defaultValue={editingPrice?.basePrice || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="25000"
                                min="0"
                                step="1000"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix de pointe (Ar)
                            </label>
                            <input
                                type="number"
                                name="peakPrice"
                                defaultValue={editingPrice?.peakPrice || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="30000"
                                min="0"
                                step="1000"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix hors pointe (Ar)
                            </label>
                            <input
                                type="number"
                                name="offPeakPrice"
                                defaultValue={editingPrice?.offPeakPrice || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="20000"
                                min="0"
                                step="1000"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date d'effet
                            </label>
                            <input
                                type="date"
                                name="effectiveDate"
                                defaultValue={editingPrice?.effectiveDate || ''}
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
                                defaultValue={editingPrice?.status || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner un statut</option>
                                {priceStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Distance
                            </label>
                            <input
                                type="text"
                                name="distance"
                                defaultValue={editingPrice?.distance || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="400 km"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                defaultValue={editingPrice?.notes || ''}
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
                            {editingPrice ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaRoute className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Itinéraires</p>
                            <p className="text-2xl font-bold text-gray-900">{totalRoutes}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaChartLine className="text-green-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tarifs Actifs</p>
                            <p className="text-2xl font-bold text-gray-900">{activePrices}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FaCity className="text-purple-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Coopératives</p>
                            <p className="text-2xl font-bold text-gray-900">{cooperatives.length}</p>
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
                                placeholder="Rechercher un tarif..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            {priceStatuses.map(status => (
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
                            onClick={handleAddPrice}
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="mr-2" />
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste des tarifs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Itinéraire
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coopérative
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prix
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Véhicule
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Distance
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date d'effet
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
                            {filteredPrices.map((price) => (
                                <tr key={price.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <FaRoute className="text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {price.route}
                                                </div>
                                                {price.notes && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {price.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {price.cooperative}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <div className="font-semibold">Base: {price.basePrice.toLocaleString()} {price.currency}</div>
                                            <div className="text-xs text-gray-500">
                                                Pointe: {price.peakPrice.toLocaleString()} | Hors pointe: {price.offPeakPrice.toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {price.vehicleType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {price.distance}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(price.effectiveDate).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(price.status)}`}>
                                            {price.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditPrice(price)}
                                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePrice(price.id)}
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
                
                {filteredPrices.length === 0 && (
                    <div className="text-center py-12">
                        <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun tarif trouvé</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterStatus !== 'all' || filterCooperative !== 'all'
                                ? 'Essayez de modifier vos critères de recherche.' 
                                : 'Commencez par ajouter votre premier tarif.'}
                        </p>
                        {!searchTerm && filterStatus === 'all' && filterCooperative === 'all' && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddPrice}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <FaPlus className="mr-2" />
                                    Ajouter un tarif
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceManagement;
