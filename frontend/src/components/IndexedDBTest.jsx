import React, { useState, useEffect } from 'react';
import cooperativeStorageService from '../services/CooperativeStorageService';

const IndexedDBTest = () => {
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const addTestResult = (test, status, message, data = null) => {
        setTestResults(prev => [...prev, {
            id: Date.now(),
            test,
            status,
            message,
            data,
            timestamp: new Date().toISOString()
        }]);
    };

    const runTests = async () => {
        setIsRunning(true);
        setTestResults([]);

        try {
            // Test 1: Vérifier le support d'IndexedDB
            addTestResult('Support IndexedDB', 'info', 'Vérification du support navigateur...');
            if (!window.indexedDB) {
                addTestResult('Support IndexedDB', 'error', 'IndexedDB non supporté par ce navigateur');
                return;
            }
            addTestResult('Support IndexedDB', 'success', 'IndexedDB supporté');

            // Test 2: Initialisation du service
            addTestResult('Initialisation', 'info', 'Initialisation du service de stockage...');
            await cooperativeStorageService.init();
            addTestResult('Initialisation', 'success', 'Service initialisé avec succès');

            // Test 3: Création d'une coopérative de test
            addTestResult('Création', 'info', 'Création d\'une coopérative de test...');
            const testCooperative = {
                nom: 'Test Coopérative',
                marque: 'Test Marque',
                modele: 'Test Modèle',
                logo: null
            };
            
            const savedCooperative = await cooperativeStorageService.saveCooperative(testCooperative);
            addTestResult('Création', 'success', 'Coopérative créée avec succès', savedCooperative);

            // Test 4: Récupération de la coopérative
            addTestResult('Récupération', 'info', 'Récupération de la coopérative créée...');
            const retrievedCooperative = await cooperativeStorageService.getCooperative(savedCooperative.id);
            addTestResult('Récupération', 'success', 'Coopérative récupérée avec succès', retrievedCooperative);

            // Test 5: Récupération de toutes les coopératives
            addTestResult('Liste complète', 'info', 'Récupération de toutes les coopératives...');
            const allCooperatives = await cooperativeStorageService.getAllCooperatives();
            addTestResult('Liste complète', 'success', `${allCooperatives.length} coopératives trouvées`, allCooperatives);

            // Test 6: Mise à jour de la coopérative
            addTestResult('Mise à jour', 'info', 'Mise à jour de la coopérative de test...');
            const updatedData = { ...testCooperative, nom: 'Test Coopérative Mise à Jour' };
            const updatedCooperative = await cooperativeStorageService.updateCooperative(savedCooperative.id, updatedData);
            addTestResult('Mise à jour', 'success', 'Coopérative mise à jour avec succès', updatedCooperative);

            // Test 7: Suppression de la coopérative de test
            addTestResult('Suppression', 'info', 'Suppression de la coopérative de test...');
            await cooperativeStorageService.deleteCooperative(savedCooperative.id);
            addTestResult('Suppression', 'success', 'Coopérative supprimée avec succès');

            // Test 8: Vérification de la suppression
            addTestResult('Vérification suppression', 'info', 'Vérification que la coopérative a bien été supprimée...');
            try {
                await cooperativeStorageService.getCooperative(savedCooperative.id);
                addTestResult('Vérification suppression', 'error', 'La coopérative existe encore après suppression');
            } catch (error) {
                addTestResult('Vérification suppression', 'success', 'La coopérative a bien été supprimée');
            }

            // Test 9: Informations de stockage
            addTestResult('Informations stockage', 'info', 'Récupération des informations de stockage...');
            const storageInfo = await cooperativeStorageService.getStorageInfo();
            addTestResult('Informations stockage', 'success', 'Informations récupérées', storageInfo);

        } catch (error) {
            addTestResult('Erreur générale', 'error', `Erreur lors des tests: ${error.message}`, error);
        } finally {
            setIsRunning(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    const exportResults = () => {
        const dataStr = JSON.stringify(testResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'indexeddb-test-results.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Test IndexedDB - Diagnostic des Coopératives</h1>
                
                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        Ce composant teste le bon fonctionnement du stockage IndexedDB pour les coopératives.
                        Utilisez-le pour diagnostiquer les problèmes de persistance des données.
                    </p>
                    
                    <div className="flex space-x-4">
                        <button
                            onClick={runTests}
                            disabled={isRunning}
                            className={`px-4 py-2 rounded-md font-medium ${
                                isRunning
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {isRunning ? 'Tests en cours...' : 'Lancer les tests'}
                        </button>
                        
                        <button
                            onClick={clearResults}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                        >
                            Effacer les résultats
                        </button>
                        
                        <button
                            onClick={exportResults}
                            disabled={testResults.length === 0}
                            className={`px-4 py-2 rounded-md font-medium ${
                                testResults.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            Exporter les résultats
                        </button>
                    </div>
                </div>

                {testResults.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-700">Résultats des tests</h2>
                        
                        {testResults.map((result) => (
                            <div
                                key={result.id}
                                className={`p-4 rounded-lg border ${
                                    result.status === 'success'
                                        ? 'bg-green-50 border-green-200'
                                        : result.status === 'error'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-blue-50 border-blue-200'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                result.status === 'success'
                                                    ? 'bg-green-100 text-green-800'
                                                    : result.status === 'error'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {result.status.toUpperCase()}
                                            </span>
                                            <span className="font-medium text-gray-900">{result.test}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{result.message}</p>
                                        {result.data && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                                    Voir les données
                                                </summary>
                                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 ml-4">
                                        {new Date(result.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isRunning && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-blue-800">Tests en cours d'exécution...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IndexedDBTest;
