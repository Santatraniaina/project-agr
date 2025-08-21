import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBus, FaCar, FaMotorcycle, FaSearch, FaFilter } from 'react-icons/fa';

const VehicleManagement = ({ onVehiclesChange }) => {
    const [vehicles, setVehicles] = useState([
        {
            id: 1,
            plateNumber: 'TAA-123-A',
            type: 'Bus',
            brand: 'Mercedes',
            model: 'Sprinter',
            capacity: 25,
            cooperative: 'Coopérative Manakara',
            status: 'En service',
            lastMaintenance: '2024-01-15'
        },
        {
            id: 2,
            plateNumber: 'TAA-456-B',
            type: 'Minibus',
            brand: 'Toyota',
            model: 'Hiace',
            capacity: 15,
            cooperative: 'Coopérative Fianarantsoa',
            status: 'En maintenance',
            lastMaintenance: '2024-02-01'
        }
    ]);
    
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const vehicleTypes = ['Bus', 'Minibus', 'Taxi', 'Camion'];
    const vehicleStatuses = ['En service', 'En maintenance', 'Hors service'];

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vehicle.cooperative.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || vehicle.type === filterType;
        const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleAddVehicle = () => {
        setEditingVehicle(null);
        setShowForm(true);
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
        setShowForm(true);
    };

    const handleDeleteVehicle = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
            const updatedVehicles = vehicles.filter(v => v.id !== id);
            setVehicles(updatedVehicles);
            onVehiclesChange?.(updatedVehicles);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const vehicleData = {
            plateNumber: formData.get('plateNumber'),
            type: formData.get('type'),
            brand: formData.get('brand'),
            model: formData.get('model'),
            capacity: parseInt(formData.get('capacity')),
            cooperative: formData.get('cooperative'),
            status: formData.get('status'),
            lastMaintenance: formData.get('lastMaintenance')
        };

        if (editingVehicle) {
            const updatedVehicles = vehicles.map(v => v.id === editingVehicle.id ? { ...vehicleData, id: v.id } : v);
            setVehicles(updatedVehicles);
            onVehiclesChange?.(updatedVehicles);
        } else {
            const newVehicles = [...vehicles, { ...vehicleData, id: Date.now() }];
            setVehicles(newVehicles);
            onVehiclesChange?.(newVehicles);
        }
        
        setShowForm(false);
        setEditingVehicle(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'En service': return 'bg-green-100 text-green-800';
            case 'En maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'Hors service': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Bus': return <FaBus className="text-blue-600" />;
            case 'Minibus': return <FaCar className="text-green-600" />;
            case 'Taxi': return <FaCar className="text-yellow-600" />;
            case 'Camion': return <FaCar className="text-purple-600" />;
            default: return <FaCar className="text-gray-600" />;
        }
    };

    if (showForm) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numéro de plaque
                            </label>
                            <input
                                type="text"
                                name="plateNumber"
                                defaultValue={editingVehicle?.plateNumber || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="TAA-123-A"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de véhicule
                            </label>
                            <select
                                name="type"
                                defaultValue={editingVehicle?.type || ''}
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
                                Marque
                            </label>
                            <input
                                type="text"
                                name="brand"
                                defaultValue={editingVehicle?.brand || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Mercedes"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Modèle
                            </label>
                            <input
                                type="text"
                                name="model"
                                defaultValue={editingVehicle?.model || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Sprinter"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacité (passagers)
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                defaultValue={editingVehicle?.capacity || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="25"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coopérative
                            </label>
                            <input
                                type="text"
                                name="cooperative"
                                defaultValue={editingVehicle?.cooperative || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nom de la coopérative"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                name="status"
                                defaultValue={editingVehicle?.status || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner un statut</option>
                                {vehicleStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dernière maintenance
                            </label>
                            <input
                                type="date"
                                name="lastMaintenance"
                                defaultValue={editingVehicle?.lastMaintenance || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
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
                            {editingVehicle ? 'Mettre à jour' : 'Ajouter'}
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
                            <FaBus className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Véhicules</p>
                            <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaCar className="text-green-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">En Service</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {vehicles.filter(v => v.status === 'En service').length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FaCar className="text-yellow-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">En Maintenance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {vehicles.filter(v => v.status === 'En maintenance').length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <FaCar className="text-red-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Hors Service</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {vehicles.filter(v => v.status === 'Hors service').length}
                            </p>
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
                                placeholder="Rechercher un véhicule..."
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
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tous les types</option>
                                {vehicleTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            {vehicleStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        
                        <button
                            onClick={handleAddVehicle}
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="mr-2" />
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste des véhicules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Véhicule
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Capacité
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coopérative
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dernière maintenance
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {getTypeIcon(vehicle.type)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {vehicle.plateNumber}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {vehicle.brand} {vehicle.model}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {vehicle.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vehicle.capacity} passagers
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vehicle.cooperative}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(vehicle.lastMaintenance).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditVehicle(vehicle)}
                                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVehicle(vehicle.id)}
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
                
                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12">
                        <FaCar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule trouvé</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                                ? 'Essayez de modifier vos critères de recherche.' 
                                : 'Commencez par ajouter votre premier véhicule.'}
                        </p>
                        {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddVehicle}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <FaPlus className="mr-2" />
                                    Ajouter un véhicule
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleManagement;
