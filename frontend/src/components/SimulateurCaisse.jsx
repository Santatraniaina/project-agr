import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCalculator, FaPlus, FaTrash, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SimulateurCaisse = () => {
  const [parametres, setParametres] = useState({
    prix_tnr: 50000,
    prix_abe: 40000,
    pourcentage_reduction: 10, // Valeur par défaut à 1 (minimum)
    frais_fixe: 5000,
    prix_manakara: 30000,
    deplacement_manakara: 12000
  });
  const [activeTab, setActiveTab] = useState('national');
  const [periode, setPeriode] = useState('matin');
  const [voitures, setVoitures] = useState([{
    passagers_tnr: 0,
    passagers_abe: 0,
    paye_autre_dest_tnr: 0,
    paye_autre_dest_abe: 0,
    passagers_manakara: 0,
    gasoil: 0,
    paye_autre_dest_manakara: 0
  }]);
  const [resultats, setResultats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 

  useEffect(() => {
    // Ajuster les prix par défaut selon la période
    if (activeTab === 'national') {
      setParametres(prev => ({
        ...prev,
        prix_abe: periode === 'matin' ? 40000 : 50000
      }));
    } else {
      setParametres(prev => ({
        ...prev,
        prix_manakara: periode === 'matin' ? 30000 : 35000
      }));
    }
  }, [periode, activeTab]);

  const ajouterVoiture = () => {
    const nouvelleVoiture = activeTab === 'national' ? {
      passagers_tnr: 0,
      passagers_abe: 0,
      paye_autre_dest_tnr: 0,
      paye_autre_dest_abe: 0
    } : {
      passagers_manakara: 0,
      gasoil: 0,
      paye_autre_dest_manakara: 0
    };
    setVoitures([...voitures, nouvelleVoiture]);
  };

  const supprimerVoiture = (index) => {
    if (voitures.length > 1) {
      setVoitures(voitures.filter((_, i) => i !== index));
    }
  };

  const mettreAJourVoiture = (index, champ, valeur) => {
    const nouvellesVoitures = [...voitures];
    nouvellesVoitures[index][champ] = parseInt(valeur) || 0;
    setVoitures(nouvellesVoitures);
  };

  // Nouvelle validation pour le pourcentage
  const handlePourcentageChange = (e) => {
    let value = parseInt(e.target.value) || 1; // Valeur par défaut 1 si vide ou invalide
    
    // Forcer la valeur à être entre 1 et 100
    if (value < 0) {
      value = 0;
      setError("Le pourcentage de réduction ne peut pas être inférieur à 1");
    } else if (value > 100) {
      value = 100;
      setError("Le pourcentage de réduction ne peut excéder 100");
    } else {
      setError(null); // Effacer l'erreur si la valeur est valide
    }
    
    setParametres({
      ...parametres,
      pourcentage_reduction: value
    });
  };

  const calculer = async () => {
    // Validation finale avant envoi
    if (parametres.pourcentage_reduction > 1) {
      setError("Le pourcentage de réduction ne doit pas être supérieur à 1");
      return;
    }

    if (parametres.pourcentage_reduction < 0) {
      setError("Le pourcentage de réduction ne peut pas être négatif");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Récupération du token CSRF
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;

      const endpoint = activeTab === 'national' 
        ? 'http://localhost:8000/api/simulateur/national'
        : 'http://localhost:8000/api/simulateur/regional';

      // Préparation des données avec format cohérent
      const data = {
        periode,
        voitures: voitures.map(voiture => ({
          ...voiture,
          // Conversion de tous les champs en nombres
          passagers_tnr: Number(voiture.passagers_tnr) || 0,
          passagers_abe: Number(voiture.passagers_abe) || 0,
          paye_autre_dest_tnr: Number(voiture.paye_autre_dest_tnr) || 0,
          paye_autre_dest_abe: Number(voiture.paye_autre_dest_abe) || 0,
          passagers_manakara: Number(voiture.passagers_manakara) || 0,
          gasoil: Number(voiture.gasoil) || 0,
          paye_autre_dest_manakara: Number(voiture.paye_autre_dest_manakara) || 0
        })),
        parametres: {
          ...parametres,
          // Conversion des paramètres en nombres
          prix_tnr: Number(parametres.prix_tnr) || 0,
          prix_abe: Number(parametres.prix_abe) || 0,
          pourcentage_reduction: Number(parametres.pourcentage_reduction) || 2, // Minimum 2
          frais_fixe: Number(parametres.frais_fixe) || 0,
          prix_manakara: Number(parametres.prix_manakara) || 0,
          deplacement_manakara: Number(parametres.deplacement_manakara) || 0
        }
      };

      console.log('Données envoyées au serveur:', JSON.stringify(data, null, 2));

      const response = await axios.post(endpoint, data, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Réponse du serveur:', response.data);
      setResultats(response.data);
    } catch (err) {
      console.error('Erreur complète:', err);
      console.error('Détails de l\'erreur:', err.response?.data);

      let errorMessage = 'Erreur lors du calcul';
      if (err.response) {
        if (err.response.data.errors) {
          // Formatage des erreurs de validation Laravel
          errorMessage = Object.entries(err.response.data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exporterResultats = () => {
    if (!resultats) return;
    
    const dataStr = JSON.stringify(resultats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `simulateur_${activeTab}_${periode}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
  };

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
            <FaCalculator className="text-3xl text-blue-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-800">Simulateur de Caisse</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded whitespace-pre-line">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="float-right font-bold"
              >
                &times;
              </button>
            </div>
          )}

          {/* Onglets */}
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setActiveTab('national')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'national'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Transport National
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'regional'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Transport Régional
            </button>
          </div>

          {/* Sélection de période */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="matin">Matin</option>
              <option value="soir">Soir</option>
            </select>
          </div>

          {/* Paramètres de prix */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Paramètres de prix</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTab === 'national' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix TNR</label>
                    <input
                      type="number"
                      value={parametres.prix_tnr}
                      onChange={(e) => setParametres({...parametres, prix_tnr: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix ABE</label>
                    <input
                      type="number"
                      value={parametres.prix_abe}
                      onChange={(e) => setParametres({...parametres, prix_abe: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frais fixe</label>
                    <input
                      type="number"
                      value={parametres.frais_fixe}
                      onChange={(e) => setParametres({...parametres, frais_fixe: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix Manakara</label>
                    <input
                      type="number"
                      value={parametres.prix_manakara}
                      onChange={(e) => setParametres({...parametres, prix_manakara: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Déplacement Manakara</label>
                    <input
                      type="number"
                      value={parametres.deplacement_manakara}
                      onChange={(e) => setParametres({...parametres, deplacement_manakara: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Paramètre de taux de pourcentage - commun aux deux onglets */}
            <div className="mt-4 pt-4 border-t border-gray-200">
    <h4 className="text-md font-medium mb-3 text-gray-800">Paramètres généraux</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Taux de pourcentage de réduction
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={parametres.pourcentage_reduction}
            onChange={handlePourcentageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
          />
          <span className="absolute right-3 top-2 text-gray-500 text-sm">
            {parametres.pourcentage_reduction}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Valeur entre 0 et 1 (ex: 0.1 pour 10%)
        </p>
      </div>
    </div>
  </div>
          </div>

          {/* Liste des voitures */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Voitures</h3>
              <button
                onClick={ajouterVoiture}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Ajouter une voiture
              </button>
            </div>

            <div className="space-y-4">
              {voitures.map((voiture, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Voiture {index + 1}</h4>
                    {voitures.length > 1 && (
                      <button
                        onClick={() => supprimerVoiture(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeTab === 'national' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passagers TNR</label>
                          <input
                            type="number"
                            value={voiture.passagers_tnr}
                            onChange={(e) => mettreAJourVoiture(index, 'passagers_tnr', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passagers ABE</label>
                          <input
                            type="number"
                            value={voiture.passagers_abe}
                            onChange={(e) => mettreAJourVoiture(index, 'passagers_abe', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payé autre dest. TNR</label>
                          <input
                            type="number"
                            value={voiture.paye_autre_dest_tnr}
                            onChange={(e) => mettreAJourVoiture(index, 'paye_autre_dest_tnr', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payé autre dest. ABE</label>
                          <input
                            type="number"
                            value={voiture.paye_autre_dest_abe}
                            onChange={(e) => mettreAJourVoiture(index, 'paye_autre_dest_abe', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passagers Manakara</label>
                          <input
                            type="number"
                            value={voiture.passagers_manakara}
                            onChange={(e) => mettreAJourVoiture(index, 'passagers_manakara', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gasoil</label>
                          <input
                            type="number"
                            value={voiture.gasoil}
                            onChange={(e) => mettreAJourVoiture(index, 'gasoil', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payé autre dest. Manakara</label>
                          <input
                            type="number"
                            value={voiture.paye_autre_dest_manakara}
                            onChange={(e) => mettreAJourVoiture(index, 'paye_autre_dest_manakara', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton de calcul */}
          <div className="flex justify-center mb-8">
            <button
              onClick={calculer}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FaCalculator className="mr-2" />
              {loading ? 'Calcul en cours...' : 'Calculer'}
            </button>
          </div>

          {/* Résultats */}
          {resultats && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-green-800">Résultats du calcul</h3>
                <button
                  onClick={exporterResultats}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" />
                  Exporter
                </button>
              </div>

              {/* Résumé global */}
              <div className="mb-6 p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-3">Résumé global</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nombre de voitures:</span>
                    <div className="font-semibold">{resultats.nombre_voitures}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Montant total à payer:</span>
                    <div className="font-semibold text-green-600">
                      {formatMontant(resultats.total_global.montant_a_payer_total)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Moyenne par voiture:</span>
                    <div className="font-semibold">
                      {formatMontant(resultats.total_global.montant_a_payer_par_voiture_moyenne)}
                    </div>
                  </div>
                  {activeTab === 'national' && (
                    <div>
                      <span className="text-gray-600">Total passagers:</span>
                      <div className="font-semibold">
                        TNR: {resultats.total_global.passagers_tnr} | ABE: {resultats.total_global.passagers_abe}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Détail par voiture */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-200">
                      <th className="py-2 px-4 text-left">Voiture</th>
                      {activeTab === 'national' ? (
                        <>
                          <th className="py-2 px-4 text-left">Pass. TNR</th>
                          <th className="py-2 px-4 text-left">Pass. ABE</th>
                          <th className="py-2 px-4 text-left">Montant brut</th>
                          <th className="py-2 px-4 text-left">Après réduction</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2 px-4 text-left">Pass. Manakara</th>
                          <th className="py-2 px-4 text-left">Montant brut</th>
                          <th className="py-2 px-4 text-left">Gasoil</th>
                        </>
                      )}
                      <th className="py-2 px-4 text-left">À payer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultats.voitures.map((voiture, index) => (
                      <tr key={index} className="border-b border-green-100">
                        <td className="py-2 px-4 font-medium">Voiture {voiture.id}</td>
                        {activeTab === 'national' ? (
                          <>
                            <td className="py-2 px-4">{voiture.passagers_tnr}</td>
                            <td className="py-2 px-4">{voiture.passagers_abe}</td>
                            <td className="py-2 px-4">{formatMontant(voiture.montant_brut)}</td>
                            <td className="py-2 px-4">{formatMontant(voiture.montant_apres_reduction)}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-4">{voiture.passagers_manakara}</td>
                            <td className="py-2 px-4">{formatMontant(voiture.montant_brut)}</td>
                            <td className="py-2 px-4">{formatMontant(voiture.gasoil)}</td>
                          </>
                        )}
                        <td className="py-2 px-4 font-semibold text-green-600">
                          {formatMontant(voiture.montant_a_payer)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulateurCaisse;