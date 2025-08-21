import React, { useState, useEffect , useRef} from 'react';
import Sidebar from './Sidebar';
import VoitureSelection from './Voitures/VoitureSelection';
import VoitureVipSelection from './Voitures/VoitureVipSelection';
import PlaceList from './Voitures/PlaceList';
import PlaceListVip from './Voitures/PlaceListVip';
import FileAttente from './Voitures/FileAttente';
import FileAttenteVip from './Voitures/FileAttenteVip';
import Recherche from './Voitures/Recherche';
import Historique from './Voitures/Historique';
import AddClientDialog from './Voitures/AddClientDialog';
import EditPlaceDialog from './Voitures/EditPlaceDialog';
import axios from 'axios';

const VoituresPage = () => {
  // États pour les onglets
  const [activeTab, setActiveTab] = useState('normales');
  const [csrfToken, setCsrfToken] = useState(null);

  // Récupérer le token CSRF au chargement
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/csrf-token', {
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
      }
    };
    fetchCsrfToken();
  }, []);
  const [voituresParties, setVoituresParties] = useState(() => {
    try {
      const saved = localStorage.getItem('voituresParties');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  // États pour les données
  const [voitures, setVoitures] = useState([]);
  const [voituresVip, setVoituresVip] = useState([]);
  const [voitureSelectionnee, setVoitureSelectionnee] = useState(null);
  const [voitureVipSelectionnee, setVoitureVipSelectionnee] = useState(null);
  const [places, setPlaces] = useState([]);
  
  // États pour la file d'attente et historique
  const [fileAttente, setFileAttente] = useState([]);
  const [fileAttenteVip, setFileAttenteVip] = useState([]);
  const [history, setHistory] = useState([]);
  
  // États pour les dialogues
  const [showDialog, setShowDialog] = useState(false);
  const [nouveauClient, setNouveauClient] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editingPlace, setEditingPlace] = useState(null);
  const rechercheRef = useRef(null);
  // États pour la recherche
  const [showSearch, setShowSearch] = useState(false);
  useEffect(() => {
    console.log('showSearch a changé:', showSearch)
  }, [showSearch])


  const [searchCriteria, setSearchCriteria] = useState({
    dateDepart: '',
    itineraire: '',
    contactClient: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // États pour la gestion des places
  const [nombrePlacesAAjouter, setNombrePlacesAAjouter] = useState(1);

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [selectedVoiture, setSelectedVoiture] = useState(null);
  const [selectedVipPlaces, setSelectedVipPlaces] = useState([]);
  const [selectedVipVoiture, setSelectedVipVoiture] = useState(null);
  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les voitures normales et VIP
        const [resNormales, resVip] = await Promise.all([
          axios.get('http://localhost:8000/api/voitures'),
          axios.get('http://localhost:8000/api/voitures-vip')
        ]);
        setVoitures(resNormales.data);
        setVoituresVip(resVip.data);

        // Récupérer les voitures parties
        const resVoituresParties = await axios.get('http://localhost:8000/api/voitures-parties', { withCredentials: true });
        setVoituresParties(resVoituresParties.data);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      }
    };
    fetchData();
  }, []);

  const handleVoyagerClick = async (voitureId) => {
    try {
      if (!csrfToken) {
        throw new Error('Token CSRF non disponible');
      }

      // Préparer les données
      const data = {
        voiture_id: parseInt(voitureId)
      };

      // Sauvegarde dans la base de données
      const response = await axios.post('http://localhost:8000/api/voyages', data, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json'
        }
      });

      // Si la requête réussit
      if (response.status === 201) {
        // Mise à jour de l'état local
        const nouvellesVoituresParties = [...voituresParties, voitureId];
        setVoituresParties(nouvellesVoituresParties);
        localStorage.setItem("voituresParties", JSON.stringify(nouvellesVoituresParties));
      }

    } catch (error) {
      console.error('Erreur lors de la sauvegarde du voyage:', error.response?.data?.error || error.message);
      // Vous pouvez afficher un message d'erreur à l'utilisateur ici
      // Par exemple : setErrorMessage(error.response?.data?.error || error.message);
    }
  };


  const handleVoyagerVipClick = async (voitureId) => {
    try {
      if (!csrfToken) {
        throw new Error('Token CSRF non disponible');
      }

      // Préparer les données
      const data = {
        voiture_id: parseInt(voitureId)
      };

      // Sauvegarde dans la base de données
      const response = await axios.post('http://localhost:8000/api/voyages', data, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json'
        }
      });

      // Si la requête réussit
      if (response.status === 201) {
        // Mise à jour de l'état local
        const nouvellesVoituresParties = [...voituresParties, voitureId];
        setVoituresParties(nouvellesVoituresParties);
        localStorage.setItem("voituresParties", JSON.stringify(nouvellesVoituresParties));
      }

    } catch (error) {
      console.error('Erreur lors de la sauvegarde du voyage:', error.response?.data?.error || error.message);
      // Vous pouvez afficher un message d'erreur à l'utilisateur ici
      // Par exemple : setErrorMessage(error.response?.data?.error || error.message);
    }
  };

  

  // Chargement des places quand une voiture est sélectionnée
  useEffect(() => {
    const fetchPlacesData = async () => {
      const voitureId = activeTab === 'normales' 
        ? voitureSelectionnee?.id 
        : voitureVipSelectionnee?.id;
      
      if (voitureId) {
        try {
          const endpoint = activeTab === 'normales' 
            ? `http://localhost:8000/api/voitures/${voitureId}/places`
            : `http://localhost:8000/api/voitures-vip/${voitureId}/places`;
          
          const response = await axios.get(endpoint);
          setPlaces(response.data);
        } catch (error) {
          console.error("Erreur chargement places:", error);
        }
      }
    };
    fetchPlacesData();
  }, [voitureSelectionnee, voitureVipSelectionnee, activeTab]);

  // Fonction pour ajouter un client
  const ajouterClient = async (placeId, clientNom) => {
    try {
      const endpoint = activeTab === 'normales'
        ? `http://localhost:8000/api/places/${placeId}`
        : `http://localhost:8000/api/places-vip/${placeId}`;
      
      const response = await axios.put(endpoint, {
        client: clientNom,
        status: 'occupée'
      });
      
      setPlaces(places.map(place => 
        place.id === placeId ? response.data : place
      ));
      
      setHistory([...history, {
        date: new Date(),
        client: clientNom,
        voiture: (voitureSelectionnee || voitureVipSelectionnee)?.nom,
        place: placeId,
        action: 'Ajout client',
        type: activeTab === 'normales' ? 'normale' : 'vip'
      }]);
    } catch (error) {
      console.error("Erreur ajout client:", error);
    }
  };

  // Fonction pour modifier une place
  const modifierPlace = async (placeId, nouvellesDonnees) => {
    try {
      const endpoint = activeTab === 'normales'
        ? `http://localhost:8000/api/places/${placeId}`
        : `http://localhost:8000/api/places-vip/${placeId}`;
      
      const response = await axios.put(endpoint, nouvellesDonnees);
      setPlaces(places.map(place => 
        place.id === placeId ? response.data : place
      ));
    } catch (error) {
      console.error("Erreur modification place:", error);
    }
  };

  // Fonction pour effectuer une recherche
  const effectuerRecherche = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/reservations', {
        params: {
          dateDepart: searchCriteria.dateDepart || undefined,
          itineraire: searchCriteria.itineraire || undefined,
          contactClient: searchCriteria.contactClient || undefined,
          includeVip: true
        }
      });
      
      setSearchResults(response.data.map(item => ({
        id: item.id,
        date: item.date_depart,
        client: item.client_nom,
        place: item.numero_place,
        itineraire: item.itineraire,
        voitureId: item.voiture_id,
        voitureNom: item.voiture?.nom || 'Inconnue',
        type: item.type || 'normale'
      })));
      
      setShowResults(true);
    } catch (error) {
      console.error("Erreur recherche:", error);
      setSearchResults([]);
    }
  };

  // Historique: uniquement les véhicules déjà partis (sans détails client)
  useEffect(() => {
    try {
      const normalizeDepartedIds = (list) => {
        if (!list) return [];
        if (Array.isArray(list)) {
          return list
            .map((item) => (item && typeof item === 'object' ? (item.voiture_id ?? item.id) : item))
            .map((v) => parseInt(v, 10))
            .filter((n) => !Number.isNaN(n));
        }
        if (typeof list === 'object') {
          return Object.keys(list)
            .map((k) => parseInt(k, 10))
            .filter((n) => !Number.isNaN(n));
        }
        return [];
      };

      const departedIds = normalizeDepartedIds(voituresParties);
      const listNorm = Array.isArray(voitures) ? voitures : (Array.isArray(voitures?.data) ? voitures.data : []);
      const listVip = Array.isArray(voituresVip) ? voituresVip : (Array.isArray(voituresVip?.data) ? voituresVip.data : []);

      if (!departedIds.length) {
        setHistory([]);
        return;
      }

      const findVoitureById = (id) => listNorm.find((x) => x.id === id) || listVip.find((x) => x.id === id) || null;

      const hist = departedIds.map((id) => {
        const v = findVoitureById(id) || {};
        const dateRaw = v.date_depart || new Date().toISOString();
        const dateObj = new Date(dateRaw);
        const date = dateObj.toISOString();
        const heure = v.heure_depart || `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
        const marque = v.marque || '—';
        const modele = v.modele || '—';
        const voitureLib = v.immatriculation || `${marque} ${modele}`.trim();
        const itin = v.itineraire_nom || v.itineraire || '—';
        // Dans l'historique, un véhicule parti doit avoir 0 place disponible
        const places = 0;
        return {
          date,
          heure,
          itineraire: itin,
          voiture: voitureLib,
          modele,
          places,
          action: 'Déjà partie'
        };
      });

        hist.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(hist);
      } catch (e) {
      console.error('Erreur préparation historique (départs):', e);
      }
  }, [voitures, voituresVip, voituresParties]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          {/* Onglets de navigation */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'normales' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('normales');
                setShowResults(false);
              }}
            >
              Voitures Normales
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'vip' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('vip');
                setShowResults(false);
              }}
            >
              Voitures VIP
            </button>
          </div>
          
          {/* Composant Recherche */}
          <Recherche 
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            searchCriteria={searchCriteria}
            setSearchCriteria={setSearchCriteria}
            effectuerRecherche={effectuerRecherche}
            showResults={showResults}
            setShowResults={setShowResults}
            searchResults={searchResults}
            voitures={[...voitures, ...voituresVip]}
            className="mb-6"
            ref={rechercheRef} 
          />

          {/* Sélection de voiture */}
          {activeTab === 'normales' ? (
            <VoitureSelection 
            voituresParties={voituresParties}
              voitures={voitures}
              voitureSelectionnee={voitureSelectionnee}
              setVoitureSelectionnee={setVoitureSelectionnee}
              fetchVoitures={() => axios.get('http://localhost:8000/api/voitures').then(res => setVoitures(res.data))}
              className="mb-6"
            />
          ) : (
            <VoitureVipSelection 
              voituresVip={voituresVip}
              voitureSelectionnee={voitureVipSelectionnee}
              setVoitureSelectionnee={setVoitureVipSelectionnee}
              fetchVoituresVip={() => axios.get('http://localhost:8000/api/voitures-vip').then(res => setVoituresVip(res.data))}
              voituresParties={voituresParties}
              className="mb-6"
            />
          )}

          {/* Liste des places et file d'attente */}
          {(voitureSelectionnee || voitureVipSelectionnee) && (
            <div className="">
              <div className="lg:col-span-2">
                {activeTab === 'normales' ? (
                  <PlaceList 

                  onVoyagerClick={() => handleVoyagerClick(voitureSelectionnee?.id)}
                  
                    voitureSelectionnee={voitureSelectionnee}
                    places={places}
                    nombrePlacesAAjouter={nombrePlacesAAjouter}
                    setNombrePlacesAAjouter={setNombrePlacesAAjouter}
                    ajouterPlacesMultiples={async () => {
                      if (!voitureSelectionnee?.id) return;
                      
                      try {
                        const nouvellesPlaces = await Promise.all(
                          Array.from({ length: nombrePlacesAAjouter }).map(() => 
                            axios.post(`http://localhost:8000/api/voitures/${voitureSelectionnee.id}/places`, {
                              status: 'libre'
                            })
                          )
                        );
                        setPlaces([...places, ...nouvellesPlaces.map(res => res.data)]);
                      } catch (error) {
                        console.error("Erreur ajout places:", error);
                      }
                    }}
                    setEditingPlace={setEditingPlace}
                    supprimerPlace={async (placeId) => {
                      try {
                        await axios.delete(`http://localhost:8000/api/places/${placeId}`);
                        setPlaces(places.filter(place => place.id !== placeId));
                      } catch (error) {
                        console.error("Erreur suppression place:", error);
                      }
                    }}
                    setSelectedPlace={(place) => {
                      setSelectedPlace(place);
                      setShowDialog(false);
                    }}
                    onReportToQueue={(client) => {
                      setFileAttente((prev) => [...prev, client]);
                    }}
                      selectedPlaces={selectedPlaces}
                     setSelectedPlaces={setSelectedPlaces}
                     selectedVoiture={selectedVoiture}
                     setSelectedVoiture={setSelectedVoiture}
                     setShowSearch={setShowSearch} 
                  />
                ) : (
                  <PlaceListVip 
                    onVoyagerVipClick={() => handleVoyagerVipClick(voitureVipSelectionnee?.id)}
                    voitureSelectionnee={voitureVipSelectionnee}
                    places={places}
                    nombrePlacesAAjouter={nombrePlacesAAjouter}
                    setNombrePlacesAAjouter={setNombrePlacesAAjouter}
                    ajouterPlacesMultiples={async () => {
                      if (!voitureVipSelectionnee?.id) return;
                      
                      try {
                        const nouvellesPlaces = await Promise.all(
                          Array.from({ length: nombrePlacesAAjouter }).map(() => 
                            axios.post(`http://localhost:8000/api/voitures-vip/${voitureVipSelectionnee.id}/places`, {
                              status: 'libre'
                            })
                          )
                        );
                        setPlaces([...places, ...nouvellesPlaces.map(res => res.data)]);
                      } catch (error) {
                        console.error("Erreur ajout places VIP:", error);
                      }
                    }}
                    setEditingPlace={setEditingPlace}
                    supprimerPlace={async (placeId) => {
                      try {
                        await axios.delete(`http://localhost:8000/api/places-vip/${placeId}`);
                        setPlaces(places.filter(place => place.id !== placeId));
                      } catch (error) {
                        console.error("Erreur suppression place VIP:", error);
                      }
                    }}
                    setSelectedPlace={(place) => {
                      setSelectedPlace(place);
                      setShowDialog(false);
                      setSelectedVipPlaces(prev => [...prev, place.id]);
                      setSelectedVipVoiture(voitureVipSelectionnee?.id);
                    }}

                    selectedPlaces={selectedPlaces}
                    setSelectedPlaces={setSelectedPlaces}
                    selectedVoiture={selectedVoiture}
                    setSelectedVoiture={setSelectedVoiture}
                    setShowSearch={setShowSearch} 
                    onReportToQueue={(client) => setFileAttenteVip(prev => [...prev, client])}
                  />
                )}
              </div>
              
              <div className="lg:col-span-1">
  {activeTab === 'normales' ? (
    <FileAttente 
      fileAttente={fileAttente}
      setFileAttente={setFileAttente}
      selectedPlaces={selectedPlaces}
      showSearch={showSearch}  // <-- Doit être connecté au state
      setShowSearch={setShowSearch}
      selectedVoiture={voitureSelectionnee?.id}
      refreshPlaces={() => {
        if (voitureSelectionnee?.id) {
          axios.get(`http://localhost:8000/api/voitures/${voitureSelectionnee.id}/places`)
            .then(res => setPlaces(res.data));
        }
      }}
      onAddClient={(client) => {
        if (selectedPlace) {
          ajouterClient(selectedPlace.id, client);
        }
      }}
    />
  ) : (
    <FileAttenteVip 
      fileAttente={fileAttenteVip}
      setFileAttente={setFileAttenteVip}
      selectedPlaces={selectedVipPlaces}
      showSearch={showSearch}
      setShowSearch={setShowSearch}
      selectedVoiture={voitureVipSelectionnee?.id}
      refreshPlaces={() => {
        if (voitureVipSelectionnee?.id) {
          axios.get(`http://localhost:8000/api/voitures-vip/${voitureVipSelectionnee.id}/places`)
            .then(res => setPlaces(res.data));
        }
      }}
      onAddClient={(client) => {
        if (selectedPlace) {
          ajouterClient(selectedPlace.id, client);
        }
      }}
    />
  )}
</div>
            </div>
          )}

          {/* Historique: afficher les véhicules partis */}
          <Historique 
            history={history}
            title="Historique des départs"
            enableFilters={true}
            maxItems={100}
            onDelete={(idx) => setHistory(prev => prev.filter((_, i) => i !== idx))}
            className="bg-white rounded-lg shadow p-4"
          />
        </div>
      </div>

      {/* Dialogues modaux */}
      <AddClientDialog 
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        nouveauClient={nouveauClient}
        setNouveauClient={setNouveauClient}
        onAddClient={(client) => {
          if (selectedPlace) {
            ajouterClient(selectedPlace.id, client);
          }
          setNouveauClient('');
        }}
        onAddToQueue={(client) => {
          setFileAttente([...fileAttente, {
            id: Date.now(),
            nom: client,
            date: new Date()
          }]);
          setNouveauClient('');
        }}
      />

      <EditPlaceDialog 
        editingPlace={editingPlace}
        setEditingPlace={setEditingPlace}
        isVip={activeTab === 'vip'}
        onSave={(nouvellesDonnees) => {
          if (editingPlace) {
            modifierPlace(editingPlace.id, nouvellesDonnees);
          }
        }}
      />
    </div>
  );
};

export default VoituresPage;
export { VoituresPage };