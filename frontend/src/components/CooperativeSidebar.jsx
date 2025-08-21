import React, { useState } from 'react';
import { FaList, FaPlus, FaArrowLeft, FaCity, FaBus, FaRoute, FaMoneyBill, FaCog, FaBuilding, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';

const CooperativeSidebar = ({ activeTab, setActiveTab, onBackToDashboard, stats }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const menuItems = [
        { 
            id: 'list', 
            label: 'Liste des coopératives', 
            icon: <FaList />, 
            description: 'Gérer les coopératives',
            color: 'blue',
            badge: 'Principal'
        },
        { 
            id: 'form', 
            label: 'Ajouter une coopérative', 
            icon: <FaPlus />, 
            description: 'Créer une nouvelle coopérative',
            color: 'green'
        },
        { 
            id: 'cities', 
            label: 'Configuration des villes', 
            icon: <FaCity />, 
            description: 'Gérer les villes et destinations',
            color: 'purple'
        },
        { 
            id: 'itineraries', 
            label: 'Itinéraires', 
            icon: <FaRoute />, 
            description: 'Planifier les trajets',
            color: 'indigo'
        },
        { 
            id: 'vehicles', 
            label: 'Véhicules', 
            icon: <FaBus />, 
            description: 'Gérer la flotte de véhicules',
            color: 'orange',
            badge: 'Nouveau'
        },
        { 
            id: 'expenses', 
            label: 'Dépenses', 
            icon: <FaMoneyBill />, 
            description: 'Suivi des dépenses',
            color: 'red',
            badge: 'Important'
        },
        { 
            id: 'prices', 
            label: 'Prix', 
            icon: <FaCog />, 
            description: 'Gérer les tarifs',
            color: 'teal'
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'blue': return 'bg-blue-100 text-blue-700 border-blue-500';
            case 'green': return 'bg-green-100 text-green-700 border-green-500';
            case 'purple': return 'bg-purple-100 text-purple-700 border-purple-500';
            case 'indigo': return 'bg-indigo-100 text-indigo-700 border-indigo-500';
            case 'orange': return 'bg-orange-100 text-orange-700 border-orange-500';
            case 'red': return 'bg-red-100 text-red-700 border-red-500';
            case 'teal': return 'bg-teal-100 text-teal-700 border-teal-500';
            default: return 'bg-gray-100 text-gray-700 border-gray-500';
        }
    };

    const getBadgeColor = (badge) => {
        switch (badge) {
            case 'Principal': return 'bg-blue-500 text-white';
            case 'Nouveau': return 'bg-green-500 text-white';
            case 'Important': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className={`flex flex-col h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg transition-all duration-300 ${
            isCollapsed ? 'w-20' : 'w-64'
        }`}>
            {/* En-tête du sidebar */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                            <FaBuilding className="text-xl" />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h2 className="text-lg font-bold">Coopératives</h2>
                                <p className="text-blue-100 text-sm">Gestion complète</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                    >
                        {isCollapsed ? <FaBars /> : <FaTimes />}
                    </button>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4">
                {!isCollapsed && (
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Navigation
                        </h3>
                    </div>
                )}
                
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center px-3 py-3 text-left rounded-xl transition-all duration-200 group ${
                                        isActive
                                            ? `${getStatusColor(item.color)} border-l-4 shadow-md transform scale-105`
                                            : 'text-gray-600 hover:bg-white hover:shadow-sm hover:scale-105'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-white bg-opacity-20' 
                                            : 'bg-gray-100 group-hover:bg-blue-100'
                                    } ${isCollapsed ? 'mr-0' : 'mr-3'}`}>
                                        <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                            {item.icon}
                                        </span>
                                    </div>
                                    
                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                                    {item.label}
                                                </span>
                                                {item.badge && (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(item.badge)}`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            
            {/* Section statistiques */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Statistiques
                        </h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total Coopératives</span>
                            <span className="font-semibold text-gray-800">{stats?.cooperatives || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Véhicules Actifs</span>
                            <span className="font-semibold text-gray-800">{stats?.vehicles || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Itinéraires</span>
                            <span className="font-semibold text-gray-800">{stats?.itineraries || 0}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Bouton retour */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onBackToDashboard}
                    className={`w-full flex items-center rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all duration-200 group ${
                        isCollapsed ? 'justify-center' : 'justify-center'
                    }`}
                    title={isCollapsed ? "Retour au Dashboard" : undefined}
                >
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                        <FaArrowLeft className="text-lg text-gray-600 group-hover:text-blue-600" />
                    </div>
                    {!isCollapsed && (
                        <span className="font-medium ml-3">Retour au Dashboard</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CooperativeSidebar;