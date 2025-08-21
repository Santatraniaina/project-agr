import React, { useState, useEffect } from 'react';
import { FaTrash, FaInfoCircle, FaDatabase } from 'react-icons/fa';
import imageStorageService from '../services/ImageStorageService';

const StorageInfo = () => {
    const [storageInfo, setStorageInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        loadStorageInfo();
    }, []);

    const loadStorageInfo = async () => {
        try {
            setLoading(true);
            const info = await imageStorageService.getStorageInfo();
            setStorageInfo(info);
        } catch (error) {
            console.error('Erreur lors du chargement des informations de stockage:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        if (window.confirm('Voulez-vous nettoyer les anciennes images (plus de 30 jours) ?')) {
            try {
                setLoading(true);
                const deletedCount = await imageStorageService.cleanupOldImages();
                await loadStorageInfo();
                alert(`${deletedCount} anciennes images ont été supprimées.`);
            } catch (error) {
                console.error('Erreur lors du nettoyage:', error);
                alert('Erreur lors du nettoyage des images.');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">Chargement des informations de stockage...</span>
                </div>
            </div>
        );
    }

    if (!storageInfo) {
        return null;
    }

    const getStorageColor = (sizeMB) => {
        if (sizeMB < 50) return 'text-green-600';
        if (sizeMB < 200) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStorageBarColor = (sizeMB) => {
        if (sizeMB < 50) return 'bg-green-500';
        if (sizeMB < 200) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const storagePercentage = Math.min((storageInfo.totalSizeMB / 1000) * 100, 100); // 1000 MB = 1 GB

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FaDatabase className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Stockage des Images</h3>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    {showDetails ? 'Masquer' : 'Détails'}
                </button>
            </div>

            <div className="space-y-3">
                {/* Barre de progression du stockage */}
                <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Espace utilisé</span>
                        <span className={getStorageColor(storageInfo.totalSizeMB)}>
                            {storageInfo.totalSizeMB} MB
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${getStorageBarColor(storageInfo.totalSizeMB)}`}
                            style={{ width: `${storagePercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Limite recommandée: 1000 MB (1 GB)
                    </p>
                </div>

                {/* Statistiques de base */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-gray-600">Images stockées</div>
                        <div className="text-xl font-semibold text-gray-800">
                            {storageInfo.totalImages}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-gray-600">Taille totale</div>
                        <div className={`text-xl font-semibold ${getStorageColor(storageInfo.totalSizeMB)}`}>
                            {storageInfo.totalSizeMB} MB
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                    <button
                        onClick={handleCleanup}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50 text-sm"
                    >
                        <FaTrash className="text-sm" />
                        <span>Nettoyer anciennes</span>
                    </button>
                    <button
                        onClick={loadStorageInfo}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 text-sm"
                    >
                        <FaInfoCircle className="text-sm" />
                        <span>Actualiser</span>
                    </button>
                </div>

                {/* Informations détaillées */}
                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2">Informations techniques</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>• Stockage local IndexedDB pour persistance durable</p>
                            <p>• Support des images jusqu'à 100 MB par fichier</p>
                            <p>• Compression automatique pour optimiser l'espace</p>
                            <p>• Nettoyage automatique des anciennes images</p>
                            <p>• Données persistantes même après fermeture du navigateur</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorageInfo;
