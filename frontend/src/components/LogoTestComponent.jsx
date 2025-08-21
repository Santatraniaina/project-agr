import React, { useState, useEffect } from 'react';
import cooperativeStorageService from '../services/CooperativeStorageService';

const LogoTestComponent = () => {
    const [cooperatives, setCooperatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        loadCooperatives();
    }, []);

    const loadCooperatives = async () => {
        try {
            setLoading(true);
            await cooperativeStorageService.init();
            const loaded = await cooperativeStorageService.getAllCooperatives();
            setCooperatives(loaded || []);
            setMessage(`✅ ${loaded?.length || 0} coopératives chargées`);
        } catch (error) {
            setMessage(`❌ Erreur: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const createCooperativeWithLogo = async () => {
        if (!selectedFile) {
            setMessage('❌ Veuillez sélectionner un fichier image');
            return;
        }

        try {
            setLoading(true);
            const newCoop = await cooperativeStorageService.saveCooperative({
                nom: `Test Logo ${Date.now()}`,
                marque: 'Test Marque',
                modele: 'Test Modèle',
                logo: selectedFile
            });
            
            setMessage(`✅ Coopérative avec logo créée: ${newCoop.nom}`);
            setSelectedFile(null);
            setLogoPreview(null);
            await loadCooperatives();
        } catch (error) {
            setMessage(`❌ Erreur création: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearAll = async () => {
        if (!confirm('Supprimer toutes les coopératives de test ?')) return;
        
        try {
            setLoading(true);
            for (const coop of cooperatives) {
                await cooperativeStorageService.deleteCooperative(coop.id);
            }
            setMessage('🗑️ Toutes les coopératives supprimées');
            await loadCooperatives();
        } catch (error) {
            setMessage(`❌ Erreur suppression: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🖼️ Test des Logos - Coopératives</h2>
                
                {/* Message de statut */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Section de test des logos */}
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Test d'ajout de logo</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sélection de fichier */}
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                                Sélectionner une image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {/* Aperçu de l'image */}
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                                Aperçu
                            </label>
                            {logoPreview ? (
                                <div className="relative">
                                    <img 
                                        src={logoPreview} 
                                        alt="Aperçu" 
                                        className="h-20 w-20 rounded-lg object-cover border-2 border-blue-300"
                                    />
                                </div>
                            ) : (
                                <div className="h-20 w-20 rounded-lg bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">Aucune image</span>
                                </div>
                            )}
                        </div>

                        {/* Bouton de création */}
                        <div className="flex items-end">
                            <button
                                onClick={createCooperativeWithLogo}
                                disabled={loading || !selectedFile}
                                className={`px-6 py-2 rounded-lg font-medium ${
                                    loading || !selectedFile
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {loading ? '⏳ Création...' : '➕ Créer avec Logo'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={loadCooperatives}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                        🔄 Actualiser
                    </button>
                    <button
                        onClick={clearAll}
                        disabled={loading || cooperatives.length === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                        🗑️ Supprimer Tout
                    </button>
                </div>

                {/* Liste des coopératives avec logos */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Coopératives avec logos ({cooperatives.length})
                    </h3>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Chargement...</p>
                        </div>
                    ) : cooperatives.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucune coopérative trouvée</p>
                            <p className="text-sm">Créez une coopérative avec logo pour commencer</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {cooperatives.map((coop) => (
                                <div key={coop.id} className="p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center space-x-4">
                                        {/* Logo */}
                                        <div className="flex-shrink-0">
                                            {coop.logoPreview ? (
                                                <div className="relative group">
                                                    <img 
                                                        src={coop.logoPreview} 
                                                        alt={`Logo ${coop.nom}`}
                                                        className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
                                                    />
                                                    {/* Aperçu agrandi au survol */}
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                                        <img 
                                                            src={coop.logoPreview} 
                                                            alt={`Aperçu ${coop.nom}`}
                                                            className="h-32 w-32 rounded-lg object-cover border-2 border-white shadow-xl"
                                                        />
                                                    </div>
                                                </div>
                                            ) : coop.hasLogo ? (
                                                <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                                                    <div className="text-center">
                                                        <div className="text-blue-600 text-xs font-medium">Logo</div>
                                                        <div className="text-blue-400 text-xs">En cours...</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                                    <div className="text-center">
                                                        <div className="text-gray-500 text-xs font-medium">No Logo</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Informations de la coopérative */}
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{coop.nom}</h4>
                                            <p className="text-sm text-gray-600">
                                                {coop.marque} - {coop.modele}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                ID: {coop.id} | Créé: {new Date(coop.timestamp).toLocaleString()}
                                            </p>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    coop.logoPreview 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : coop.hasLogo 
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {coop.logoPreview ? '✅ Logo affiché' : coop.hasLogo ? '📷 Logo en cours' : '❌ Pas de logo'}
                                                </span>
                                                {coop.logoId && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                                        ID: {coop.logoId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">📋 Instructions de test des logos</h4>
                    <ol className="text-sm text-yellow-700 space-y-1">
                        <li>1. Sélectionnez une image dans le sélecteur de fichier</li>
                        <li>2. Vérifiez l'aperçu de l'image</li>
                        <li>3. Cliquez sur "Créer avec Logo"</li>
                        <li>4. Vérifiez que la coopérative apparaît avec son logo</li>
                        <li>5. Survolez le logo pour voir l'aperçu agrandi</li>
                        <li>6. Rechargez la page pour tester la persistance</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default LogoTestComponent;
