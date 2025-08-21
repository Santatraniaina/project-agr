import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaDownload, FaFilePdf, FaFileExcel, FaEye, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ClotureMensuelle = () => {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [donneesClotureData, setDonneesClotureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const chargerDonneesClotureData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;

      const response = await axios.get(`http://localhost:8000/api/cloture-mois/${annee}/${mois}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json'
        }
      });

      setDonneesClotureData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const cloturerMois = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;

      const response = await axios.post('http://localhost:8000/api/cloture-mois', {
        annee,
        mois
      }, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      setSuccess('Clôture mensuelle effectuée avec succès');
      await chargerDonneesClotureData(); // Recharger les données
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la clôture');
    } finally {
      setLoading(false);
    }
  };

  const exporterExcel = async () => {
    setLoadingExport(true);
    
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;

      const response = await axios.get(`http://localhost:8000/api/cloture-mois/${annee}/${mois}/export`, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cloture_${moisNoms[mois-1]}_${annee}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors de l\'export Excel');
    } finally {
      setLoadingExport(false);
    }
  };

  const exporterPDF = async () => {
    setLoadingExport(true);
    
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;

      const response = await axios.get(`http://localhost:8000/api/cloture-mois/${annee}/${mois}/export-pdf`, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/pdf'
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cloture_${moisNoms[mois-1]}_${annee}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors de l\'export PDF');
    } finally {
      setLoadingExport(false);
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  useEffect(() => {
    chargerDonneesClotureData();
  }, [annee, mois]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/caisse/transactions"
          className="inline-flex items-center text-blue-600 mb-8 hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour aux transactions
        </Link>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <FaCalendarAlt className="text-3xl text-blue-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-800">Clôture Mensuelle</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
              <button onClick={() => setSuccess(null)} className="float-right font-bold">&times;</button>
            </div>
          )}

          {/* Sélection de période */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Sélection de la période</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                <select
                  value={annee}
                  onChange={(e) => setAnnee(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
                <select
                  value={mois}
                  onChange={(e) => setMois(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {moisNoms.map((nom, index) => (
                    <option key={index + 1} value={index + 1}>{nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={chargerDonneesClotureData}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FaEye className="mr-2" />
                {loading ? 'Chargement...' : 'Voir les données'}
              </button>
            </div>
          </div>

          {/* Données de clôture */}
          {donneesClotureData && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  Données pour {moisNoms[mois-1]} {annee}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={exporterExcel}
                    disabled={loadingExport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <FaFileExcel className="mr-2" />
                    Excel
                  </button>
                  <button
                    onClick={exporterPDF}
                    disabled={loadingExport}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <FaFilePdf className="mr-2" />
                    PDF
                  </button>
                </div>
              </div>

              {/* Résumé financier */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Recettes totales</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {donneesClotureData.recettes_totales ? formatMontant(donneesClotureData.recettes_totales) : '0 Ar'}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Dépenses totales</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {donneesClotureData.depenses_totales ? formatMontant(donneesClotureData.depenses_totales) : '0 Ar'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Bénéfice net</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {donneesClotureData.benefice_net ? formatMontant(donneesClotureData.benefice_net) : '0 Ar'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Transactions</h4>
                  <p className="text-2xl font-bold text-gray-600">
                    {donneesClotureData.nombre_transactions || 0}
                  </p>
                </div>
              </div>

              {/* Détail des recettes */}
              {donneesClotureData.recettes && donneesClotureData.recettes.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4">Détail des recettes</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left border-b">Date</th>
                          <th className="py-3 px-4 text-left border-b">Type</th>
                          <th className="py-3 px-4 text-left border-b">Description</th>
                          <th className="py-3 px-4 text-right border-b">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donneesClotureData.recettes.map((recette, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{formatDate(recette.date)}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">
                                {recette.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">{recette.description}</td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                              {formatMontant(recette.montant)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Détail des dépenses */}
              {donneesClotureData.depenses && donneesClotureData.depenses.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4">Détail des dépenses</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left border-b">Date</th>
                          <th className="py-3 px-4 text-left border-b">Catégorie</th>
                          <th className="py-3 px-4 text-left border-b">Description</th>
                          <th className="py-3 px-4 text-right border-b">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donneesClotureData.depenses.map((depense, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{formatDate(depense.date)}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">
                                {depense.categorie}
                              </span>
                            </td>
                            <td className="py-3 px-4">{depense.description}</td>
                            <td className="py-3 px-4 text-right font-semibold text-red-600">
                              {formatMontant(depense.montant)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Statut de clôture */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-yellow-800">Statut de clôture</h4>
                    <p className="text-yellow-700">
                      {donneesClotureData.est_cloture 
                        ? `Mois clôturé le ${formatDate(donneesClotureData.date_cloture)}`
                        : 'Ce mois n\'est pas encore clôturé'
                      }
                    </p>
                  </div>
                  {!donneesClotureData.est_cloture && (
                    <button
                      onClick={cloturerMois}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaLock className="mr-2" />
                      {loading ? 'Clôture...' : 'Clôturer le mois'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message si pas de données */}
          {!loading && !donneesClotureData && (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune donnée disponible</h3>
              <p className="text-gray-500">
                Sélectionnez une période et cliquez sur "Voir les données" pour afficher les informations de clôture.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClotureMensuelle;