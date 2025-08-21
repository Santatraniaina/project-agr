import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FiPrinter } from 'react-icons/fi';
import jsPDF from 'jspdf';

// Import des images de paiement (celles-ci peuvent rester dans src/assets)
import orangeIcon from '../../assets/orange.png';
import mvolaIcon from '../../assets/mvola.png';
import airtelIcon from '../../assets/airtel.png';

// SOLUTION : Utilisation du chemin depuis le dossier "public"
// Assurez-vous d'avoir déplacé "att-logo.jpg" dans le dossier "public" à la racine de votre projet.
const attLogo = '/att-logo.png';

// Configuration de axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete'].includes(config.method)) {
    if (!apiClient.defaults.headers.common['X-CSRF-TOKEN']) {
      try {
        const csrfResponse = await apiClient.get('/csrf-token');
        apiClient.defaults.headers.common['X-CSRF-TOKEN'] = csrfResponse.data.csrfToken;
        config.headers['X-CSRF-TOKEN'] = csrfResponse.data.csrfToken;
      } catch (error) {
        console.error("Échec de la récupération du jeton CSRF :", error);
      }
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur API :', error.response);
    return Promise.reject(error);
  }
);

// Composant pour le volant
const SteeringWheel = ({ className }) => (
  <div className={`relative ${className || ''} print-steering-wheel-colors`}>
    <div className="w-48 h-48 relative">
      <div className="absolute inset-0 rounded-full border-[10px] border-gray-800"></div>
      <div className="absolute inset-[30%] rounded-full bg-gray-800"></div>
      <div className="absolute top-1/2 left-[15%] right-[15%] h-[10px] bg-gray-800 transform -translate-y-1/2"></div>
    </div>
    <div className="absolute left-1/2 bottom-0 w-[4px] h-20 bg-gray-800 transform -translate-x-1/2"></div>
  </div>
);

const PlaceManagement = ({
  selectedPlaces,
  setSelectedPlaces,
  selectedVoiture,
  setSelectedVoiture,
  setShowSearch,
  onVoyagerClick,
  voitureSelectionnee,
  onReportToQueue,
}) => {
  // États
  const [voitures, setVoitures] = useState([]);
  const [places, setPlaces] = useState({});
  const [selectionMode, setSelectionMode] = useState('single');
  const [showDialog, setShowDialog] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    contact: '',
    arret: '',
    payment_type: 'cash',
    mobile_money_operator: 'orange'
  });
  const [loading, setLoading] = useState({ voitures: true, places: false });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showClientInfo, setShowClientInfo] = useState(null);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [actionType, setActionType] = useState('assign');
  const [text, setText] = useState("");
  const [voituresParties, setVoituresParties] = useState(() => {
    try {
      const saved = localStorage.getItem("voituresParties");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [receiptNumber, setReceiptNumber] = useState(1000);
  const [printMode, setPrintMode] = useState(false);
  const [printReceiptMode, setPrintReceiptMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showConfirmationImage, setShowConfirmationImage] = useState(false);
  const isDeparted = useMemo(() => {
    return selectedVoiture ? voituresParties.includes(selectedVoiture) : false;
  }, [voituresParties, selectedVoiture]);
  const availableVoitures = useMemo(() => {
    try {
      return (voitures || []).filter(v => !voituresParties.includes(v.id));
    } catch {
      return voitures || [];
    }
  }, [voitures, voituresParties]);

  // Fonction de validation du formulaire
  const isFormValid = useCallback(() => {
    return (
      clientInfo.nom.trim() !== '' &&
      clientInfo.contact.trim() !== '' &&
      clientInfo.payment_type !== null &&
      (clientInfo.payment_type !== 'mobile_money' || clientInfo.mobile_money_operator !== null) &&
      selectedPlaces.length > 0 &&
      !loading.places
    );
  }, [clientInfo, selectedPlaces, loading.places]);

  // Fonction de validation des champs individuels
  const getFieldError = useCallback((fieldName) => {
    switch (fieldName) {
      case 'nom':
        return !clientInfo.nom.trim() ? 'Le nom du client est obligatoire' : null;
      case 'contact':
        return !clientInfo.contact.trim() ? 'Le contact du client est obligatoire' : null;
      case 'payment_type':
        return !clientInfo.payment_type ? 'Veuillez sélectionner un mode de paiement' : null;
      case 'mobile_money_operator':
        return (clientInfo.payment_type === 'mobile_money' && !clientInfo.mobile_money_operator) 
          ? 'Veuillez sélectionner un opérateur mobile money' : null;
      case 'places':
        return selectedPlaces.length === 0 ? 'Veuillez sélectionner au moins une place' : null;
      default:
        return null;
    }
  }, [clientInfo, selectedPlaces]);

  useEffect(() => {
    localStorage.setItem("voituresParties", JSON.stringify(voituresParties));
  }, [voituresParties]);

  // Fonction de pagination
  const paginate = useCallback((array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }, []);

  // Effets
  useEffect(() => {
    const fetchVoitures = async () => {
      setLoading(prev => ({ ...prev, voitures: true }));
      try {
        const response = await apiClient.get('/voitures');
        setVoitures(response.data.data || response.data || []);
      } catch (error) {
        setError('Erreur lors du chargement des voitures');
        console.error('Erreur fetchVoitures:', error);
      } finally {
        setLoading(prev => ({ ...prev, voitures: false }));
      }
    };
    fetchVoitures();
  }, []);

  useEffect(() => {
    if (selectedVoiture) {
      fetchPlaces(selectedVoiture);
    }
  }, [selectedVoiture]);

  // Synchroniser la sélection depuis le composant parent (VoitureSelection)
  useEffect(() => {
    if (voitureSelectionnee?.id && selectedVoiture !== voitureSelectionnee.id) {
      setSelectedVoiture(voitureSelectionnee.id);
    }
  }, [voitureSelectionnee, selectedVoiture, setSelectedVoiture]);

  useEffect(() => {
    if (selectedVoiture && places && places[selectedVoiture]) {
      const count = places[selectedVoiture].filter(p => p.status === 'occupé').length;
      setOccupiedCount(count);
    } else {
      setOccupiedCount(0);
    }
  }, [places, selectedVoiture]);

  // Fonctions
  const generateReceiptNumber = useCallback(() => {
    const newNumber = receiptNumber + 1;
    setReceiptNumber(newNumber);
    return newNumber;
  }, [receiptNumber]);

  const generateReceiptPDF = useCallback((client, place, voiture, receiptNum) => {
    try {
      const doc = new jsPDF({
        unit: 'mm',
        format: [80, 150]
      });

      // Couleurs
      const primaryColor = [0, 0, 0];
      const secondaryColor = [100, 100, 100];

      // En-tête
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text("RECU DE RESERVATION", 40, 12, { align: 'center' });
      
      // Ligne séparatrice
      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.2);
      doc.line(15, 18, 65, 18);

      // Informations de base
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text(`N°: ${receiptNum}`, 22, 23);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 22, 27);
      doc.text(`Heure: ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`, 22, 31);

      // Section Client
      doc.setFillColor(240, 240, 240);
      doc.rect(5, 35, 70, 8, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text("INFORMATIONS CLIENT", 40, 40, { align: 'center' });

      // Détails client
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nom: ${client.nom || 'Non renseigné'}`, 10, 47);
      doc.text(`Contact: ${client.contact || 'Non renseigné'}`, 10, 52);
      doc.text(`Arret: ${client.arret || 'Non renseigné'}`, 10, 57);

      // Section Voyage
      doc.setFillColor(240, 240, 240);
      doc.rect(5, 63, 70, 8, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("DETAILS DU VOYAGE", 40, 68, { align: 'center' });

      // Détails voyage
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Itinéraire: ${voiture.itineraire}`, 10, 75);
      doc.text(`Place: N° ${place.numero}`, 10, 80);
      doc.text(`Véhicule: ${voiture.modele}`, 10, 85);
      doc.text(`Immatriculation: ${voiture.immatriculation || 'Non renseigné'}`, 10, 90);

      // Code-barres simulé
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 100, 60, 100);
      doc.line(20, 102, 60, 102);
      doc.line(20, 104, 60, 104);

      // Pied de page
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text("Merci pour votre confiance !", 40, 115, { align: 'center' });
      doc.text("Présentez ce reçu à l'embarquement", 40, 120, { align: 'center' });
      doc.setFontSize(6);
      doc.text("Reçu valable uniquement avec pièce d'identité", 40, 125, { align: 'center' });

      // Bordure
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.rect(2, 2, 76, 146);

      doc.save(`recu_reservation_${receiptNum}.pdf`);
    } catch (pdfError) {
      console.error("Erreur lors de la génération du PDF :", pdfError);
      setError("L'attribution a réussi, mais le reçu PDF n'a pas pu être généré.");
    }
  }, []);

  const fetchPlaces = useCallback(async (voitureId) => {
    if (!voitureId) {
      console.warn('fetchPlaces appelé sans voitureId');
      return;
    }

    setLoading(prev => ({ ...prev, places: true }));
    setError(null);

    try {
      console.log('Récupération des places pour la voiture:', voitureId);
      
      const response = await apiClient.get(`/voitures/${voitureId}/places`);
      console.log('Réponse fetchPlaces:', response.data);
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Réponse serveur invalide pour les places');
      }

      const { data: placesData, details = {} } = response.data;
      
      // Validation des données reçues
      if (!placesData || typeof placesData !== 'object') {
        throw new Error('Données des places invalides');
      }

      const placesArray = Array.from({ length: 16 }, (_, i) => {
        const placeNum = i + 1;
        const placeKey = `place_${placeNum}`;
        const isOccupied = Boolean(placesData[placeKey]);
        const placeDetail = details[placeKey] || {};
        
        return {
          id: placeNum,
          numero: placeNum,
          status: isOccupied ? 'occupé' : 'libre',
          nom: placeDetail.nom || '',
          contact: placeDetail.contact || '',
          arret: placeDetail.arret || '',
          payment_type: placeDetail.payment_type || null,
          mobile_money_operator: placeDetail.mobile_money_operator || null,
          date_attribution: placeDetail.date_attribution || null,
          voiture_id: isOccupied ? voitureId : null,
          receipt_number: placeDetail.receipt_number || null
        };
      });

      console.log('Places formatées:', placesArray);
      
      setPlaces(prev => ({
        ...prev,
        [voitureId]: placesArray
      }));
      
      // Mise à jour du compteur de places occupées
      const occupiedCount = placesArray.filter(p => p.status === 'occupé').length;
      setOccupiedCount(occupiedCount);
      
    } catch (error) {
      console.error('Erreur fetchPlaces:', { 
        error: error.message, 
        response: error.response?.data,
        voitureId 
      });
      
      // Création de places par défaut en cas d'erreur
      const fallbackPlaces = Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        numero: i + 1,
        status: 'libre',
        nom: '',
        contact: '',
        arret: '',
        payment_type: null,
        mobile_money_operator: null,
        date_attribution: null,
        voiture_id: null,
        receipt_number: null
      }));
      
      setPlaces(prev => ({
        ...prev,
        [voitureId]: fallbackPlaces
      }));
      
      // Mise à jour du compteur
      setOccupiedCount(0);
      
      // Affichage de l'erreur appropriée
      let errorMessage = 'Erreur de chargement des places';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 404:
            errorMessage = 'Voiture non trouvée';
            break;
          case 500:
            errorMessage = 'Erreur serveur lors du chargement des places';
            break;
          default:
            errorMessage = data?.message || `Erreur ${status}: ${error.message}`;
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur';
      } else {
        errorMessage = error.message || 'Erreur inconnue';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, places: false }));
    }
  }, []);

  const handleSelectPlace = useCallback((placeId) => {
    if (isDeparted) {
      return;
    }
    const place = places[selectedVoiture]?.find(p => p.id === placeId);
    if (place?.status === 'occupé' && place.voiture_id === selectedVoiture) {
      setShowClientInfo({ ...place });
      setSelectedPlaces([place.id]);
      return;
    }
    setSelectedPlaces(prev => {
      return selectionMode === 'single'
        ? [placeId]
        : prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId];
    });
  }, [places, selectedVoiture, selectionMode, isDeparted]);

  const handleSubmit = useCallback(async () => {
    try {
      if (isDeparted) {
        setError('Véhicule déjà parti. Modifications interdites.');
        return;
      }
      // Validation des champs obligatoires
      if (!clientInfo.nom.trim()) {
        setError('Le nom du client est obligatoire');
        return;
      }
      
      if (!clientInfo.contact.trim()) {
        setError('Le contact du client est obligatoire');
        return;
      }

      if (!clientInfo.payment_type) {
        setError('Veuillez sélectionner un mode de paiement');
        return;
      }

      if (clientInfo.payment_type === 'mobile_money' && !clientInfo.mobile_money_operator) {
        setError('Veuillez sélectionner un opérateur mobile money');
        return;
      }

      if (selectedPlaces.length === 0) {
        setError('Veuillez sélectionner au moins une place');
        return;
      }

      if (!selectedVoiture) {
        setError('Aucune voiture sélectionnée');
        return;
      }

      setLoading(prev => ({ ...prev, places: true }));
      setError(null);

      const receiptNum = generateReceiptNumber();
      
      const payload = {
        voiture_id: selectedVoiture,
        places: selectedPlaces,
        nom: clientInfo.nom.trim(),
        contact: clientInfo.contact.trim(),
        arret: clientInfo.arret?.trim() || '',
        payment_type: clientInfo.payment_type,
        mobile_money_operator: clientInfo.payment_type === 'mobile_money' ? clientInfo.mobile_money_operator : null,
        receipt_number: receiptNum
      };

      console.log('Envoi des données:', payload);

      const response = await apiClient.post('/places', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Réponse reçue:', response.data);

      // Vérification de la réponse
      if (response.data && (response.data.success || response.data.message === 'Places attribuées avec succès')) {
        setSuccessMessage('Attribution réussie');
        setShowDialog(false);
        setShowConfirmationImage(true);
        
        // Masquer l'image de confirmation après 3 secondes
        setTimeout(() => {
          setShowConfirmationImage(false);
        }, 3000);
        
        // Réinitialisation des états
        setClientInfo({
          nom: '',
          contact: '',
          arret: '',
          payment_type: 'cash',
          mobile_money_operator: 'orange'
        });
        setSelectedPlaces([]);
        
        const voitureData = voitures.find(v => v.id === selectedVoiture);
        const placeData = {
          numero: selectedPlaces[0],
          ...response.data.placeDetails
        };
        
        // Générer le reçu PDF
        try {
          generateReceiptPDF(
            {
              nom: payload.nom,
              contact: payload.contact,
              arret: payload.arret,
              payment_type: payload.payment_type,
              mobile_money_operator: payload.mobile_money_operator
            },
            placeData,
            voitureData,
            receiptNum
          );
        } catch (pdfError) {
          console.error("Erreur lors de la génération du PDF :", pdfError);
          // Ne pas bloquer le processus si le PDF échoue
        }
        
        // Rafraîchir les places
        await fetchPlaces(selectedVoiture);
      } else {
        throw new Error(response.data?.message || 'Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      
      // Gestion spécifique des erreurs
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 409:
            if (data.occupied_places && Array.isArray(data.occupied_places)) {
              setError(`Places déjà occupées: ${data.occupied_places.join(', ')}`);
            } else {
              setError('Une ou plusieurs places sont déjà occupées');
            }
            break;
          case 422:
            setError(data.message || 'Données invalides. Vérifiez vos informations.');
            break;
          case 500:
            setError(`Erreur serveur: ${data.error || 'Veuillez réessayer'}`);
            break;
          default:
            setError(data.message || `Erreur ${status}: Veuillez réessayer`);
        }
      } else if (error.request) {
        setError('Erreur réseau: Impossible de contacter le serveur');
      } else {
        setError(error.message || 'Erreur inconnue lors de la soumission');
      }
      
      // Rafraîchir les places en cas d'erreur
      try {
        await fetchPlaces(selectedVoiture);
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement des places:', refreshError);
      }
    } finally {
      setLoading(prev => ({ ...prev, places: false }));
    }
  }, [clientInfo, selectedPlaces, selectedVoiture, voitures, generateReceiptNumber, generateReceiptPDF, fetchPlaces, isDeparted]);

  const handleFreePlaces = useCallback(async (overridePlaceId = null) => {
    if (isDeparted) {
      alert('Véhicule déjà parti. Libération interdite.');
      return;
    }
    
    // FORCER la libération d'une seule place - IGNORER la sélection multiple
    if (!overridePlaceId) {
      alert("Erreur : ID de place requis pour la libération. Veuillez sélectionner une place spécifique.");
      return;
    }
    
    if (typeof selectedVoiture !== 'number' || isNaN(selectedVoiture)) {
      alert("ID de voiture invalide");
      return;
    }
    
    try {
      // Toujours libérer une seule place spécifique
      const placeToFree = parseInt(overridePlaceId, 10);
      
      if (isNaN(placeToFree)) {
        alert("ID de place invalide");
        return;
      }
      
      const payload = {
        voiture_id: selectedVoiture,
        places: [placeToFree] // Toujours un seul élément
      };
      
      // Debug: vérifier la place libérée
      console.log('Free place payload (FORCÉ SIMPLE):', {
        voiture_id: selectedVoiture,
        places: [placeToFree],
        message: 'Libération forcée d\'une seule place'
      });
      
      const response = await apiClient.post(
        '/free-places',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        const successCount = response.data.results.filter(r => r.success).length;
        const errorCount = response.data.results.length - successCount;
        
        let message = `Place ${placeToFree} libérée avec succès`;
        if (errorCount > 0) {
          message += `\n${errorCount} erreur(s)`;
          response.data.results.forEach(result => {
            if (!result.success) {
              message += `\n- Place ${result.place_num}: ${result.message}`;
            }
          });
        }
        
        alert(message);
        await fetchPlaces(selectedVoiture);
        
        // Réinitialiser la sélection multiple après libération
        setSelectedPlaces([]);
        setShowClientInfo(null);
        setError(null);
      } else {
        throw new Error(response.data.message || "Erreur inconnue lors de la libération");
      }
    } catch (error) {
      console.error('Erreur lors de la libération:', error);
      alert(`Erreur lors de la libération:\n${error.message}`);
    }
  }, [selectedVoiture, fetchPlaces, isDeparted]);

  const handleReportPlace = useCallback(async (overridePlaceId = null) => {
    try {
      // Déterminer l'id effectif (forcer unitaire)
      const effectiveId = overridePlaceId ?? (selectedPlaces.length > 0 ? selectedPlaces[0] : null);
      await handleFreePlaces(effectiveId);
      
      setShowClientInfo(null);
      setSelectedPlaces([]);
      
      setSuccessMessage("Place libérée et reportée avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      if (typeof setShowSearch === 'function') {
        setShowSearch(true);
      }
      // Ajouter le client dans la file d'attente si demandé
      if (typeof onReportToQueue === 'function') {
        onReportToQueue({
          id: Date.now(),
          nom: showClientInfo?.nom || 'Client',
          contact: showClientInfo?.contact || 'Non renseigné',
          nbre_place: 1, // Par défaut 1 place
          date: new Date().toISOString().split('T')[0],
          heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          place: effectiveId || showClientInfo?.id || null,
          voiture_id: selectedVoiture,
          is_vip: false // Marquer comme non-VIP
        });
      }
      
      setTimeout(() => {
        const rechercheElement = document.getElementById('recherche-section');
        if (rechercheElement) {
          rechercheElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error("Erreur lors du report:", error);
      setError("Erreur lors du report de la place");
      setTimeout(() => setError(null), 3000);
    }
  }, [handleFreePlaces, setShowSearch]);

  const handlePrintManifold = useCallback(() => {
    setPrintMode(true); 
    setPrintReceiptMode(false);
    document.body.classList.add('print-manifold-active');
    document.body.classList.remove('print-receipt-active');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintMode(false);
        document.body.classList.remove('print-manifold-active');
      }, 500);
    }, 100);
  }, []);

  const handlePrintReceipt = useCallback(() => {
    if (!showClientInfo) {
      setError("Aucun client sélectionné pour imprimer le reçu.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setPrintReceiptMode(true);
    setPrintMode(false);
    document.body.classList.add('print-receipt-active');
    document.body.classList.remove('print-manifold-active');
    
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintReceiptMode(false);
        document.body.classList.remove('print-receipt-active');
        setSuccessMessage("Reçu imprimé avec succès");
        setTimeout(() => setSuccessMessage(null), 3000);
      }, 500);
    }, 100);
  }, [showClientInfo]);

  // Mémoisation des valeurs calculées
  const currentPlaces = useMemo(() => 
    selectedVoiture ? places[selectedVoiture] || [] : [], 
    [selectedVoiture, places]
  );
  
  const selectedVoitureData = useMemo(() => 
    voitures.find(v => v.id === selectedVoiture), 
    [voitures, selectedVoiture]
  );
  
  const freePlaces = useMemo(() => 
    Math.max(0, 16 - occupiedCount), 
    [occupiedCount]
  );

  const PlaceButton = useCallback(({ place }) => {
    if (!place) return null;

    const isOccupied = place.status === 'occupé';
    const isCurrentCar = place.voiture_id === selectedVoiture;
    const isSelected = selectedPlaces.includes(place.id);

    const dossierBaseClass = "w-44 bg-gray-500 rounded-t-lg mb-1 relative";
    const dossierHeightClass = printMode ? "h-[28rem]" : "h-[30rem]";
    const dossierClass = `${dossierBaseClass} ${dossierHeightClass}`;

    const assiseBaseClass = "w-44 bg-gray-500 rounded-b-lg relative";
    const assiseHeightClass = printMode ? "h-14" : "h-16";
    const assiseClass = `${assiseBaseClass} ${assiseHeightClass}`;

    return (
      <div className={`relative ${printMode ? 'place-button-print' : ''}`}>
        {place.numero === 3 && !printMode && (
          <div className={`absolute left-1/2 -top-52 transform -translate-x-1/2 z-10 translate-x-1`}>
            <SteeringWheel />
          </div>
        )}
        <button
          onClick={() => handleSelectPlace(place.id)}
          disabled={isOccupied && !isCurrentCar}
          className={`w-43 h-48 p-3 rounded-lg flex flex-col items-center justify-center
            relative transition-all duration-200 border-2 
            ${printMode
              ? `print-mode-button-styles-override ${isOccupied && !isCurrentCar ? 'opacity-70' : ''}`
              : `border-[#DAA520] ${isOccupied
                ? (isCurrentCar ? "bg-[#F4D03F] hover:bg-[#F1C40F]" : "bg-[#F4D03F] cursor-not-allowed opacity-70")
                : (isSelected ? "bg-[#F4D03F]" : "bg-[#F4D03F] hover:bg-[#F1C40F]")}`
            }
          `}
        >
          <div className="w-full h-full flex flex-col items-center relative">
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className={dossierClass}>
                <div className={`absolute inset-[3px] border rounded-t-lg ${printMode ? 'border-gray-500' : 'border-gray-500'}`}>
                  <div className={`absolute top-6 left-2 right-2 h-[2px] ${printMode ? 'bg-gray-400' : 'bg-gray-400'}`}></div>
                  <div className={`absolute top-9 left-2 right-2 h-[2px] ${printMode ? 'bg-gray-400' : 'bg-gray-400'}`}></div>
                  <div className={`absolute top-18 left-2 right-2 h-[2px] ${printMode ? 'bg-gray-400' : 'bg-gray-400'}`}></div>
                </div>
                {isOccupied && (
                  <div className={`absolute inset-x-2 transform -translate-y-1/2 bg-white/90 py-0 px-4 rounded text-center ${printMode ? 'print-client-name-container-print' : 'top-[35%]'}`}>
                    <span className={`text-[13px] font-semibold tracking-tight block max-w-[120px] ${printMode ? 'print-client-details-text' : ''}`}>
                      {place.nom || 'Client'}
                    </span>
                  </div>
                )}
                {isOccupied && (
                  <div className={`absolute inset-x-2 transform -translate-y-1/2 bg-white/90 py-0 px-4 rounded text-center ${printMode ? 'print-client-contact-container-print' : 'top-[55%]'}`}>
                    <span className={`text-[13px] font-semibold tracking-tight block max-w-[120px] ${printMode ? 'print-client-details-text' : ''}`}>
                      {place.contact || 'Contact'}
                    </span>
                  </div>
                )}
                {isOccupied && (
                  <div className={`absolute inset-x-2 transform -translate-y-1/2 bg-white/90 py-0 px-4 rounded text-center ${printMode ? 'print-client-arret-container-print' : 'top-[75%]'}`}>
                    <span className={`text-[13px] font-semibold tracking-tight block max-w-[120px] ${printMode ? 'print-client-details-text' : ''}`}>
                      {place.arret || ''}
                    </span>
                  </div>
                )}
                {isOccupied && place.payment_type && !printMode && (
                  <div className="absolute bottom-2 right-2">
                    {place.payment_type === 'cash' ? (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        {/* Billet principal */}
                        <rect x="3" y="6" width="18" height="12" rx="2" fill="#10B981"/>
                        <rect x="4" y="7" width="16" height="10" rx="1" fill="#ECFDF5"/>
                        
                        {/* Lignes de sécurité */}
                        <rect x="6" y="9" width="12" height="1" fill="#10B981"/>
                        <rect x="6" y="11" width="12" height="1" fill="#10B981"/>
                        <rect x="6" y="13" width="8" height="1" fill="#10B981"/>
                        
                        {/* Symbole dollar - Correction de l'erreur SVG */}
                        <circle cx="18" cy="8" r="2" fill="#10B981"/>
                        <circle cx="18" cy="8" r="1.5" fill="white"/>
                        <circle cx="18" cy="8" r="0.8" fill="#10B981"/>
                        
                        {/* Motif de fond */}
                        <circle cx="7" cy="8" r="0.5" fill="#10B981"/>
                        <circle cx="9" cy="8" r="0.5" fill="#10B981"/>
                        <circle cx="11" cy="8" r="0.5" fill="#10B981"/>
                      </svg>
                    ) : place.payment_type === 'mobile_money' && place.mobile_money_operator ? (
                      <img
                        src={
                          place.mobile_money_operator === 'orange' ? orangeIcon :
                          place.mobile_money_operator === 'mvola' ? mvolaIcon :
                          place.mobile_money_operator === 'airtel' ? airtelIcon : orangeIcon
                        }
                        alt={`${place.mobile_money_operator} Money`}
                        className="w-6 h-6"
                      />
                    ) : null}
                  </div>
                )}
              </div>
              <div className={assiseClass}>
                <div className={`absolute inset-[3px] border rounded-b-lg ${printMode ? 'border-gray-700' : 'border-gray-700'}`}>
                  <div className={`absolute top-1/2 left-3 right-3 h-[1px] ${printMode ? 'bg-gray-600' : 'bg-gray-600'}`}></div>
                </div>
              </div>
            </div>
            <span className={`absolute left-1/2 transform -translate-x-1/2 font-bold
                               ${printMode ? 'print-seat-number-text-print' : 'text-white text-2xl drop-shadow-md top-0'}`}>
              {place.numero}
            </span>
          </div>
          {isOccupied && isCurrentCar && !printMode && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          )}
          {isOccupied && isSelected && !printMode && (
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-blue-400 rounded-full border border-white"></div>
          )}
          {isOccupied && isSelected && !printMode && (
            <div className="absolute bottom-5 right-2 w-2 h-2 bg-blue-400 rounded-full border border-white"></div>
          )}
        </button>
      </div>
    )
  }, [printMode, selectedVoiture, selectedPlaces, handleSelectPlace]);

  if (loading.voitures) return <div className="flex justify-center items-center h-screen no-print"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className={`max-w-6xl mx-auto p-4 ${printMode ? 'print-section manifold-active' : ''} ${printReceiptMode ? 'no-print' : ''}`}>
  <style jsx>{`
  @media print {
    body * { visibility: hidden; }
    .no-print { display: none !important; }
    
    .print-section.manifold-active, .print-section.manifold-active * {
      visibility: visible;
    }
    .print-section.manifold-active {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 0.5cm;
      margin: 0;
    }

    /* Nouveau style pour l'en-tête avec logo à gauche */
    .ticket-header-print {
      display: flex !important;
      flex-direction: row !important;
      align-items: flex-start !important;
      margin-bottom: 15px !important;
      width: 100% !important;
      border: none !important;
      background-color: transparent !important;
      padding: 0 !important;
      gap: 20px !important;
    }

    .ticket-header-print img {
      width: 120px !important;
      height: auto !important;
      margin: 0 !important;
      align-self: flex-start !important;
      flex-shrink: 0 !important;
    }

    .ticket-header-print .header-content {
      text-align: center !important;
      flex: 1 !important;
      padding-top: 5px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      margin-left: -40px !important;
    }

    .ticket-header-print h1 {
      font-size: 1.2rem !important;
      margin-bottom: 6px !important;
      color: #000 !important;
      font-weight: bold !important;
      text-align: center !important;
    }

    .ticket-header-print p {
      font-size: 0.8rem !important;
      margin-bottom: 3px !important;
      color: #333 !important;
      line-height: 1.3 !important;
      text-align: center !important;
    }

    .receipt-print-area, .receipt-print-area * {
      visibility: visible;
    }
    .receipt-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .places-render-area-print {
      transform: scale(0.75);
      transform-origin: top center; 
    }

    .print-corridor-row-container { display: flex !important; justify-content: center !important; align-items: center !important; width: 100% !important; }
    .print-corridor-row-container > .flex { gap: 1.5rem !important; }
    .print-corridor-space { width: 28% !important; flex-shrink: 0 !important; }
    
    .print-row1-layout { display: flex !important; justify-content: center !important; align-items: center !important; width: 150%  height: 150%!important; gap: 6rem !important; }
    .print-steering-wheel-inline { transform: scale(0.8); flex-shrink: 0; margin-right: 1cm; margin-left: 3cm; }
    .print-steering-wheel-colors .border-gray-800 { border-color: #1F2937 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .print-steering-wheel-colors .bg-gray-800 { background-color: #1F2937 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .print-aisle-space-row1 { width: 1.5cm !important; flex-shrink: 0 !important; }
    .print-row1-layout > .flex { gap: 1.5rem !important;margin-left: -3.5cm; }

    .print-mode-button-styles-override { border-color: #DAA520 !important; background-color: #F4D03F !important; color: black !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .print-mode-button-styles-override.opacity-70 { opacity: 0.7 !important; }
    .place-button-print .bg-white\\/90 { background-color: rgba(255, 255, 255, 0.9) !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .place-button-print .print-client-details-text {
      font-size: 18px !important;
      line-height: 0.9 !important; 
      color: #000 !important;
      max-width: 90% !important; 
      overflow-wrap: break-word !important; 
    }
    .place-button-print .print-client-name-container-print {
      top: 35% !important;
      transform: translateY(-50%) !important;
    }
    .place-button-print .print-client-contact-container-print {
      top: 55% !important;
      transform: translateY(-50%) !important;
    }
    .place-button-print .print-client-arret-container-print {
      top: 75% !important;
      transform: translateY(-50%) !important;
    }
    .place-button-print .print-seat-number-text-print {
      font-size: 2rem !important;
      line-height: 2rem !important;
      color: white !important;
      font-weight: bold !important;
      position: absolute !important;
      top: 0 !important; left: 50% !important; transform: translateX(-50%) !important; 
      text-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); 
      print-color-adjust: exact; -webkit-print-color-adjust: exact; 
    }
    .print-center-container { 
      display: flex;
      flex-direction: column; 
      align-items: center; 
    }

    body.print-manifold-active {
      @page {
        size: A4 landscape;
        margin: 0.5cm;
      }
    }
    body.print-receipt-active {
      @page {
        size: 80mm auto; 
        margin: 3mm 5mm; 
      }
    }
    @page {
      size: A4; 
      margin: 1cm;
    }
  }
`}</style>

{printMode && selectedVoitureData && (
  <div className="ticket-header-print">
    <img 
      src={attLogo} 
      alt="ATT Logo" 
      style={{
        width: '120px',
        height: 'auto'
      }} 
    />
    <div className="header-content">
      <h1>Manifold des Places</h1>
      <p><strong>Voiture:</strong> {selectedVoitureData.marque} {selectedVoitureData.modele} ({selectedVoitureData.immatriculation})</p>
      <p><strong>Trajet:</strong> {selectedVoitureData.itineraire}</p>
      <p><strong>Date de départ:</strong> {new Date(selectedVoitureData.date_depart).toLocaleString()}</p>
      <p>Date d'impression: {new Date().toLocaleString()}</p>
    </div>
  </div>
)}

      {error && !printReceiptMode && (
        <div className={`mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r ${printMode ? 'no-print' : ''}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => setError(null)} 
                className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && !printReceiptMode && (
        <div className={`mb-2 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-r ${printMode ? 'no-print' : ''}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => setSuccessMessage(null)} 
                className="inline-flex text-green-400 hover:text-green-600 focus:outline-none focus:text-green-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmationImage && !printReceiptMode && (
        <div className={`mb-4 p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center ${printMode ? 'no-print' : ''}`}>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Place attribuée avec succès !</h3>
              <p className="text-green-700">La réservation a été enregistrée et le reçu a été généré.</p>
            </div>
          </div>
        </div>
      )}

      <div className={`mb-8 ${printMode || printReceiptMode ? 'no-print' : ''}`}>
        <h2 className="text-lg font-semibold mb-3">Sélectionnez une voiture</h2>
        {!selectedVoiture ? (
          <div className="text-center py-4 text-gray-600">
            Utilisez la section Gestion des Voitures au-dessus pour choisir un véhicule. Les places s'afficheront ici.
                  </div>
        ) : null}
      </div>

      {selectedVoiture && (
        <>
          <div className={`mb-6 p-4 bg-gray-50 rounded-lg ${printMode || printReceiptMode ? 'no-print' : ''}`}>
            <h2 className="text-lg font-semibold mb-3">Mode de sélection</h2>
            {isDeparted && (
              <div className="mb-3 p-2 rounded bg-red-50 text-red-700 text-sm">
                Véhicule déjà parti — consultation uniquement (verrouillé)
              </div>
            )}
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

          <div className={`mb-8 ${printMode ? 'print-center-container' : ''}`}>
            {!printMode && !printReceiptMode && (
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  Places pour {selectedVoitureData?.marque} - {selectedVoitureData?.itineraire}
                </h2>
                {loading.places && (
                  <span className="text-sm text-gray-500">Chargement...</span>
                )}
              </div>
            )}

            {loading.places && !printMode && !printReceiptMode ? (
              <div className="flex justify-center py-8 no-print">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className={`flex flex-col items-center ${printMode ? 'places-render-area-print space-y-4' : 'space-y-8'}`}>
                {/* Ligne 1 - Volant + places 1 et 2 */}
                <div className={`flex justify-center items-center w-full ${printMode ? 'print-row1-layout' : 'gap-0'}`}>
                  {!printMode && <div className={`w-10 shrink-0`}></div>}
                  {printMode && (
                    <>
                      <SteeringWheel className="print-steering-wheel-inline" />
                      <div className="print-aisle-space-row1"></div>
                    </>
                  )}
                  <div className={`flex ${printMode ? 'gap-x-6' : 'gap-6 max-w-10'}`}>
                    {currentPlaces.slice(0, 2).map((place) => (<PlaceButton key={place.id} place={place} />))}
                  </div>
                </div>

                {/* Ligne 2 - places 3,4,5,6 */}
                <div className="flex justify-center gap-6 w-full">
                  {currentPlaces.slice(2, 6).map((place) => (<PlaceButton key={place.id} place={place} />))}
                </div>

                {/* Ligne 3 - places 7,8 [couloir] 9 */}
                <div className={`flex justify-center items-center w-full ${printMode ? 'print-corridor-row-container' : 'gap-10'}`}>
                  <div className={`flex ${printMode ? 'gap-x-6' : 'gap-5 mr-28 ml-24 -translate-x-24'}`}>
                    {currentPlaces.slice(6, 8).map(place => (<PlaceButton key={place.id} place={place} />))}
                  </div>
                  {printMode && <div className="print-corridor-space"></div>}
                  {currentPlaces[8] && <PlaceButton place={currentPlaces[8]} />}
                </div>

                {/* Ligne 4 - places 10,11 [couloir] 12 */}
                <div className={`flex justify-center items-center w-full ${printMode ? 'print-corridor-row-container' : 'gap-10'}`}>
                  <div className={`flex ${printMode ? 'gap-x-6' : 'gap-4 mr-28 ml-24 -translate-x-24'}`}>
                    {currentPlaces.slice(9, 11).map(place => (<PlaceButton key={place.id} place={place} />))}
                  </div>
                  {printMode && <div className="print-corridor-space"></div>}
                  {currentPlaces[11] && <PlaceButton place={currentPlaces[11]} />}
                </div>

                {/* Ligne 5 - places 13,14,15,16 */}
                <div className="flex justify-center gap-6 w-full">
                  {currentPlaces.slice(12, 16).map((place) => (<PlaceButton key={place.id} place={place} />))}
                </div>
              </div>
            )}
          </div>

          <div className={`flex flex-col sm:flex-row justify-center gap-4 ${printMode || printReceiptMode ? 'no-print' : ''}`}>
            <button
              onClick={() => {
                setActionType('assign');
                setShowDialog(true);
                setError(null); // Nettoyer les erreurs précédentes
                setSuccessMessage(null); // Nettoyer les messages de succès
              }}
              disabled={selectedPlaces.length === 0 ||
                currentPlaces.some(p => selectedPlaces.includes(p.id) && p.status === 'occupé')}
              className={`px-6 py-2 rounded-lg text-white font-medium ${selectedPlaces.length > 0 &&
                !currentPlaces.some(p => selectedPlaces.includes(p.id) && p.status === 'occupé')
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              Attribuer {selectedPlaces.length} place(s)
            </button>

            <button
              onClick={handlePrintManifold}
              disabled={!selectedVoiture || currentPlaces.length === 0}
              className={`px-6 py-2 rounded-lg text-white font-medium ${(!selectedVoiture || currentPlaces.length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              Imprimer
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
                if (typeof onVoyagerClick === 'function' && occupiedCount === 16) {
                  onVoyagerClick();
                  if (selectedVoiture && !voituresParties.includes(selectedVoiture)) {
                    setVoituresParties(prev => [...prev, selectedVoiture]);
                  }
                } else if (occupiedCount !== 16) {
                  alert("La voiture n'est pas encore pleine.");
                }
                else {
                  console.error("La prop onVoyagerClick n'est pas une fonction");
                }
              }}
              disabled={occupiedCount !== 16}
              className={`px-6 py-2 rounded-lg text-white font-medium ${occupiedCount === 16 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Voyager ({occupiedCount}/16)
            </button>
          </div>
        </>
      )}

      {showDialog && actionType === 'assign' && !printMode && !printReceiptMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-3">Attribution des places</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={clientInfo.nom}
                  onChange={(e) => setClientInfo({ ...clientInfo, nom: e.target.value })}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    clientInfo.nom.trim() ? 'border-green-300' : 'border-gray-300'
                  }`}
                  required
                />
                {!clientInfo.nom.trim() && (
                  <div className="mt-1 text-xs text-red-500">
                    ⚠️ Le nom du client est obligatoire
                  </div>
                )}
                {getFieldError('nom') && (
                  <div className="mt-1 text-xs text-red-500">
                    ⚠️ {getFieldError('nom')}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact *
                </label>
                <input
                  type="text"
                  value={clientInfo.contact}
                  onChange={(e) => setClientInfo({ ...clientInfo, contact: e.target.value })}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    clientInfo.contact.trim() ? 'border-green-300' : 'border-gray-300'
                  }`}
                  required
                />
                {!clientInfo.contact.trim() && (
                  <div className="mt-1 text-xs text-red-500">
                    ⚠️ Le contact du client est obligatoire
                  </div>
                )}
                {getFieldError('contact') && (
                  <div className="mt-1 text-xs text-red-500">
                    ⚠️ {getFieldError('contact')}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrêt <span className="text-gray-500 text-xs">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={clientInfo.arret}
                  onChange={(e) => setClientInfo({ ...clientInfo, arret: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ex: Arrêt principal, Gare routière..."
                />
                {clientInfo.arret && clientInfo.arret.trim().length < 3 && (
                  <div className="mt-1 text-xs text-yellow-600">
                    💡 L'arrêt doit contenir au moins 3 caractères
                  </div>
                )}
              </div>
              
              {/* Section Paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Paiement en espèces */}
                  <div
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${
                      clientInfo.payment_type === 'cash'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setClientInfo(prev => ({ 
                      ...prev, 
                      payment_type: 'cash',
                      mobile_money_operator: null 
                    }))}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        {/* Billet principal */}
                        <rect x="3" y="6" width="18" height="12" rx="2" fill="#10B981"/>
                        <rect x="4" y="7" width="16" height="10" rx="1" fill="#ECFDF5"/>
                        
                        {/* Lignes de sécurité */}
                        <rect x="6" y="9" width="12" height="1" fill="#10B981"/>
                        <rect x="6" y="11" width="12" height="1" fill="#10B981"/>
                        <rect x="6" y="13" width="8" height="1" fill="#10B981"/>
                        
                        {/* Symbole dollar - Correction de l'erreur SVG */}
                        <circle cx="18" cy="8" r="2" fill="#10B981"/>
                        <circle cx="18" cy="8" r="1.5" fill="white"/>
                        <circle cx="18" cy="8" r="0.8" fill="#10B981"/>
                        
                        {/* Motif de fond */}
                        <circle cx="7" cy="8" r="0.5" fill="#10B981"/>
                        <circle cx="9" cy="8" r="0.5" fill="#10B981"/>
                        <circle cx="11" cy="8" r="0.5" fill="#10B981"/>
                      </svg>
                      <span className="font-medium text-xs text-center">Espèces</span>
                    </div>
                  </div>

                  {/* Orange Money */}
                  <div
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${
                      clientInfo.payment_type === 'mobile_money' && clientInfo.mobile_money_operator === 'orange'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setClientInfo(prev => ({ 
                      ...prev, 
                      payment_type: 'mobile_money',
                      mobile_money_operator: 'orange'
                    }))}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <img src={orangeIcon} alt="Orange Money" className="w-8 h-8" />
                      <span className="font-medium text-xs text-center">Orange</span>
                    </div>
                  </div>

                  {/* Mvola */}
                  <div
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${
                      clientInfo.payment_type === 'mobile_money' && clientInfo.mobile_money_operator === 'mvola'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setClientInfo(prev => ({ 
                      ...prev, 
                      payment_type: 'mobile_money',
                      mobile_money_operator: 'mvola'
                    }))}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <img src={mvolaIcon} alt="Mvola" className="w-8 h-8" />
                      <span className="font-medium text-xs text-center">Mvola</span>
                    </div>
                  </div>

                  {/* Airtel Money */}
                  <div
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${
                      clientInfo.payment_type === 'mobile_money' && clientInfo.mobile_money_operator === 'airtel'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setClientInfo(prev => ({ 
                      ...prev, 
                      payment_type: 'mobile_money',
                      mobile_money_operator: 'airtel'
                    }))}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <img src={airtelIcon} alt="Airtel Money" className="w-8 h-8" />
                      <span className="font-medium text-xs text-center">Airtel</span>
                    </div>
                  </div>
                </div>
                
                {/* Message d'erreur pour mobile money */}
                {getFieldError('mobile_money_operator') && (
                  <div className="mt-2 text-sm text-red-600">
                    ⚠️ {getFieldError('mobile_money_operator')}
                  </div>
                )}
              </div>

              <div className="p-2 bg-gray-50 rounded text-sm">
                <h3 className="font-medium mb-1">Récapitulatif</h3>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p><span className="font-medium">Voiture:</span> {selectedVoitureData?.immatriculation}</p>
                  <p><span className="font-medium">Trajet:</span> {selectedVoitureData?.itineraire}</p>
                  <p><span className="font-medium">Places:</span> {selectedPlaces.map(p => `P${p}`).join(', ')}</p>
                  <p><span className="font-medium">Paiement:</span> {
                    clientInfo.payment_type === 'cash'
                      ? 'Espèces'
                      : clientInfo.payment_type === 'mobile_money' && clientInfo.mobile_money_operator
                      ? `${clientInfo.mobile_money_operator.charAt(0).toUpperCase() + clientInfo.mobile_money_operator.slice(1)} Money`
                      : 'Non sélectionné'
                  }</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowDialog(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`px-3 py-1.5 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isFormValid()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading.places ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>En cours...</span>
                  </div>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClientInfo && (
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 
                        ${printReceiptMode ? 'receipt-print-area' : `bg-black bg-opacity-50 ${printMode ? 'no-print' : ''}`}
                      `}>
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${printReceiptMode ? 'receipt-content-print' : ''}`}>
            {printReceiptMode && (
              <h2 className="receipt-title">Reçu Réservation</h2>
            )}
            {!printReceiptMode && (
              <h2 className="text-xl font-bold mb-4 text-center text-blue-600">Détails de la réservation</h2>
            )}

            <div className="space-y-1">
              <div className={`detail-item ${printReceiptMode ? '' : 'grid grid-cols-2 gap-4'}`}>
                <div className={`${printReceiptMode ? '' : 'bg-gray-50 p-3 rounded-lg'}`}>
                  <span className="detail-label">Place:</span>
                  <span className={`detail-value ${printReceiptMode ? '' : 'text-lg font-semibold text-blue-700'}`}> P{showClientInfo.numero}</span>
                </div>
                <div className={`${printReceiptMode ? '' : 'bg-gray-50 p-3 rounded-lg'}`}>
                  <span className="detail-label">Date:</span>
                  <span className={`detail-value ${printReceiptMode ? '' : 'text-lg'}`}> {showClientInfo.date_attribution ? new Date(showClientInfo.date_attribution).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
              <div className={`detail-item ${printReceiptMode ? '' : 'bg-gray-50 p-3 rounded-lg'}`}>
                <span className="detail-label">Nom:</span>
                <span className={`detail-value ${printReceiptMode ? '' : 'text-lg font-semibold'}`}> {showClientInfo.nom || 'N/A'}</span>
              </div>
              <div className={`detail-item ${printReceiptMode ? '' : 'bg-gray-50 p-3 rounded-lg'}`}>
                <span className="detail-label">Contact:</span>
                <span className={`detail-value ${printReceiptMode ? '' : 'text-lg break-all'}`}> {showClientInfo.contact || 'N/A'}</span>
              </div>
              <div className={`detail-item ${printReceiptMode ? '' : 'bg-gray-50 p-3 rounded-lg'}`}>
                <span className="detail-label">Arrêt:</span>
                <span className={`detail-value ${printReceiptMode ? '' : 'text-lg font-size'}`}> {showClientInfo.arret || ''}</span>
              </div>
              
              <div className={`detail-item ${printReceiptMode ? '' : 'bg-gray-50 p-3 rounded-lg'}`}>
                <span className="detail-label">Paiement:</span>
                <div className={`detail-value ${printReceiptMode ? '' : 'text-lg'} flex items-center space-x-2`}>
                  {showClientInfo.payment_type === 'cash' ? (
                    <>
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        {/* Billet principal */}
                        <rect x="3" y="6" width="18" height="12" rx="2" fill="#10B981"/>
                        <rect x="4" y="7" width="16" height="10" rx="1" fill="#ECFDF5"/>
                        
                        {/* Lignes de sécurité */}
                        <rect x="6" y="9" width="12" height="1" fill="#10B981"/>
                        <rect x="6" y="11" width="12" height="1" fill="#10B981"/>
                        <rect x="6" y="13" width="8" height="1" fill="#10B981"/>
                        
                        {/* Symbole dollar - Correction de l'erreur SVG */}
                        <circle cx="18" cy="8" r="2" fill="#10B981"/>
                        <circle cx="18" cy="8" r="1.5" fill="white"/>
                        <circle cx="18" cy="8" r="0.8" fill="#10B981"/>
                        
                        {/* Motif de fond */}
                        <circle cx="7" cy="8" r="0.5" fill="#10B981"/>
                        <circle cx="9" cy="8" r="0.5" fill="#10B981"/>
                        <circle cx="11" cy="8" r="0.5" fill="#10B981"/>
                      </svg>
                      <span>Espèces</span>
                    </>
                  ) : showClientInfo.payment_type === 'mobile_money' && showClientInfo.mobile_money_operator ? (
                    <>
                      <img
                        src={
                          showClientInfo.mobile_money_operator === 'orange' ? orangeIcon :
                          showClientInfo.mobile_money_operator === 'mvola' ? mvolaIcon :
                          showClientInfo.mobile_money_operator === 'airtel' ? airtelIcon : orangeIcon
                        }
                        alt={`${showClientInfo.mobile_money_operator} Money`}
                        className="w-6 h-6"
                      />
                      <span>{showClientInfo.mobile_money_operator?.toUpperCase()} Money</span>
                    </>
                  ) : (
                    <span>Non renseigné</span>
                  )}
                </div>
              </div>

              {selectedVoitureData && printReceiptMode && (
                <>
                  <div className="detail-item" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
                    <span className="detail-label">Voiture:</span>
                    <span className="detail-value"> {selectedVoitureData.marque} {selectedVoitureData.modele} ({selectedVoitureData.immatriculation})</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trajet:</span>
                    <span className="detail-value"> {selectedVoitureData.itineraire}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Départ:</span>
                    <span className="detail-value"> {new Date(selectedVoitureData.date_depart).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className={`mt-6 flex flex-wrap justify-end gap-3 ${printMode || printReceiptMode ? 'no-print' : ''}`}>
              <button
                onClick={() => setShowClientInfo(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center gap-2"
              >
                <FiPrinter />
                <span>Ticket</span>
              </button>
              <button
                onClick={() => handleReportPlace(showClientInfo?.id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
              >
                Reporter
              </button>
              <button
                onClick={() => {
                  setSelectedPlaces([showClientInfo.id]);
                  handleFreePlaces(showClientInfo.id);
                  setActionType('free');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Libérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceManagement;