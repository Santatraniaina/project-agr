import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configuration de axios
axios.defaults.baseURL = 'http://localhost:8000/api';
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

const PlaceListVip = ({
  voitureSelectionnee,
  setSelectedPlace,
  onSelectPlace,
  setShowSearch,
  onVoyagerVipClick,
  onReportToQueue
}) => {
  // États
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [selectionMode, setSelectionMode] = useState('single');
  const [showDialog, setShowDialog] = useState(false);
  const [clientInfo, setClientInfo] = useState({ nom: '', contact: '' });
  const [loading, setLoading] = useState({ voiture: false, places: false });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showClientInfo, setShowClientInfo] = useState(null);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [actionType, setActionType] = useState('assign');
  const [selectedVoiture, setSelectedVoiture] = useState(null);
  const [text, setText] = useState("");
  // Disposition des places VIP (10 places)
  const vipPlacesLayout = [
    [1],         // Rangée 1: 1 place
    [2, 3, 4],   // Rangée 2: 3 places
    [5, 6, 7],   // Rangée 3: 3 places
    [8, 9, 10]   // Rangée 4: 3 places
  ];



  // Effets
  useEffect(() => {
    const resetAndFetch = async () => {
      setSelectedPlaces([]);
      setShowClientInfo(null);
      setClientInfo({ nom: '', contact: '' });
      setError(null);
      setSuccessMessage(null);

      if (voitureSelectionnee) {
        await fetchPlaces();
      } else {
        setPlaces([]);
      }
    };

    resetAndFetch();
  }, [voitureSelectionnee]);

  useEffect(() => {
    if (places.length > 0) {
      const count = places.filter(p => p.status === 'occupé').length;
      setOccupiedCount(count);
    }
  }, [places]);

  useEffect(() => {
    // Debug: Vérifiez quand et pourquoi le dialogue s'ouvre
    console.log('Selected places changed:', selectedPlaces);
  }, [selectedPlaces]);

  // Fonctions
  const fetchPlaces = async () => {
    setLoading(prev => ({ ...prev, places: true }));
    setError(null);

    try {
      if (!voitureSelectionnee?.id) {
        throw new Error('Aucune voiture sélectionnée');
      }

      const response = await axios.get(`/voitures/${voitureSelectionnee.id}/places-vip`);

      // Debug: Vérifier la structure complète de la réponse
      console.log('Réponse complète des places VIP:', response.data);

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }

      // Nouveau traitement des données plus robuste
      const placesArray = [];
      for (let i = 1; i <= 10; i++) {
        const placeKey = `place_${i}`;
        const isOccupied = response.data[placeKey] || false;

        // Extraire les détails si disponibles
        const details = response.data.details || {};
        const placeDetails = details[placeKey] || {};

        placesArray.push({
          id: i,
          numero: i,
          status: isOccupied ? 'occupé' : 'libre',
          nom: placeDetails.nom || '',
          contact: placeDetails.contact || '',
          date_attribution: placeDetails.date_attribution || null,
          voiture_id: isOccupied ? voitureSelectionnee.id : null,
          statut_paiement: placeDetails.statut_paiement || (isOccupied ? 'a_encaisser' : null) // Assurez-vous de récupérer le statut
        });
      }

      setPlaces(placesArray);

    } catch (error) {
      console.error('Erreur fetchPlaces:', {
        error: error.message,
        response: error.response?.data
      });

      const emptyPlaces = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        numero: i + 1,
        status: 'libre',
        nom: '',
        contact: '',
        date_attribution: null,
        voiture_id: null
      }));

      setPlaces(emptyPlaces);
      setError(error.response?.data?.message || error.message || 'Chargement des places échoué');
    } finally {
      setLoading(prev => ({ ...prev, places: false }));
    }
  };


  const handleSelectPlace = (placeId, event) => {
    event?.stopPropagation();

    const place = places.find(p => p.id === placeId);

    if (!place) {
      console.error(`Place ${placeId} non trouvée`);
      return;
    }

    // Si la place est occupée par une autre voiture
    if (place.status === 'occupé' && place.voiture_id !== voitureSelectionnee?.id) {
      setError('Cette place est déjà occupée par une autre voiture');
      return;
    }

    // Si la place est occupée par la voiture actuelle
    if (place.status === 'occupé' && place.voiture_id === voitureSelectionnee?.id) {
      setShowClientInfo({
        id: place.id,
        numero: place.numero,
        nom: place.nom || 'Non renseigné',
        contact: place.contact || 'Non renseigné',
        date_attribution: place.date_attribution,
        statut_paiement: place.statut_paiement // Inclure le statut de paiement
      });
      // Forcer la sélection unitaire pour éviter les libérations multiples
      setSelectedPlaces([place.id]);
      return;
    }

    // Pour une place libre - gestion normale
    if (selectionMode === 'single') {
      setSelectedPlaces([placeId]);
    } else {
      setSelectedPlaces(prev =>
        prev.includes(placeId)
          ? prev.filter(id => id !== placeId)
          : [...prev, placeId]
      );
    }

    if (onSelectPlace) onSelectPlace(place);
    if (setSelectedPlace) setSelectedPlace(place);

    // NE PAS METTRE setShowDialog(true) ICI
  };


  const handleSubmit = async () => {
    try {
      const payload = {
        voiture_id: Number(voitureSelectionnee.id),
        PlaceVips: selectedPlaces.map(Number),
        nom: clientInfo.nom.trim(),
        contact: clientInfo.contact.trim()
      };

      // Debug crucial
      console.log('Structure complète:', {
        payload,
        stringified: JSON.stringify(payload),
        types: {
          voiture_id: typeof payload.voiture_id,
          PlaceVips0: typeof payload.PlaceVips[0],
          isArray: Array.isArray(payload.PlaceVips)
        }
      });

      console.log('Payload envoyé:', payload);

      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;



      console.log('Envoi des données:', payload); // Debug

      const response = await axios.post('/places-vip', payload, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('Succès:', response.data);
        setSuccessMessage(response.data.message || 'Attribution réussie');

        // Fermez d'abord le dialogue
        setShowDialog(false);

        // Ensuite réinitialisez les états et rafraîchissez
        setClientInfo({ nom: '', contact: '' });
        setSelectedPlaces([]);
        await fetchPlaces();

      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }

    } catch (error) {
      console.error('Erreur complète:', {
        error: error.message,
        response: error.response?.data
      });
      setError(error.response?.data?.message || error.message);
    }
  };



  const handleFreePlaces = async (overridePlaceId = null) => {
    try {
      // FORCER la libération d'une seule place - IGNORER la sélection multiple
      if (!voitureSelectionnee?.id || !overridePlaceId) {
        alert("Erreur : ID de place requis pour la libération. Veuillez sélectionner une place spécifique.");
        return;
      }

      // Toujours libérer une seule place spécifique
      const placeToFree = Number(overridePlaceId);
      
      if (isNaN(placeToFree)) {
        alert("ID de place invalide");
        return;
      }
      
      const placesToFree = [placeToFree]; // Toujours un seul élément
      const payload = {
        voiture_id: Number(voitureSelectionnee.id),
        places: placesToFree,
        message: 'Libération forcée d\'une seule place VIP'
      };

      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Debug
      console.log('VIP Free place payload (FORCÉ SIMPLE):', payload);
      const response = await axios.post(
        'http://localhost:8000/api/free-places-vip',
        payload,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfResponse.data.csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Créer un message combiné pour toutes les places
        let alertMessage = "";
        response.data.results.forEach(result => {
          alertMessage += result.success
            ? `✓ Place ${result.place_num} libérée\n`
            : `✗ Place ${result.place_num}: ${result.message}\n`;
        });

        // Afficher UN SEUL alert
        alert(alertMessage);

        // Fermer le dialogue et rafraîchir

        fetchPlaces();
        setSelectedPlaces([]);
        setShowClientInfo(null);
        setError(null);
      } else {
        alert(response.data.message);
        setError(response.data.message);
      }

    } catch (error) {
      console.error('Erreur:', error);
      const errorMsg = error.response?.status === 422
        ? `Erreur: ${JSON.stringify(error.response.data.errors)}`
        : error.response?.data?.message || error.message;

      alert(errorMsg);
      setError(errorMsg);
    }
  };


  const handleReportPlace = async () => {
    // Utilise l'id courant (forcé unitaire)
    const placeId = showClientInfo?.id ?? (selectedPlaces.length > 0 ? selectedPlaces[0] : null);
    await handleFreePlaces(placeId);
    setShowClientInfo(null); // Ferme le dialogue

    // Active la recherche
    setShowSearch(true);

    // Ajouter dans la file d'attente si callback fourni
    if (typeof onReportToQueue === 'function') {
      onReportToQueue({
        id: Date.now(),
        nom: showClientInfo?.nom || 'Client',
        contact: showClientInfo?.contact || 'Non renseigné',
        nbre_place: 1, // Par défaut 1 place
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        place: placeId,
        voiture_id: voitureSelectionnee?.id,
        is_vip: true // Marquer comme VIP
      });
    }

    // Fait défiler vers la recherche après un léger délai
    setTimeout(() => {
      const rechercheElement = document.getElementById('recherche-section');
      if (rechercheElement) {
        rechercheElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

  };

  // Composant PlaceButton
  const PlaceButton = ({ place }) => {
    if (!place) return <div className="w-20 h-24" />;

    const isOccupied = place.status === 'occupé';
    const isCurrentCar = place.voiture_id === voitureSelectionnee?.id;
    const isSelected = selectedPlaces.includes(place.id);

    const handleClick = (e) => {
      e.stopPropagation(); // Important
      setShowDialog(false);

      if (isOccupied && isCurrentCar) {
        // Afficher les infos client, pas de sélection
        setShowClientInfo({
          id: place.id,
          numero: place.numero,
          nom: place.nom || 'Non renseigné',
          contact: place.contact || 'Non renseigné',
          date_attribution: place.date_attribution,
          statut_paiement: place.statut_paiement // Inclure le statut de paiement
        });
        return;
      }

      // Pour les places libres ou occupées par d'autres voitures
      handleSelectPlace(place.id, e);
    };

    return (
      <div className="relative">
        {/* Indicateur de sélection - cercle bleu */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg z-20 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
        {/* Volant style icône au-dessus de la place 3 */}
        {place.numero === 3 && (
          <div className="absolute left-1/6 -top-44 transform -translate-x-2/4   z-10">
            <div className="w-40 h-40 relative">
              {/* Cercle extérieur simple */}
              <div className="absolute inset-0 rounded-full border-[8px] border-black"></div>

              {/* Centre du volant */}
              <div className="absolute inset-[30%] rounded-full bg-black"></div>

              {/* Branche centrale */}
              <div className="absolute top-1/2 left-[15%] right-[15%] h-[8px] bg-black 
                            transform -translate-y-1/2"></div>
            </div>
            {/* Ligne de connexion entre le volant et la place */}
            <div className="absolute left-1/2 bottom-0 w-[3px] h-12 bg-black transform -translate-x-1/2"></div>
          </div>
        )}

        <button
          onClick={() => handleSelectPlace(place.id)}
          disabled={isOccupied && !isCurrentCar}
          className={`
            w-40 h-40 p-3 rounded-lg flex flex-col items-center justify-center
            relative transition-all duration-200 border-2 border-[#7d4cee]
            ${isOccupied
              ? isCurrentCar
                ? "bg-[#a411d1] hover:bg-[#8149e9]"
                : "bg-[#a411d1] cursor-not-allowed opacity-70"
              : isSelected
                ? "bg-[#a411d1]"
                : "bg-[#a411d1]  hover:bg-[#8149e9]"
            }
          `}
        >
          <div className="w-full h-full flex flex-col items-center relative">
            <div className="w-full h-full flex flex-col items-center justify-center">
              {/* Dossier agrandi */}
              <div className="w-32 h-60 bg-black rounded-t-lg mb-1 relative">
                <div className="absolute inset-[3px] border border-[#444] rounded-t-lg">
                  {/* Lignes décoratives */}
                  <div className="absolute top-6 left-2 right-2 h-[2px] bg-[#333]"></div>
                  <div className="absolute top-9 left-2 right-2 h-[2px] bg-[#333]"></div>
                  <div className="absolute top-18 left-2 right-2 h-[2px] bg-[#333]"></div>
                </div>

                {/* Zone de texte pour le nom */}
                {isOccupied && (
                  <div className="absolute inset-x-2 top-1/2 transform -translate-y-1/2 
                                bg-white/70 py-0 px-1 rounded text-center">
                    <span className="text-[10px] font-medium truncate block max-w-[100px]">
                      {place.nom || 'Client'}
                    </span>
                  </div>
                )}
                {isOccupied && (
                  <div className="absolute inset-x-2 top-2/3 transform -translate-y-1/2 
                                bg-white/70 py-0 px-1 rounded text-center">
                    <span className="text-[10px] font-medium truncate block max-w-[100px]">
                      {place.contact || 'Client'}
                    </span>
                  </div>
                )}
              </div>

              {/* Assise agrandie */}
              <div className="w-32 h-12 bg-black rounded-b-lg relative">
                <div className="absolute inset-[3px] border border-[#444] rounded-b-lg">
                  <div className="absolute top-1/2 left-3 right-3 h-[1px] bg-[#333]"></div>
                </div>
              </div>
            </div>

            {/* Numéro de place */}
            <span className="absolute top-1.5 left-1/2 transform -translate-x-1/2
                           text-white font-bold text-xl drop-shadow-md">
              {place.numero}
            </span>
          </div>

          {/* Indicateur de statut */}
          {isOccupied && isCurrentCar && (
            <div className="absolute top-2 right-1 w-2.5 h-2 bg-green-500 rounded-full border border-white"></div>
          )}
          {isOccupied && isSelected && (
            <div className="absolute bottom-2 right-1 w-2 h-2 bg-blue-400 rounded-full border border-white"></div>
          )}
          {/* Indicateur de statut de paiement "P" */}
          {isOccupied && place.statut_paiement === 'P' && (
            <div className="absolute bottom-1 left-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md">
              P
            </div>
          )}
        </button>
      </div>
    );
  };
  // Données utiles
  const freePlaces = 10 - occupiedCount;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Places VIP - {voitureSelectionnee?.id} - {voitureSelectionnee?.marque} {voitureSelectionnee?.modele}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-600">{freePlaces} places libres</span>
            <span className="text-sm text-red-600">{occupiedCount} places occupées</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        {loading.places ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Mode de sélection</h2>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="selectionMode"
                    value="single"
                    checked={selectionMode === 'single'}
                    onChange={() => {
                      setSelectionMode('single');
                      setSelectedPlaces([]);
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Sélection simple</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="selectionMode"
                    value="multiple"
                    checked={selectionMode === 'multiple'}
                    onChange={() => setSelectionMode('multiple')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Sélection multiple</span>
                </label>
              </div>
            </div>

            {/* Disposition spéciale VIP */}
            <div className="flex flex-col items-center space-y-4 mb-8">
              {/* Rangée 1 - 1 place */}
              <div className="flex space-x-4 ">
                <div className="w-36 mr-48"></div>
                {vipPlacesLayout[0].map(num => (
                  <PlaceButton
                    key={`vip-${num}`}
                    place={places.find(p => p.numero === num)}
                  />
                ))}
              </div>

              {/* Rangée 2 - 3 places */}
              <div className="flex space-x-4">
                {vipPlacesLayout[1].map(num => (
                  <PlaceButton
                    key={`vip-${num}`}
                    place={places.find(p => p.numero === num)}
                  />
                ))}
              </div>

              {/* Rangée 3 - 3 places */}
              <div className="flex space-x-4">
                {vipPlacesLayout[2].map(num => (
                  <PlaceButton
                    key={`vip-${num}`}
                    place={places.find(p => p.numero === num)}
                  />
                ))}
              </div>

              {/* Rangée 4 - 3 places */}
              <div className="flex space-x-4">
                {vipPlacesLayout[3].map(num => (
                  <PlaceButton
                    key={`vip-${num}`}
                    place={places.find(p => p.numero === num)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Empêche la propagation du clic
                  setActionType('assign');
                  setShowDialog(true);
                }}
                disabled={selectedPlaces.length === 0 ||
                  places.some(p => selectedPlaces.includes(p.id) && p.status === 'occupé')}
                className={`px-6 py-2 rounded-lg text-white font-medium ${selectedPlaces.length > 0 &&
                    !places.some(p => selectedPlaces.includes(p.id) && p.status === 'occupé')
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Attribuer {selectedPlaces.length} place(s)
              </button>

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Écrivez ici..."
                className="p-2 border rounded"
              />

<button
              onClick={() => {
                if (typeof onVoyagerVipClick === 'function' && occupiedCount == 10) {
                  onVoyagerVipClick();
                  if (voitureSelectionnee && !voituresParties.includes(voitureSelectionnee.id)) {
                    setVoituresParties(prev => [...prev, voitureSelectionnee.id]);
                  }
                } else {
                  console.error("La prop onVoyagerVipClick n'est pas une fonction");
                }


              }}
              className="voyager-button"
            >
              Voyager
              {occupiedCount} places occupées
            </button>

            </div>
           
          </>
        )}
      </div>

      {/* Modals */}
      {showDialog && actionType === 'assign' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Attribution des places VIP</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
                <input
                  type="text"
                  value={clientInfo.nom}
                  onChange={(e) => setClientInfo({ ...clientInfo, nom: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                <input
                  type="text"
                  value={clientInfo.contact}
                  onChange={(e) => setClientInfo({ ...clientInfo, contact: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Récapitulatif</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Voiture:</span> {voitureSelectionnee?.marque} {voitureSelectionnee?.modele}</p>
                  <p><span className="font-medium">Places:</span> {selectedPlaces.map(p => `VIP-${p}`).join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!clientInfo.nom.trim() || !clientInfo.contact.trim()}
                className={`px-4 py-2 rounded-lg text-white ${clientInfo.nom.trim() && clientInfo.contact.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showClientInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Détails de la réservation VIP</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Place</div>
                  <div className="text-lg font-semibold">VIP-{showClientInfo.numero}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Date</div>
                  <div className="text-lg">
                    {showClientInfo.date_attribution ? new Date(showClientInfo.date_attribution).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Nom du client</div>
                <div className="text-lg font-semibold">{showClientInfo.nom || 'N/A'}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Contact</div>
                <div className="text-lg">{showClientInfo.contact || 'N/A'}</div>
              </div>
               {/* Afficher le statut de paiement */}
               <div>
                <div className="text-sm font-medium text-gray-500">Statut Paiement</div>
                <div className="text-lg font-semibold">
                  {showClientInfo.statut_paiement === 'a_encaisser' ? 'À encaisser' : 'Payé'}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowClientInfo(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Fermer
              </button>
              <button
                onClick={handleReportPlace}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Reporter la reservation
              </button>
              <button
                onClick={() => {
                  setSelectedPlaces([showClientInfo.id]);
                  setActionType('free');
                  handleFreePlaces();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Libérer la place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceListVip;
