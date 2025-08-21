import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoitureVipSelection = ({
  voituresVip,
  voitureSelectionnee,
  setVoitureSelectionnee,
  fetchVoituresVip,
  voituresParties
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

  const [newVoiture, setNewVoiture] = useState({
    marque: '',
    modele: '',
    itineraire: '',
    date_depart: '',
    heure_depart: '',
    places: 10 // Valeur fixe initialisée à 10 pour VIP
  });

  const [editingVoiture, setEditingVoiture] = useState({
    id: null,
    marque: '',
    modele: '',
    itineraire: '',
    date_depart: '',
    heure_depart: '',
    places: 10 // Valeur fixe pour l'édition aussi
  });


  useEffect(() => {
    const fetchItineraires = async () => {
      setLoadingItineraires(true);
      try {
        const response = await fetch('http://localhost:8000/api/itineraires');
        if (!response.ok) throw new Error('Erreur de chargement des itinéraires');
        const data = await response.json();
        setItineraires(data);
      } catch (error) {
        setErrorItineraires(error.message);
      } finally {
        setLoadingItineraires(false);
      }
    };
    
    fetchItineraires();
  }, []);

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

  const handleAddVoiture = async () => {
    // Crée un nouvel objet avec les données du formulaire + 10 places forcées
    const voitureData = {
      ...newVoiture,
      places: 10 // Force 10 places pour VIP
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
        'http://localhost:8000/api/voitures-vip',
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
          places: 10 // Réinitialise à 10 pour la prochaine utilisation
        });
        fetchVoituresVip();
      }
    } catch (error) {
      console.error("Erreur :", error.response?.data || error.message);
      alert(error.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVoiture = async () => {
    // Crée un nouvel objet avec les données du formulaire + 10 places forcées
    const voitureData = {
      ...editingVoiture,
      places: 10 // Force 10 places pour VIP
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
        `http://localhost:8000/api/voitures-vip/${voitureData.id}`,
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
        fetchVoituresVip();
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
      const csrfResponse = await axios.get('/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      const response = await axios.delete(
        `/voitures-vip/${voitureToDelete.id}`,
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfResponse.data.csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        setShowDeleteDialog(false);
        fetchVoituresVip();
        if (voitureSelectionnee?.id === voitureToDelete.id) {
          setVoitureSelectionnee(null);
        }
      }
    } catch (error) {
      console.error("Erreur:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
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
      places: 10 // Force 10 places pour VIP
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Gestion des Voitures VIP</h2>
          <p className="text-gray-600">Sélectionnez une voiture VIP pour gérer ses places</p>
        </div>

        <button
          onClick={() => setShowAddDialog(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg flex items-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ajouter une voiture VIP
        </button>
      </div>

      {voituresVip.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-700">Aucune voiture VIP disponible</h3>
          <p className="mt-2 text-gray-500">Commencez par ajouter votre première voiture VIP</p>
          <button
            onClick={() => setShowAddDialog(true)}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
          >
            Ajouter une voiture VIP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voituresVip.filter(v => {
            if (!Array.isArray(voituresParties)) return true;
            const isPartie = voituresParties.some((vp) => parseInt((typeof vp === 'object' ? (vp.id ?? vp.voiture_id) : vp), 10) === v.id);
            return !isPartie;
          }).map((voiture) => {
            const isPartie = Array.isArray(voituresParties)
              ? voituresParties.some((vp) => parseInt((typeof vp === 'object' ? (vp.id ?? vp.voiture_id) : vp), 10) === voiture.id)
              : false;
            const isSelected = voitureSelectionnee?.id === voiture.id;
            return (
            <div
              key={voiture.id}
              onClick={() => setVoitureSelectionnee(voiture)}
              className={`border-2 rounded-2xl overflow-hidden transition-all ${
                isPartie ? '' : 'cursor-pointer transform hover:scale-[1.02]'
              } ${
                isSelected ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="bg-gradient-to-r from-purple-50 to-gray-50 p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`${isPartie ? 'bg-red-100' : 'bg-purple-100'} p-3 rounded-lg`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPartie ? 'text-red-600' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isPartie ? 'text-red-800' : 'text-gray-800'}`}>{voiture.marque} {voiture.modele}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${isPartie ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>{isPartie ? 'VIP — Déjà parti' : 'VIP'}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">
                    {typeof voiture.itineraire === 'object' 
                      ? JSON.stringify(voiture.itineraire)
                      : voiture.itineraire}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">
                    {formatDate(voiture.date_depart)} à {voiture.heure_depart}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700">{isPartie ? '0' : '10'} places disponibles</span>
                </div>
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <button
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : isPartie
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setVoitureSelectionnee(voiture);
                  }}
                >
                  {isPartie ? 'Déjà parti' : (isSelected ? 'Sélectionnée' : 'Sélectionner')}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(voiture);
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors ${isPartie ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
                  title={isPartie ? 'Modification non disponible' : 'Modifier'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(voiture);
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors ${isPartie ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                  title={isPartie ? 'Suppression non disponible' : 'Supprimer'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );})}
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* ... en-tête du dialog inchangé ... */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { field: 'marque', label: 'Marque', type: 'text' },
                  { field: 'modele', label: 'Modèle', type: 'text' },
                  { 
                    field: 'itineraire', 
                    label: 'Itinéraire', 
                    type: 'select',
                    options: itineraires.map(it => ({
                      value: it.itineraire,
                      label: `${it.itineraire}`
                    }))
                  },
                  { field: 'date_depart', label: 'Date de départ', type: 'date' },
                  { field: 'heure_depart', label: 'Heure de départ', type: 'time' },
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
                          value={newVoiture[field] || ''}
                          onChange={handleInputChange}
                          className={`w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
                          disabled={loadingItineraires}
                        >
                          <option value="">{loadingItineraires ? 'Chargement...' : 'Sélectionnez un itinéraire'}</option>
                          {options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={field}
                          value={field === 'places' ? 10 : newVoiture[field] || ''}
                          onChange={handleInputChange}
                          readOnly={readOnly || field === 'places'}
                          className={`w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
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
                    {field === 'itineraire' && errorItineraires && (
                      <p className="mt-1 text-sm text-red-600">{errorItineraires}</p>
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
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
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
                    'Ajouter la voiture VIP'
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
                <h3 className="text-2xl font-bold text-gray-800">Modifier la voiture VIP</h3>
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
                        value={field === 'places' ? 10 : editingVoiture[field]}
                        onChange={handleEditInputChange}
                        readOnly={readOnly || field === 'places'}
                        className={`w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
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
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
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
                  Êtes-vous sûr de vouloir supprimer la voiture VIP <span className="font-semibold">{voitureToDelete?.marque} {voitureToDelete?.modele}</span> (marque: {voitureToDelete?.marque}) ?
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

export default VoitureVipSelection;