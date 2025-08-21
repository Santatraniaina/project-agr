import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const VoitureSelection = ({
  voitures,
  voitureSelectionnee,
  setVoitureSelectionnee,
  fetchVoitures,
  fetchPlacesData,
  voituresParties,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [voitureToDelete, setVoitureToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itineraires, setItineraires] = useState([]);
  const [loadingItineraires, setLoadingItineraires] = useState(false);
  const [errorItineraires, setErrorItineraires] = useState(null);
  
  // États pour la pagination
  
  // --- AJOUT POUR LE DÉBOGAGE ---
  console.log('Voitures reçues dans le composant VoitureSelection:', voitures.length);
  
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;

  const [newVoiture, setNewVoiture] = useState({
    marque: '',
    modele: '',
    itineraire: '',
    date_depart: '',
    heure_depart: '',
    places: 16 // Valeur fixe initialisée à 16
  });

  const [editingVoiture, setEditingVoiture] = useState({
    id: null,
    marque: '',
    modele: '',
    itineraire: '',
    date_depart: '',
    heure_depart: '',
    places: 16 // Valeur fixe pour l'édition aussi
  });

  // Normaliser la forme de voituresParties (id simples, objets, ou map d'ids)
  const departedIds = useMemo(() => {
    try {
      if (!voituresParties) return [];
      if (Array.isArray(voituresParties)) {
        if (voituresParties.length > 0 && typeof voituresParties[0] === 'object') {
          return voituresParties
            .map((item) => item?.id ?? item?.voiture_id)
            .filter((id) => typeof id === 'number' || (typeof id === 'string' && id.trim() !== ''))
            .map((id) => parseInt(id, 10))
            .filter((n) => !Number.isNaN(n));
        }
        return voituresParties
          .map((id) => parseInt(id, 10))
          .filter((n) => !Number.isNaN(n));
      }
      if (typeof voituresParties === 'object') {
        return Object.keys(voituresParties)
          .map((k) => parseInt(k, 10))
          .filter((n) => !Number.isNaN(n));
      }
      return [];
    } catch {
      return [];
    }
  }, [voituresParties]);

  // Sécuriser la liste voitures (gère payloads type {data: []} ou [])
  const voituresList = useMemo(() => {
    if (Array.isArray(voitures)) return voitures;
    if (Array.isArray(voitures?.data)) return voitures.data;
    return [];
  }, [voitures]);

  // Logique de pagination: masquer les voitures déjà parties
  const carsForDisplay = useMemo(() => {
    try {
      return (voituresList || []).filter((v) => !departedIds.includes(v.id));
    } catch {
      return voituresList || [];
    }
  }, [voituresList, departedIds]);
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = carsForDisplay.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil((carsForDisplay.length || 0) / carsPerPage) || 1;

  // Garder la page courante dans des bornes valides quand la liste change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Empêche la modification du nombre de places
    if (name === 'places') return;
    
    setNewVoiture(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    // Empêche la modification du nombre de places
    if (name === 'places') return;
    
    setEditingVoiture(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = (formData) => {
    const errors = {};
    const requiredFields = [
      'marque',
      'modele',
      'itineraire',
      'date_depart',
      'heure_depart'
      // 'places' n'est plus requis car fixe
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'Ce champ est requis';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const fetchItineraires = async () => {
    setLoadingItineraires(true);
    setErrorItineraires(null);
    try {
      const response = await fetch('http://localhost:8000/api/itineraires');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des itinéraires');
      }
      const data = await response.json();
      console.log('itineraire:',data);
      setItineraires(data);
    } catch (error) {
      setErrorItineraires(error.message);
      console.error("Erreur lors du chargement des itinéraires", error);
    } finally {
      setLoadingItineraires(false);
    }
  };

  useEffect(() => {
    fetchItineraires();
  }, []);

  const handleAddVoiture = async () => {
    const voitureData = {
      ...newVoiture,
      places: 16 // Force 16 places
    };

    if (!validateForm(voitureData)) return;

    setIsSubmitting(true);

    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;

      const response = await axios.post(
        'http://localhost:8000/api/voitures',
        voitureData,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setShowAddDialog(false);
        setNewVoiture({
          marque: '',
          modele: '',
          itineraire: '',
          date_depart: '',
          heure_depart: '',
          places: 16
        });
        fetchVoitures();
      }
    } catch (error) {
      console.error("Erreur :", error.response?.data || error.message);
      alert(error.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVoiture = async () => {
    const voitureData = {
      ...editingVoiture,
      places: 16
    };

    if (!validateForm(voitureData)) return;

    setIsSubmitting(true);

    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;

      const formattedVoiture = {
        ...voitureData,
        date_depart: voitureData.date_depart?.slice(0, 10),
        heure_depart: voitureData.heure_depart?.slice(0, 5),
      };

      const response = await axios.put(
        `http://localhost:8000/api/voitures/${voitureData.id}`,
        formattedVoiture,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setShowEditDialog(false);
        fetchVoitures();
        if (voitureSelectionnee?.id === voitureData.id) {
          setVoitureSelectionnee(response.data);
        }
      }
    } catch (error) {
      console.error("Erreur :", error.response?.data || error.message);
      alert(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVoiture = async () => {
    setIsSubmitting(true);
  
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      const csrfToken = csrfResponse.data.csrfToken;
      
      const response = await axios.delete(
        `http://localhost:8000/api/voitures/${voitureToDelete.id}`,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
          }
        }
      );
  
      if (response.status === 200) {
        setShowDeleteDialog(false);
        fetchVoitures();
        if (voitureSelectionnee?.id === voitureToDelete.id) {
          setVoitureSelectionnee(null);
        }
      }
    } catch (error) {
      console.error("Erreur :", error.response?.data || error.message);
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (voiture) => {
    setEditingVoiture({
      id: voiture.id,
      marque: voiture.marque,
      modele: voiture.modele,
      itineraire: voiture.itineraire,
      date_depart: voiture.date_depart,
      heure_depart: voiture.heure_depart,
      places: 16
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (voiture) => {
    setVoitureToDelete(voiture);
    setShowDeleteDialog(true);
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleSelectVoiture = (voiture) => {
    setVoitureSelectionnee(voiture);
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Gestion des Voitures</h2>
          <p className="text-gray-600">Sélectionnez une voiture pour gérer ses places</p>
        </div>

        <button
          onClick={() => setShowAddDialog(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg flex items-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ajouter une voiture
        </button>
      </div>

      {voituresList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-700">Aucune voiture disponible</h3>
          <p className="mt-2 text-gray-500">Commencez par ajouter votre première voiture</p>
          <button
            onClick={() => setShowAddDialog(true)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Ajouter une voiture
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCars.map((voiture) => {
              const isPartie = departedIds.includes(voiture.id);
              const isSelected = voitureSelectionnee?.id === voiture.id;
              
              return (
                <div
                  key={voiture.id}
                  onClick={() => handleSelectVoiture(voiture)}
                  className={`border-2 rounded-xl overflow-hidden transition-all relative ${
                    isPartie
                      ? ''
                      : 'transform hover:scale-[1.02]'
                  } ${
                    isSelected
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className={`p-4 border-b ${
                    isPartie 
                      ? 'bg-red-50 border-red-100' 
                      : 'bg-gradient-to-r from-blue-50 to-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        isPartie ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" 
                          className={`h-6 w-6 ${
                            isPartie ? 'text-red-600' : 'text-blue-600'
                          }`} 
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${
                          isPartie ? 'text-red-800' : 'text-gray-800'
                        }`}>
                          {voiture.marque} {voiture.modele}
                        </h3>
                      </div>
                    </div>
                  </div>
          
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-gray-400" 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">
                        {voiture.itineraire_nom || voiture.itineraire}
                      </span>
                    </div>
          
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-gray-400" 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">
                        {formatDate(voiture.date_depart)} à {voiture.heure_depart}
                      </span>
                    </div>
          
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-gray-400" 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700">
                        {isPartie ? '0' : '16'} places disponibles
                      </span>
                    </div>
                  </div>
          
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isPartie
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVoiture(voiture);
                      }}
                    >
                      {isPartie ? 'Déjà parti' : (isSelected ? 'Sélectionnée' : 'Sélectionner')}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        !isPartie && openEditDialog(voiture);
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isPartie
                          ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={isPartie ? "Modification non disponible" : "Modifier"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        !isPartie && openDeleteDialog(voiture);
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isPartie
                          ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={isPartie ? "Suppression non disponible" : "Supprimer"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contrôles de pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {(() => {
                const pageNumbers = [];
                const pageRange = 1; // Pages à afficher de chaque côté de la page actuelle
                const ellipsis = '...';

                // Toujours afficher la première page
                pageNumbers.push(1);

                // Ellipse si nécessaire après la première page
                if (currentPage > pageRange + 2) {
                  pageNumbers.push(ellipsis);
                }

                // Pages autour de la page actuelle
                const startPage = Math.max(2, currentPage - pageRange);
                const endPage = Math.min(totalPages - 1, currentPage + pageRange);

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i);
                }

                // Ellipse si nécessaire avant la dernière page
                if (currentPage < totalPages - pageRange - 1) {
                  pageNumbers.push(ellipsis);
                }

                // Toujours afficher la dernière page (si elle n'est pas déjà là)
                if (totalPages > 1) {
                  pageNumbers.push(totalPages);
                }

                return [...new Set(pageNumbers)].map((number, index) =>
                  number === ellipsis ? (
                    <span key={`${ellipsis}-${index}`} className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-500">...</span>
                  ) : (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 sm:px-4 py-2 border text-sm font-medium rounded-md ${ currentPage === number ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50' }`}
                    >{number}</button>
                  )
                );
              })()}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      {/* Les modals (Add, Edit, Delete) restent inchangés */}
      {/* Modal d'ajout */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Ajouter une nouvelle voiture</h3>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { 
                    field: 'itineraire', 
                    label: 'Itinéraire', 
                    type: 'select',
                    options: itineraires.map(it => ({
                      value: it.itineraire,
                      label: `${it.itineraire}`
                    }))
                  },
                  { field: 'heure_depart', label: 'Heure de départ', type: 'time' },
                  { 
                    field: 'marque', 
                    label: 'Marque', 
                    type: 'select',
                    options: [
                      { value: 'Sprinter', label: 'Sprinter' },
                      { value: 'Crafter', label: 'Crafter' }
                    ]
                  },
                  { field: 'date_depart', label: 'Date de départ', type: 'date' },
                  { field: 'modele', label: 'Modèle', type: 'text' },
                  { 
                    field: 'places', 
                    label: 'Nombre de places', 
                    type: 'number', 
                    colSpan: 'md:col-span-2',
                    readOnly: true
                  }
                ].map(({ field, label, type, colSpan, readOnly, options }) => (
                  <div key={field} className={colSpan || ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} {field !== 'places' && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      {type === 'select' ? (
                        <select
                          name={field}
                          value={newVoiture[field]}
                          onChange={handleInputChange}
                          className={`w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                        >
                          <option value="">Sélectionnez {field === 'marque' ? 'une marque' : 'un itinéraire'}</option>
                          {options.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={field}
                          value={field === 'places' ? 16 : newVoiture[field]}
                          onChange={handleInputChange}
                          readOnly={readOnly || field === 'places'}
                          className={`w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            field === 'places' ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      )}
                      {formErrors[field] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {formErrors[field] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddVoiture}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : (
                    'Ajouter la voiture'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Modifier la voiture</h3>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { field: 'marque', label: 'Marque', type: 'text' },
                  { field: 'modele', label: 'Modèle', type: 'text' },
                  { field: 'itineraire', label: 'Itinéraire', type: 'text' },
                  { field: 'date_depart', label: 'Date de départ', type: 'date' },
                  { field: 'heure_depart', label: 'Heure de départ', type: 'time' },
                  { 
                    field: 'places', 
                    label: 'Nombre de places', 
                    type: 'number', 
                    colSpan: 'md:col-span-2',
                    readOnly: true
                  }
                ].map(({ field, label, type, colSpan, readOnly }) => (
                  <div key={field} className={colSpan || ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} {field !== 'places' && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={type}
                        name={field}
                        value={field === 'places' ? 16 : editingVoiture[field]}
                        onChange={handleEditInputChange}
                        readOnly={readOnly || field === 'places'}
                        className={`w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          field === 'places' ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      />
                      {formErrors[field] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {formErrors[field] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditVoiture}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Confirmer la suppression</h3>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Êtes-vous sûr de vouloir supprimer la voiture <span className="font-semibold">{voitureToDelete?.marque} {voitureToDelete?.modele}</span> (marque: {voitureToDelete?.marque}) ?
                </p>
                <p className="text-red-600 mt-2 font-medium">Cette action est irréversible.</p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteVoiture}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    'Confirmer la suppression'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoitureSelection;