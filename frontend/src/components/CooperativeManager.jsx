import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaUpload, FaDatabase } from 'react-icons/fa';
import CooperativeForm from './CooperativeForm';
import cooperativeStorageService from '../services/CooperativeStorageService';

const CooperativeManager = () => {
    const [cooperatives, setCooperatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCooperative, setEditingCooperative] = useState(null);
    const [selectedCooperative, setSelectedCooperative] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCooperatives();
    }, []);

    const loadCooperatives = async () => {
        try {
            setLoading(true);
            setError(null);
            const allCooperatives = await cooperativeStorageService.getAllCooperatives();
            setCooperatives(allCooperatives);
        } catch (error) {
            console.error('Erreur lors du chargement des coopératives:', error);
            setError('Erreur lors du chargement des coopératives');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCooperative = async (cooperativeData) => {
        try {
            // La coopérative est déjà sauvegardée par le formulaire
            await loadCooperatives(); // Recharger la liste
            setShowForm(false);
            setError(null);
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            setError('Erreur lors de la création de la coopérative');
        }
    };

    const handleUpdateCooperative = async (id, cooperativeData) => {
        try {
            // La coopérative est déjà mise à jour par le formulaire
            await loadCooperatives(); // Recharger la liste
            setShowForm(false);
            setEditingCooperative(null);
            setError(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setError('Erreur lors de la mise à jour de la coopérative');
        }
    };

    const handleDeleteCooperative = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette coopérative ? Cette action est irréversible.')) {
            try {
                await cooperativeStorageService.deleteCooperative(id);
                await loadCooperatives();
                setError(null);
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                setError('Erreur lors de la suppression de la coopérative');
            }
        }
    };

    const handleEditCooperative = (cooperative) => {
        setEditingCooperative(cooperative);
        setShowForm(true);
    };

    const handleViewCooperative = (cooperative) => {
        setSelectedCooperative(cooperative);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingCooperative(null);
        setError(null);
    };

    const handleExportData = async () => {
        try {
            const data = await cooperativeStorageService.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cooperatives_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            setError('Erreur lors de l\'export des données');
        }
    };

    const handleImportData = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await cooperativeStorageService.importData(data);
            await loadCooperatives();
            setError(null);
            alert('Données importées avec succès !');
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            setError('Erreur lors de l\'import des données');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (showForm) {
        return (
            <CooperativeForm
                cooperative={editingCooperative}
                onCreate={handleCreateCooperative}
                onUpdate={handleUpdateCooperative}
                onCancel={handleCancelForm}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestion des Coopératives</h1>
                    <p className="text-gray-600 mt-2">
                        {cooperatives.length} coopérative(s) stockée(s) localement
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                        title="Exporter toutes les données"
                    >
                        <FaDownload />
                        <span>Exporter</span>
                    </button>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors transition-colors flex items-center space-x-2 cursor-pointer">
                        <FaUpload />
                        <span>Importer</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <FaPlus />
                        <span>Ajouter</span>
                    </button>
                </div>
            </div>

            {/* Affichage des erreurs */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Liste des coopératives */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {cooperatives.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FaDatabase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">Aucune coopérative</p>
                        <p className="text-sm">Commencez par ajouter votre première coopérative</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Logo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Marque
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Modèle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cooperatives.map((cooperative) => (
                                    <tr key={cooperative.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {cooperative.logoPreview ? (
                                                <img
                                                    src={cooperative.logoPreview}
                                                    alt="Logo"
                                                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-300"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <FaDatabase className="text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {cooperative.nom}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cooperative.marque}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cooperative.modele}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(cooperative.timestamp).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewCooperative(cooperative)}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="Voir les détails"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleEditCooperative(cooperative)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1"
                                                    title="Modifier"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCooperative(cooperative.id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Supprimer"
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
                )}
            </div>

            {/* Modal de détails */}
            {selectedCooperative && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Détails de la Coopérative
                                </h2>
                                <button
                                    onClick={() => setSelectedCooperative(null)}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {selectedCooperative.logoPreview && (
                                    <div className="text-center">
                                        <img
                                            src={selectedCooperative.logoPreview}
                                            alt="Logo"
                                            className="h-32 w-32 rounded-lg object-cover border-2 border-gray-300 mx-auto"
                                        />
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedCooperative.nom}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Marque</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedCooperative.marque}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Modèle</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedCooperative.modele}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ID</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedCooperative.id}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Créée le</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(selectedCooperative.timestamp).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Modifiée le</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(selectedCooperative.lastModified).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CooperativeManager;
