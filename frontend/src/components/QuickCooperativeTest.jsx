import React, { useState, useEffect } from 'react';
import cooperativeStorageService from '../services/CooperativeStorageService';

const QuickCooperativeTest = () => {
    const [cooperatives, setCooperatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [testForm, setTestForm] = useState({
        nom: 'Test Coopérative',
        marque: 'Test Marque',
        modele: 'Test Modèle'
    });

    // Charger les coopératives existantes
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

    const createTestCooperative = async () => {
        try {
            setLoading(true);
            const newCoop = await cooperativeStorageService.saveCooperative({
                ...testForm,
                nom: `${testForm.nom} ${Date.now()}`,
                logo: null
            });
            
            setMessage(`✅ Coopérative créée: ${newCoop.nom}`);
            await loadCooperatives(); // Recharger la liste
        } catch (error) {
            setMessage(`❌ Erreur création: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteAllTest = async () => {
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

    const refreshData = () => {
        loadCooperatives();
    };

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Test Rapide - Stockage Coopératives</h2>
            
            {/* Message de statut */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                    message.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {message}
                </div>
            )}

            {/* Formulaire de test */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Créer une coopérative de test</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        value={testForm.nom}
                        onChange={(e) => setTestForm({...testForm, nom: e.target.value})}
                        placeholder="Nom"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={testForm.marque}
                        onChange={(e) => setTestForm({...testForm, marque: e.target.value})}
                        placeholder="Marque"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={testForm.modele}
                        onChange={(e) => setTestForm({...testForm, modele: e.target.value})}
                        placeholder="Modèle"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={createTestCooperative}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '⏳ Création...' : '➕ Créer Coopérative Test'}
                </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={refreshData}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    🔄 Actualiser
                </button>
                <button
                    onClick={deleteAllTest}
                    disabled={loading || cooperatives.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                    🗑️ Supprimer Tout
                </button>
            </div>

            {/* Liste des coopératives */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">
                    Coopératives stockées ({cooperatives.length})
                </h3>
                
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Chargement...</p>
                    </div>
                ) : cooperatives.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Aucune coopérative trouvée</p>
                        <p className="text-sm">Créez une coopérative de test pour commencer</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {cooperatives.map((coop) => (
                            <div key={coop.id} className="p-3 bg-gray-50 rounded-lg border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{coop.nom}</h4>
                                        <p className="text-sm text-gray-600">
                                            {coop.marque} - {coop.modele}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ID: {coop.id} | Créé: {new Date(coop.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            coop.hasLogo 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {coop.hasLogo ? '📷 Logo' : 'No Logo'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Instructions de test</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Créez une coopérative de test avec le formulaire ci-dessus</li>
                    <li>2. Vérifiez qu'elle apparaît dans la liste</li>
                    <li>3. Rechargez la page (F5) pour tester la persistance</li>
                    <li>4. La coopérative doit toujours être présente après rechargement</li>
                    <li>5. Si elle disparaît, il y a un problème avec IndexedDB</li>
                </ol>
            </div>

            {/* Informations techniques */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">🔧 Informations techniques</h4>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• Stockage: IndexedDB (base de données locale du navigateur)</p>
                    <p>• Service: CooperativeStorageService</p>
                    <p>• Support navigateur: Chrome, Firefox, Safari, Edge (moderne)</p>
                    <p>• Données persistantes même après fermeture du navigateur</p>
                </div>
            </div>
        </div>
    );
};

export default QuickCooperativeTest;
