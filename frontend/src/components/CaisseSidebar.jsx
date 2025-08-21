import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaCashRegister,
  FaCalculator,
  FaCalendarAlt,
  FaChartLine,
  FaUsers,
  FaCog,
  FaMoneyBillWave
} from 'react-icons/fa';

const CaisseSidebar = () => {
  const menuItems = [
    {
      path: '/caisse/transactions',
      icon: FaCashRegister,
      label: 'Transactions',
      description: 'Gestion des encaissements'
    },
    {
      path: '/caisse/simulateur',
      icon: FaCalculator,
      label: 'Simulateur',
      description: 'Calculs de caisse'
    },
    {
      path: '/caisse/cloture',
      icon: FaCalendarAlt,
      label: 'Clôture',
      description: 'Clôture mensuelle'
    },
    {
      path: '/caisse/rapports',
      icon: FaChartLine,
      label: 'Rapports',
      description: 'Analyses financières'
    },
    {
      path: '/caisse/depenses',
      icon: FaMoneyBillWave,
      label: 'Dépenses',
      description: 'Gestion des dépenses'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
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

      {/* Menu de navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <IconComponent className={`text-lg mr-3 transition-colors duration-200`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-600">
                      {item.description}
                    </div>
                  </div>
                </NavLink>
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
  );
};

export default CaisseSidebar;