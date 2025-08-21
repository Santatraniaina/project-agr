import React, { useState, useEffect } from 'react';
import NationalSimulator from './NationalSimulator';
import RegionalSimulator from './RegionalSimulator';
import ClotureMensuelle from './ClotureMensuelle';
import ConfigurationManager from './ConfigurationManager';
import DepenseManager from './DepenseManager';
import ExpenseSummary from './ExpenseSummary';
import ExpenseManagementDisplay from './ExpenseManagementDisplay';
import { FaCashRegister, FaCalculator, FaCalendarAlt, FaChartLine, FaUsers, FaCog, FaMoneyBillWave, FaHome } from 'react-icons/fa';
import './CardCaisse.css';

const CardCaisse = ({ initialMenu }) => {
    // Charger l'état initial depuis localStorage ou utiliser des valeurs par défaut
    const [activeMenu, setActiveMenu] = useState(() => {
        if (initialMenu) {
            return initialMenu;
        }
        return localStorage.getItem('cardCaisse_activeMenu') || 'national';
    });
    const [periode, setPeriode] = useState(() => {
        return localStorage.getItem('cardCaisse_periode') || 'matin';
    });

    // Sauvegarder l'état dans localStorage
    useEffect(() => {
        localStorage.setItem('cardCaisse_activeMenu', activeMenu);
    }, [activeMenu]);

    useEffect(() => {
        localStorage.setItem('cardCaisse_periode', periode);
    }, [periode]);

    const handleMenuSelect = (menu) => {
        setActiveMenu(menu);
    };

    const menuItems = [
        {
            id: 'national',
            icon: FaCalculator,
            label: 'Simulateur National',
            description: 'TNR/A-BE',
            color: 'blue'
        },
        {
            id: 'regional',
            icon: FaCalculator,
            label: 'Simulateur Régional',
            description: 'Manakara',
            color: 'green'
        },
        {
            id: 'cloture_mensuelle',
            icon: FaCalendarAlt,
            label: 'Clôture Mensuelle',
            description: 'Gestion des clôtures',
            color: 'purple'
        },
        {
            id: 'depenses',
            icon: FaMoneyBillWave,
            label: 'Gestion Dépenses',
            description: 'Suivi des dépenses',
            color: 'red'
        },
        {
            id: 'expense_management',
            icon: FaChartLine,
            label: 'Analyse Complète',
            description: 'Gestion avancée',
            color: 'orange'
        },
        {
            id: 'configuration',
            icon: FaCog,
            label: 'Configuration',
            description: 'Paramètres système',
            color: 'gray'
        }
    ];

    const getColorClasses = (color) => {
        const colorMap = {
            blue: 'hover:bg-blue-50 hover:text-blue-700 border-blue-200',
            green: 'hover:bg-green-50 hover:text-green-700 border-green-200',
            purple: 'hover:bg-purple-50 hover:text-purple-700 border-purple-200',
            red: 'hover:bg-red-50 hover:text-red-700 border-red-200',
            orange: 'hover:bg-orange-50 hover:text-orange-700 border-orange-200',
            gray: 'hover:bg-gray-50 hover:text-gray-700 border-gray-200'
        };
        return colorMap[color] || 'hover:bg-gray-50 hover:text-gray-700 border-gray-200';
    };

    const getActiveColorClasses = (color) => {
        const colorMap = {
            blue: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500',
            green: 'bg-green-50 text-green-700 border-l-4 border-green-500',
            purple: 'bg-purple-50 text-purple-700 border-l-4 border-purple-500',
            red: 'bg-red-50 text-red-700 border-l-4 border-red-500',
            orange: 'bg-orange-50 text-orange-700 border-l-4 border-orange-500',
            gray: 'bg-gray-50 text-gray-700 border-l-4 border-gray-500'
        };
        return colorMap[color] || 'bg-gray-50 text-gray-700 border-l-4 border-gray-500';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar unifié */}
            <div className="w-80 bg-white shadow-lg border-r border-gray-200 min-h-screen">
                {/* En-tête du sidebar */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-500 rounded-lg">
                            <FaCashRegister className="text-2xl text-white" />
                        </div>
                        <div className="ml-3">
                            <h2 className="text-xl font-bold text-gray-800">CAISSE</h2>
                            <p className="text-sm text-gray-500">Gestion financière</p>
                        </div>
                    </div>
                </div>

                {/* Sélecteur de période */}
                <div className="p-4 border-b border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Période:</label>
                    <select 
                        value={periode} 
                        onChange={(e) => setPeriode(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                        <option value="matin">Matin</option>
                        <option value="soir">Soir</option>
                    </select>
                </div>

                {/* Menu de navigation */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeMenu === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleMenuSelect(item.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                                            isActive
                                                ? getActiveColorClasses(item.color)
                                                : `text-gray-600 ${getColorClasses(item.color)}`
                                        }`}
                                    >
                                        <IconComponent className={`text-lg mr-3 transition-colors duration-200`} />
                                        <div className="flex-1">
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-xs text-gray-500 group-hover:text-gray-600">
                                                {item.description}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Section statistiques rapides */}
                <div className="p-4 border-t border-gray-200 mt-auto">
                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-red-800 mb-2">Aujourd'hui</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-red-600">Transactions:</span>
                                <span className="font-semibold text-red-800">--</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-red-600">Montant:</span>
                                <span className="font-semibold text-red-800">-- Ar</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Raccourcis */}
                <div className="p-4 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Raccourcis
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center">
                            <FaUsers className="mr-2" />
                            Clients en attente
                        </button>
                        <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center">
                            <FaCog className="mr-2" />
                            Paramètres
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 p-6 md:p-8">
                {activeMenu === 'national' && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-2/3">
                            <NationalSimulator periode={periode} />
                        </div>
                        <div className="md:w-1/3">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <ExpenseSummary />
                            </div>
                        </div>
                    </div>
                )}
                {activeMenu === 'regional' && <RegionalSimulator periode={periode} />}
                {activeMenu === 'cloture_mensuelle' && <ClotureMensuelle />}
                {activeMenu === 'configuration' && <ConfigurationManager />}
                {activeMenu === 'depenses' && <DepenseManager />}
                {activeMenu === 'expense_management' && <ExpenseManagementDisplay />}
            </div>
        </div>
    );
};

export default CardCaisse;
