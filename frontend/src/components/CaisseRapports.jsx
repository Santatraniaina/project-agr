import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCalendarAlt, FaDownload, FaEye } from 'react-icons/fa';
import axios from 'axios';

const CaisseRapports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periode, setPeriode] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  const [statistiques, setStatistiques] = useState(null);

  const chargerStatistiques = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulation de données pour le moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatistiques({
        transactions_totales: 156,
        montant_total: 15600000,
        moyenne_par_transaction: 100000,
        clients_uniques: 89,
        voitures_utilisees: 12,
        taux_occupation: 78.5
      });
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerStatistiques();
  }, [periode]);

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
  };

  const formatPourcentage = (valeur) => {
    return valeur.toFixed(1) + '%';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FaChartLine className="text-3xl text-blue-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Rapports de Caisse</h1>
              <p className="text-gray-600">Analyses et statistiques financières</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        {/* Sélection de période */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" />
            Période d'analyse
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <input
                type="date"
                value={periode.debut}
                onChange={(e) => setPeriode({...periode, debut: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
              <input
                type="date"
                value={periode.fin}
                onChange={(e) => setPeriode({...periode, fin: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={chargerStatistiques}
                disabled={loading}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FaEye className="mr-2" />
                {loading ? 'Chargement...' : 'Analyser'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        {statistiques && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions totales</p>
                  <p className="text-3xl font-bold text-blue-600">{statistiques.transactions_totales}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaChartLine className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Montant total</p>
                  <p className="text-3xl font-bold text-green-600">{formatMontant(statistiques.montant_total)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaChartLine className="text-2xl text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Moyenne par transaction</p>
                  <p className="text-3xl font-bold text-purple-600">{formatMontant(statistiques.moyenne_par_transaction)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaChartLine className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clients uniques</p>
                  <p className="text-3xl font-bold text-orange-600">{statistiques.clients_uniques}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaChartLine className="text-2xl text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Voitures utilisées</p>
                  <p className="text-3xl font-bold text-red-600">{statistiques.voitures_utilisees}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FaChartLine className="text-2xl text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-indigo-600">{formatPourcentage(statistiques.taux_occupation)}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <FaChartLine className="text-2xl text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions d'export */}
        {statistiques && (
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FaDownload className="mr-2" />
                Exporter en Excel
              </button>
              <button className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <FaDownload className="mr-2" />
                Exporter en PDF
              </button>
              <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaEye className="mr-2" />
                Voir détails
              </button>
            </div>
          </div>
        )}

        {/* Message si pas de données */}
        {!loading && !statistiques && (
          <div className="text-center py-12">
            <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-500">
              Sélectionnez une période et cliquez sur "Analyser" pour voir les statistiques.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaisseRapports;