import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CooperativeSidebar from './CooperativeSidebar.jsx';
import CooperativeList from './CooperativeList.jsx';
import CooperativeForm from './CooperativeForm.jsx';
import CityConfiguration from './CityConfiguration.jsx';
import CooperativeItinerary from './CooperativeItinerary.jsx';
import VehicleManagement from './VehicleManagement.jsx';
import ExpenseManagement from './ExpenseManagement.jsx';
import PriceManagement from './PriceManagement.jsx';
import cooperativeStorageService from '../services/CooperativeStorageService';

const CooperativeManagement = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [selectedCooperative, setSelectedCooperative] = useState(null);
    const [cooperatives, setCooperatives] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const navigate = useNavigate();

    // Charger les coopératives depuis IndexedDB au démarrage
    useEffect(() => {
        loadCooperatives();
    }, []);

    // Fonction pour charger les coopératives depuis IndexedDB
    const loadCooperatives = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Attendre que le service soit initialisé
            await cooperativeStorageService.init();
            
            // Récupérer toutes les coopératives
            const loadedCooperatives = await cooperativeStorageService.getAllCooperatives();
            console.log('Coopératives chargées:', loadedCooperatives);
            
            setCooperatives(loadedCooperatives || []);
            
        } catch (err) {
            console.error('Erreur lors du chargement des coopératives:', err);
            setError('Erreur lors du chargement des coopératives');
            setCooperatives([]);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour créer une nouvelle coopérative
    const handleCreateCooperative = async (cooperativeData) => {
        try {
            setLoading(true);
            setError(null);
            
            // Sauvegarder la coopérative via le service
            const savedCooperative = await cooperativeStorageService.saveCooperative(cooperativeData);
            console.log('Nouvelle coopérative sauvegardée:', savedCooperative);
            
            // Ajouter la nouvelle coopérative à l'état local
            setCooperatives(prev => [...prev, savedCooperative]);
            
            // Afficher le message de succès
            setSuccessMessage('Coopérative créée avec succès !');
            
            // Revenir à la liste
            setActiveTab('list');
            
            // Masquer le message de succès après 3 secondes
            setTimeout(() => setSuccessMessage(null), 3000);
            
        } catch (err) {
            console.error('Erreur lors de la création de la coopérative:', err);
            setError('Erreur lors de la création de la coopérative: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour mettre à jour une coopérative existante
    const handleUpdateCooperative = async (id, cooperativeData) => {
        try {
            setLoading(true);
            setError(null);
            
            // Mettre à jour la coopérative via le service
            const updatedCooperative = await cooperativeStorageService.updateCooperative(id, cooperativeData);
            console.log('Coopérative mise à jour:', updatedCooperative);
            
            // Mettre à jour l'état local
            setCooperatives(prev => prev.map(coop => 
                coop.id === id ? updatedCooperative : coop
            ));
            
            // Afficher le message de succès
            setSuccessMessage('Coopérative mise à jour avec succès !');
            
            // Revenir à la liste
            setActiveTab('list');
            
            // Masquer le message de succès après 3 secondes
            setTimeout(() => setSuccessMessage(null), 3000);
            
        } catch (err) {
            console.error('Erreur lors de la mise à jour de la coopérative:', err);
            setError('Erreur lors de la mise à jour de la coopérative: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour supprimer une coopérative
    const handleDeleteCooperative = async (id) => {
        try {
            setLoading(true);
            setError(null);
            
            // Supprimer la coopérative via le service
            await cooperativeStorageService.deleteCooperative(id);
            console.log('Coopérative supprimée:', id);
            
            // Mettre à jour l'état local
            setCooperatives(prev => prev.filter(coop => coop.id !== id));
            
            // Afficher le message de succès
            setSuccessMessage('Coopérative supprimée avec succès !');
            
            // Masquer le message de succès après 3 secondes
            setTimeout(() => setSuccessMessage(null), 3000);
            
        } catch (err) {
            console.error('Erreur lors de la suppression de la coopérative:', err);
            setError('Erreur lors de la suppression de la coopérative: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour éditer une coopérative
    const handleEditCooperative = (cooperative) => {
        setSelectedCooperative(cooperative);
        setActiveTab('form');
        setError(null);
        setSuccessMessage(null);
    };

    // Fonction pour configurer les villes d'une coopérative
    const handleConfigureCities = (cooperative) => {
        setSelectedCooperative(cooperative);
        setActiveTab('cities');
        setError(null);
        setSuccessMessage(null);
    };

    // Fonction pour rafraîchir la liste des coopératives
    const handleRefreshCooperatives = () => {
        loadCooperatives();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'list':
                return (
                    <div>
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-800">Liste des Coopératives</h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleRefreshCooperatives}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Chargement...' : 'Actualiser'}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedCooperative(null);
                                        setActiveTab('form');
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Ajouter une coopérative
                                </button>
                            </div>
                        </div>
                        <CooperativeList 
                            cooperatives={cooperatives}
                            onEdit={handleEditCooperative}
                            onDelete={handleDeleteCooperative}
                            onConfigureCities={handleConfigureCities}
                            loading={loading}
                            error={error}
                        />
                    </div>
                );
            case 'form':
                return (
                    <div>
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setActiveTab('list');
                                    setSelectedCooperative(null);
                                    setError(null);
                                    setSuccessMessage(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                ← Retour à la liste
                            </button>
                        </div>
                        <CooperativeForm 
                            cooperative={selectedCooperative}
                            onCreate={handleCreateCooperative}
                            onUpdate={handleUpdateCooperative}
                            onCancel={() => {
                                setSelectedCooperative(null);
                                setActiveTab('list');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                        />
                    </div>
                );
            case 'cities':
                return (
                    <div>
                        <div className="mb-6">
                            <button
                                onClick={() => setActiveTab('list')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                ← Retour à la liste
                            </button>
                        </div>
                        <CityConfiguration
                            cooperative={selectedCooperative}
                            onCancel={() => {
                                setSelectedCooperative(null);
                                setActiveTab('list');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            onBack={() => setActiveTab('list')}
                        />
                    </div>
                );
            case 'itineraries':
                return (
                    <CooperativeItinerary
                        cooperative={selectedCooperative}
                        onBack={() => setActiveTab('list')}
                    />
                );
            case 'vehicles':
                return <VehicleManagement onVehiclesChange={setVehicles} />;
            case 'expenses':
                return <ExpenseManagement />;
            case 'prices':
                return <PriceManagement />;
            default:
                return (
                    <div>
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-800">Liste des Coopératives</h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleRefreshCooperatives}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Chargement...' : 'Actualiser'}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedCooperative(null);
                                        setActiveTab('form');
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Ajouter une coopérative
                                </button>
                            </div>
                        </div>
                        <CooperativeList 
                            cooperatives={cooperatives}
                            onEdit={handleEditCooperative}
                            onDelete={handleDeleteCooperative}
                            onConfigureCities={handleConfigureCities}
                            loading={loading}
                            error={error}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 min-h-screen bg-white shadow-lg">
                    <CooperativeSidebar 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onBackToDashboard={() => navigate('/')}
                        stats={{
                            cooperatives: cooperatives.length,
                            vehicles: vehicles.length,
                            itineraries: itineraries.length
                        }}
                    />
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Coopératives</h1>
                        <p className="text-gray-600">Gérez vos coopératives, leurs itinéraires, véhicules et configurations</p>
                    </div>
                    
                    {/* Affichage des messages de succès */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">{successMessage}</p>
                                </div>
                                <div className="ml-auto pl-3">
                                    <button
                                        onClick={() => setSuccessMessage(null)}
                                        className="text-green-400 hover:text-green-600"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Affichage des erreurs */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                                <div className="ml-auto pl-3">
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default CooperativeManagement;