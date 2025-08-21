import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CityDropdown from './CityDropdown';

const Recherche = ({ showSearch, setShowSearch }) => {
  console.log('Rendu Recherche - showSearch vaut :', showSearch);
 // const [showSearch, setShowSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    date_depart: '',
    itineraire: '',
    ville: '',
    type_voiture: 'tous'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itineraires, setItineraires] = useState([]);
  const [loadingItineraires, setLoadingItineraires] = useState(false);
  const [errorItineraires, setErrorItineraires] = useState(null);

  // Charger les itinéraires au montage du composant
  useEffect(() => {
    const fetchItineraires = async () => {
      setLoadingItineraires(true);
      setErrorItineraires(null);
      try {
        const response = await axios.get('http://localhost:8000/api/itineraires');
        setItineraires(response.data.data || response.data);
      } catch (error) {
        setErrorItineraires(error.message);
        console.error("Erreur lors du chargement des itinéraires", error);
      } finally {
        setLoadingItineraires(false);
      }
    };

    fetchItineraires();
  }, []);

  // Fonction pour les places standard (16 places)
  const getPlaces = async (voiture) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/voitures/${voiture.id}/places`);
      const placesData = response.data.data || response.data;
      
      let occupiedCount = 0;
      const placesDetails = [];
      
      for (let i = 1; i <= 16; i++) {
        const placeKey = `place_${i}`;
        const isOccupied = placesData[placeKey] && 
                         placesData[placeKey] !== false && 
                         placesData[placeKey] !== null;

        if (isOccupied) {
          occupiedCount++;
        } else {
          placesDetails.push({
            numero: i,
            status: 'libre'
          });
        }
      }

      return {
        ...voiture,
        places_libres: 16 - occupiedCount,
        places_occupees: occupiedCount,
        capacite_total: 16,
        places_details: placesDetails
      };

    } catch (error) {
      console.error("Erreur places:", error);
      return {
        ...voiture,
        places_libres: 16,
        places_occupees: 0,
        capacite_total: 16,
        places_details: Array.from({ length: 16 }, (_, i) => ({
          numero: i + 1,
          status: 'libre'
        }))
      };
    }
  };

  // Fonction pour les places VIP (10 places)
  const getVipPlaces = async (voiture) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/voitures/${voiture.id}/places-vip`);
      const placesData = response.data.data || response.data;
      
      let occupiedCount = 0;
      const placesDetails = [];
      
      for (let i = 1; i <= 10; i++) {
        const placeKey = `place_${i}`;
        const isOccupied = placesData[placeKey] && 
                         placesData[placeKey] !== false && 
                         placesData[placeKey] !== null;

        if (isOccupied) {
          occupiedCount++;
        } else {
          placesDetails.push({
            numero: i,
            status: 'libre'
          });
        }
      }

      return {
        ...voiture,
        places_libres: 10 - occupiedCount,
        places_occupees: occupiedCount,
        capacite_total: 10,
        places_details: placesDetails
      };

    } catch (error) {
      console.error("Erreur places VIP:", error);
      return {
        ...voiture,
        places_libres: 10,
        places_occupees: 0,
        capacite_total: 10,
        places_details: Array.from({ length: 10 }, (_, i) => ({
          numero: i + 1,
          status: 'libre'
        }))
      };
    }
  };

  const effectuerRecherche = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupération du token CSRF
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      // Recherche des voitures
      const response = await axios.post(
        'http://localhost:8000/api/recherche-voitures',
        {
          date_depart: searchCriteria.date_depart,
          itineraire: searchCriteria.itineraire,
          ville: searchCriteria.ville,
          type_voiture: searchCriteria.type_voiture,
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfResponse.data.csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Récupération des places pour chaque voiture
      const voituresAvecPlaces = await Promise.all(
        response.data.data.map(async (voiture) => {
          if (voiture.type === 'vip') {
            return await getVipPlaces(voiture);
          } else {
            return await getPlaces(voiture);
          }
        })
      );

      setSearchResults(voituresAvecPlaces);
      setShowResults(true);

    } catch (err) {
      if (err.response?.status === 422) {
        setError("Erreur de validation: " + JSON.stringify(err.response.data.errors));
      } else {
        setError(err.message || "Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="recherche-section"  className="container mx-auto p-4">
      <button

onClick={() => {
  console.log('Avant setShowSearch :', showSearch);
  setShowSearch(!showSearch);
}}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {showSearch ? 'Masquer' : 'Rechercher des voitures'}
      </button>

      {showSearch && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-medium">Date de départ</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={searchCriteria.date_depart}
                onChange={(e) => setSearchCriteria({...searchCriteria, date_depart: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Itinéraire</label>
              {loadingItineraires ? (
                <div className="p-2 border rounded bg-gray-100 text-gray-500">
                  Chargement des itinéraires...
                </div>
              ) : errorItineraires ? (
                <div className="p-2 border rounded bg-red-100 text-red-500">
                  Erreur: {errorItineraires}
                </div>
              ) : (
                <select
                  className="w-full p-2 border rounded"
                  value={searchCriteria.itineraire}
                  onChange={(e) => setSearchCriteria({...searchCriteria, itineraire: e.target.value})}
                >
                  <option value="">Tous les itinéraires</option>
                  {itineraires.map((itineraire) => (
                    <option
                      key={itineraire.id}
                      value={itineraire.itineraire || itineraire}
                    >
                      {itineraire.itineraire || itineraire}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <CityDropdown
                selectedCity={searchCriteria.ville}
                onCityChange={(ville) => setSearchCriteria({...searchCriteria, ville})}
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Type de voiture</label>
              <select
                className="w-full p-2 border rounded"
                value={searchCriteria.type_voiture}
                onChange={(e) => setSearchCriteria({...searchCriteria, type_voiture: e.target.value})}
              >
                <option value="tous">Tous types</option>
                <option value="normal">Standard</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>

          <button
            onClick={effectuerRecherche}
            disabled={loading}
            className={`bg-green-500 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
          >
            {loading ? 'Recherche en cours...' : 'Lancer la recherche'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      )}

      {showResults && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Résultats</h2>
          
          {searchResults.length === 0 ? (
            <p className="text-center py-4">Aucune voiture trouvée</p>
          ) : (
            <div className="space-y-4">
              {searchResults.map((voiture, index) => (
                <div key={index} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        {voiture.marque} {voiture.modele}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          voiture.type === 'vip' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {voiture.type === 'vip' ? 'VIP' : 'Standard'}
                        </span>
                      </h3>
                      <p className="text-gray-600">{voiture.itineraire}</p>
                      <p>Départ: {voiture.date_depart} à {voiture.heure_depart}</p>
                    </div>
                    
                    <div className="mt-2 md:mt-0 md:text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        voiture.places_libres > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {voiture.places_libres > 0 ? 
                          `${voiture.places_libres} place(s) libre(s)` : 
                          'Complet'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Capacité: {voiture.capacite_total} places - 
                        <span className="text-green-600"> {voiture.places_libres} libres</span>, 
                        <span className="text-red-600"> {voiture.places_occupees} occupées</span>
                      </p>
                    </div>
                  </div>

                  {voiture.places_libres > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Places disponibles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {voiture.places_details
                          .filter(place => place.status === 'libre')
                          .map(place => (
                            <div 
                              key={place.numero}
                              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-800 border border-green-200"
                              title={`Place ${place.numero}`}
                            >
                              {place.numero}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Recherche;